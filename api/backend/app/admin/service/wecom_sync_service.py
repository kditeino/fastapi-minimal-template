"""
企业微信通讯录同步服务

通过 SSH 隧道访问 us-01 上的 wecom-proxy，
将企业微信的部门和成员同步到系统的部门管理和用户管理中。
"""

import re
from dataclasses import dataclass

import httpx
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.admin.crud.crud_dept import dept_dao
from backend.app.admin.crud.crud_role import role_dao
from backend.app.admin.crud.crud_user import user_dao
from backend.app.admin.model import Dept, Role, User
from backend.app.admin.schema.dept import CreateDeptParam
from backend.app.admin.schema.user import AddUserParam
import bcrypt

from backend.app.admin.utils.password_security import get_hash_password
from backend.common.exception import errors

# wecom-proxy 配置
WECOM_PROXY_URL = "http://154.219.104.230:9100"
WECOM_PROXY_SECRET = "kdit-wecom-proxy-2026"


@dataclass
class WecomDept:
    id: int
    name: str
    parentid: int
    order: int


@dataclass
class WecomMember:
    userid: str
    name: str
    alias: str
    department: list[int]
    position: str
    status: int
    mobile: str


@dataclass
class SyncResult:
    dept_created: int = 0
    dept_updated: int = 0
    role_created: int = 0
    user_created: int = 0
    user_updated: int = 0
    user_disabled: int = 0
    errors: list[str] | None = None

    def __post_init__(self):
        if self.errors is None:
            self.errors = []


