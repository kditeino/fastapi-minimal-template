# fastapi-minimal-template

FastAPI + Minimal UI Kit 全栈管理后台模板。前端 React + MUI，后端 FastAPI Best Architecture，数据库 PostgreSQL + Redis。开箱即用的 JWT 认证、RBAC、动态菜单、用户 / 角色 / 部门 / 菜单 / 数据权限 / 日志 / 监控 / 定时任务等管理模块。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 · TypeScript 5 · MUI v7 · Vite 6 · React Hook Form + Zod · dayjs · ApexCharts |
| 后端 | FastAPI · SQLAlchemy 2 · Pydantic v2 · Alembic · granian · Celery · Redis |
| 数据库 | PostgreSQL 14+ / MySQL 8（默认 PostgreSQL） |

## 项目结构

| 路径 | 说明 |
|---|---|
| `web/` | React/Vite 前端（Minimal UI Kit） |
| `api/` | FastAPI 后端（FBA） |
| `fba-seed/` | 对齐前端路由的菜单种子 SQL |

## 本地开发

### 前置

- Node ≥ 22.12（通过 `corepack` 使用 yarn）
- Python ≥ 3.10
- [uv](https://github.com/astral-sh/uv)（`curl -LsSf https://astral.sh/uv/install.sh | sh`）
- PostgreSQL 14+（或 MySQL 8）和 Redis 7 已就绪

### 后端

```bash
cd api
uv sync                                  # 安装 Python 依赖
cp backend/.env.example backend/.env     # 编辑数据库 / Redis / TOKEN
export PYTHONPATH=$(pwd)
.venv/bin/fba init                       # 建表、播种管理员（输入 y 确认）
psql -h <host> -U <user> -d <db> -f ../fba-seed/minimal_menus.sql
.venv/bin/fba run --port 8001            # http://127.0.0.1:8001/docs
```

MySQL 环境把最后第二行换成：

```bash
mysql -h <host> -u <user> -p <db> < ../fba-seed/minimal_menus.sql
```

### 前端

```bash
cd web
corepack enable                          # 首次运行
corepack yarn install
corepack yarn dev                        # http://localhost:8080/
```

开发服务器读取 `.env.development` 里的 `VITE_API_BASE_URL`，直连后端。

### 默认管理员

```
账号：admin
密码：123456
```

首次登录后请立即修改密码。

## 生产构建

```bash
# 前端产物
cd web
corepack yarn build                      # 输出 dist/

# 后端
cd api
.venv/bin/fba run --port 8001            # 或使用 supervisord / systemd 守护
```

静态资源可由 nginx 托管，并反代 `/api` 到后端。具体部署方式按各团队环境定制。

## 定时任务（可选）

Celery worker + Beat：

```bash
cd api
export PYTHONPATH=$(pwd)
.venv/bin/celery -A backend.app.task.celery worker --loglevel=INFO --pool=solo
.venv/bin/celery -A backend.app.task.celery beat --loglevel=INFO
```

默认只包含示例任务和日志清理任务，业务任务按需在 `backend/app/task/tasks/` 下新增。
