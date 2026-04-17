"""
一次性迁移:为 sys_user 增加 login_alias 列并回填 kdit-{nickname}

用法:
    cd api
    export PYTHONPATH=$(pwd)
    .venv/bin/python scripts/add_login_alias.py [--dry-run]

幂等:已存在列时 ALTER 跳过;login_alias 已有值的行不覆盖。
"""

import asyncio
import sys

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database.db import async_engine


DDL_STATEMENTS = [
    # 加列(幂等)
    "ALTER TABLE sys_user ADD COLUMN IF NOT EXISTS login_alias VARCHAR(64)",
    # 唯一索引(幂等);允许多行 NULL
    "CREATE UNIQUE INDEX IF NOT EXISTS ix_sys_user_login_alias ON sys_user (login_alias)",
]


async def run(dry_run: bool) -> None:
    async with async_engine.begin() as conn:
        for stmt in DDL_STATEMENTS:
            print(f"[DDL] {stmt}")
            if not dry_run:
                await conn.execute(text(stmt))

    if dry_run:
        print("(dry-run: skipping backfill since column may not exist yet)")
        return

    async with AsyncSession(async_engine) as session:
        rows = (
            await session.execute(
                text("SELECT id, username, nickname, login_alias FROM sys_user ORDER BY id")
            )
        ).all()

        backfilled = 0
        collided = 0
        skipped = 0
        taken: set[str] = {r.login_alias for r in rows if r.login_alias}

        for r in rows:
            if r.login_alias:
                skipped += 1
                continue
            if not r.nickname:
                print(f"  [skip] id={r.id} username={r.username} nickname=NULL")
                skipped += 1
                continue
            candidate = f"kdit-{r.nickname}"
            if candidate in taken:
                candidate = f"kdit-{r.nickname}-{r.username}"
                collided += 1
            taken.add(candidate)
            print(f"  [set ] id={r.id} {r.username:20s} -> {candidate}")
            if not dry_run:
                await session.execute(
                    text("UPDATE sys_user SET login_alias = :alias WHERE id = :id"),
                    {"alias": candidate, "id": r.id},
                )
            backfilled += 1

        if not dry_run:
            await session.commit()

    print(f"\n=== summary === backfilled={backfilled} collided={collided} skipped={skipped}")


if __name__ == "__main__":
    dry = "--dry-run" in sys.argv
    asyncio.run(run(dry))