class WecomSyncService:
    """企业微信同步服务"""

    def __init__(self):
        self._http = httpx.AsyncClient(timeout=30)

    async def _call_proxy(self, endpoint: str) -> dict:
        """调用 wecom-proxy API"""
        url = f"{WECOM_PROXY_URL}{endpoint}"
        headers = {"Authorization": f"Bearer {WECOM_PROXY_SECRET}"}

        try:
            resp = await self._http.get(url, headers=headers)
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPError as e:
            raise errors.ServerError(msg=f"调用企微代理失败: {e}")

    async def fetch_departments(self) -> list[WecomDept]:
        """获取企业微信部门列表"""
        data = await self._call_proxy("/departments")
        return [
            WecomDept(
                id=d["id"],
                name=d["name"],
                parentid=d["parentid"],
                order=d["order"],
            )
            for d in data.get("departments", [])
        ]

    async def fetch_members(self) -> list[WecomMember]:
        """获取企业微信成员列表（根部门递归）"""
        data = await self._call_proxy("/department/1/members?fetch_child=1")
        return [
            WecomMember(
                userid=m["userid"],
                name=m["name"],
                alias=m["alias"],
                department=m["department"],
                position=m["position"],
                status=m["status"],
                mobile=m["mobile"],
            )
            for m in data.get("members", [])
        ]

    async def sync_departments(self, db: AsyncSession) -> tuple[int, int]:
        """
        同步部门

        返回: (创建数, 更新数)
        """
        wecom_depts = await self.fetch_departments()
        created, updated = 0, 0

        # 按层级排序，确保父部门先创建
        wecom_depts.sort(key=lambda d: (d.parentid, d.id))

        for wd in wecom_depts:
            # 根部门 parentid=0，映射到系统的 parent_id=None
            parent_id = wd.parentid if wd.parentid > 0 else None

            existing = await dept_dao.get(db, wd.id)
            if existing:
                # 更新现有部门
                if existing.name != wd.name or existing.parent_id != parent_id:
                    await db.execute(
                        update(Dept)
                        .where(Dept.id == wd.id)
                        .values(name=wd.name, parent_id=parent_id, sort=wd.order)
                    )
                    updated += 1
            else:
                # 创建新部门，直接使用企微的部门 ID
                dept = Dept(
                    name=wd.name,
                    sort=wd.order,
                    parent_id=parent_id,
                    status=1,
                )
                # 手动设置 ID（绕过自增）
                dept.id = wd.id
                db.add(dept)
                created += 1

        await db.flush()
        return created, updated

    async def sync_roles(self, db: AsyncSession) -> tuple[int, dict[str, Role]]:
        """
        根据企微成员岗位同步角色

        返回: (创建数, 岗位到角色的映射)
        """
        wecom_members = await self.fetch_members()
        created = 0
        position_role_map: dict[str, Role] = {}

        # 收集所有唯一岗位
        positions = {m.position.strip() for m in wecom_members if m.position.strip()}

        for position in positions:
            existing = await role_dao.get_by_name(db, position)
            if existing:
                position_role_map[position] = existing
            else:
                # 创建新角色
                role = Role(name=position, status=1, remark=f"企微岗位自动创建")
                db.add(role)
                await db.flush()
                position_role_map[position] = role
                created += 1

        await db.flush()
        return created, position_role_map

    @staticmethod
    def _compute_alias_base(nickname: str | None, username: str) -> str:
        """
        计算 login_alias 基础值(未做唯一性检查)

        规则:
        1. 昵称里提取最长的 ASCII 字母连续段(≥2 字符),如 `杨志朋（Leo）` → `Leo`、
           `海豚爱旅行 Olivia` → `Olivia`、`袁乐乐Lyn` → `Lyn`、`Eino` → `Eino`
        2. 否则退化为 username,并去掉可能重复的 `kdit` 前缀(如 `kditlydia` → `lydia`)
        """
        text = (nickname or '').strip()
        if text:
            runs = re.findall(r'[A-Za-z][A-Za-z0-9]*', text)
            longest = max(runs, key=len) if runs else ''
            if len(longest) >= 2:
                return f'kdit-{longest}'

        uname = username or ''
        if uname.lower().startswith('kdit') and len(uname) > 4:
            uname = uname[4:]
        return f'kdit-{uname}'

    async def _resolve_login_alias(
        self, db: AsyncSession, nickname: str, username: str, own_user_id: int | None
    ) -> str:
        """
        计算 login_alias,冲突时追加 username 保证唯一

        :param db: 数据库会话
        :param nickname: 昵称
        :param username: 企微 userid (用于冲突去重后缀)
        :param own_user_id: 当前用户 id(更新场景);为 None 表示新建
        """
        base = self._compute_alias_base(nickname, username)
        stmt = select(User.id).where(User.login_alias == base)
        if own_user_id is not None:
            stmt = stmt.where(User.id != own_user_id)
        occupied = (await db.execute(stmt)).scalar_one_or_none()
        if occupied is None:
            return base
        return f'{base}-{username}'

    async def sync_users(
        self,
        db: AsyncSession,
        default_password: str = "123456",
        position_role_map: dict[str, Role] | None = None,
    ) -> tuple[int, int, int]:
        """
        同步用户

        :param db: 数据库会话
        :param default_password: 新用户默认密码
        :param position_role_map: 岗位到角色的映射
        :return: (创建数, 更新数, 禁用数)
        """
        wecom_members = await self.fetch_members()
        created, updated, disabled = 0, 0, 0

        for wm in wecom_members:
            # name 是真实姓名，alias 是昵称/英文名
            real_name = wm.name
            nickname = wm.alias if wm.alias else wm.name
            # 企微 userid 作为用户名
            username = wm.userid
            # 取第一个部门作为主部门
            dept_id = wm.department[0] if wm.department else None
            # 企微 status: 1=已激活 2=已禁用 4=未激活 5=退出企业
            is_active = wm.status == 1

            existing = await user_dao.get_by_username(db, username)
            if existing:
                # 更新现有用户
                need_update = False
                updates = {}

                if existing.nickname != nickname:
                    updates["nickname"] = nickname
                    need_update = True
                if getattr(existing, 'real_name', None) != real_name:
                    updates["real_name"] = real_name
                    need_update = True
                if existing.dept_id != dept_id:
                    updates["dept_id"] = dept_id
                    need_update = True
                if existing.phone != wm.mobile and wm.mobile:
                    updates["phone"] = wm.mobile
                    need_update = True
                if is_active and existing.status == 0:
                    updates["status"] = 1
                    need_update = True
                elif not is_active and existing.status == 1:
                    updates["status"] = 0
                    disabled += 1
                    need_update = True

                # login_alias: 昵称变了或首次回填时重算
                desired_alias = await self._resolve_login_alias(db, nickname, username, existing.id)
                if existing.login_alias != desired_alias:
                    updates["login_alias"] = desired_alias
                    need_update = True

                if need_update:
                    await db.execute(
                        update(User).where(User.id == existing.id).values(**updates)
                    )
                    updated += 1
            else:
                # 创建新用户
                salt = bcrypt.gensalt()
                password_hash = get_hash_password(default_password, salt)
                login_alias = await self._resolve_login_alias(db, nickname, username, None)
                user = User(
                    username=username,
                    nickname=nickname,
                    real_name=real_name,
                    password=password_hash,
                    salt=salt,
                    phone=wm.mobile or None,
                    dept_id=dept_id,
                    status=1 if is_active else 0,
                    is_staff=True,  # 允许后台登录
                )
                user.login_alias = login_alias
                db.add(user)
                await db.flush()  # 获取新用户 ID

                # 根据岗位分配角色
                position = wm.position.strip()
                if position and position_role_map and position in position_role_map:
                    user.roles.append(position_role_map[position])

                created += 1

        await db.flush()
        return created, updated, disabled

    async def sync_all(
        self, db: AsyncSession, default_password: str = "123456"
    ) -> SyncResult:
        """
        完整同步：部门 + 角色 + 用户

        :param db: 数据库会话
        :param default_password: 新用户默认密码
        :return: 同步结果
        """
        result = SyncResult()

        try:
            # 1. 同步部门
            result.dept_created, result.dept_updated = await self.sync_departments(db)

            # 2. 同步角色（根据岗位）
            result.role_created, position_role_map = await self.sync_roles(db)

            # 3. 同步用户（关联岗位角色）
            result.user_created, result.user_updated, result.user_disabled = await self.sync_users(
                db, default_password, position_role_map
            )
        except Exception as e:
            result.errors.append(str(e))
            raise

        return result


wecom_sync_service = WecomSyncService()
