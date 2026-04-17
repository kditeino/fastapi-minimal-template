"""
按新规则重算所有用户的 login_alias

规则见 wecom_sync_service._compute_alias_base:
- 昵称提取最长 ASCII 字母段(Eino / Leo / Olivia / Lyn ...)
- 无 ASCII 则退化 kdit-{username},username 已 kdit 开头则去重前缀
- 冲突追加 -{username}

用法:
    cd api
    export PYTHONPATH=$(pwd)
    .venv/bin/python scripts/recompute_login_alias.py --dry-run
    .venv/bin/python scripts/recompute_login_alias.py
"""

import asyncio
import sys

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.admin.service.wecom_sync_service import WecomSyncService
from backend.database.db import async_engine


async def run(dry_run: bool) -> None:
    compute = WecomSyncService._compute_alias_base

    async with AsyncSession(async_engine) as session:
        rows = (
            await session.execute(
                text("SELECT id, username, nickname, login_alias FROM sys_user ORDER BY id")
            )
        ).all()

        # 按照我们写入顺序确定新值,冲突追加 -{username}
        new_aliases: dict[int, str] = {}
        taken: set[str] = set()
        changed = 0
        unchanged = 0

        for r in rows:
            base = compute(r.nickname, r.username)
            final = base if base not in taken else f'{base}-{r.username}'
            taken.add(final)
            new_aliases[r.id] = final
            marker = '==' if final == r.login_alias else '->'
            print(f"  id={r.id:3d} {str(r.username):20s} nickname={str(r.nickname):24s} {r.login_alias or 'NULL':30s} {marker} {final}")
            if final == r.login_alias:
                unchanged += 1
            else:
                changed += 1

        if not dry_run:
            # 两阶段写:先全部清空,再按新值回填 — 避免唯一索引在中途冲突
            await session.execute(text("UPDATE sys_user SET login_alias = NULL"))
            for uid, alias in new_aliases.items():
                await session.execute(
                    text("UPDATE sys_user SET login_alias = :alias WHERE id = :id"),
                    {"alias": alias, "id": uid},
                )
            await session.commit()

    print(f"\n=== summary === changed={changed} unchanged={unchanged}")
    if dry_run:
        print("(dry-run: no writes)")


if __name__ == "__main__":
    dry = "--dry-run" in sys.argv
    asyncio.run(run(dry))
