from typing import Annotated

from fastapi import APIRouter, Query
from pydantic import BaseModel

from backend.app.admin.service.wecom_sync_service import wecom_sync_service
from backend.common.response.response_schema import ResponseSchemaModel, response_base
from backend.common.security.jwt import DependsJwtAuth
from backend.common.security.rbac import DependsRBAC
from backend.database.db import CurrentSessionTransaction

router = APIRouter()


class SyncResultSchema(BaseModel):
    dept_created: int
    dept_updated: int
    role_created: int
    user_created: int
    user_updated: int
    user_disabled: int
    errors: list[str]


@router.post(
    '/sync',
    summary='同步企业微信通讯录',
    description='从企业微信同步部门和用户到系统',
    dependencies=[DependsJwtAuth, DependsRBAC],
)
async def sync_wecom(
    db: CurrentSessionTransaction,
    default_password: Annotated[str, Query(description='新用户默认密码')] = '123456',
) -> ResponseSchemaModel[SyncResultSchema]:
    result = await wecom_sync_service.sync_all(
        db=db,
        default_password=default_password,
    )
    return response_base.success(data=SyncResultSchema(
        dept_created=result.dept_created,
        dept_updated=result.dept_updated,
        role_created=result.role_created,
        user_created=result.user_created,
        user_updated=result.user_updated,
        user_disabled=result.user_disabled,
        errors=result.errors or [],
    ))


@router.post(
    '/sync/departments',
    summary='仅同步企业微信部门',
    dependencies=[DependsJwtAuth, DependsRBAC],
)
async def sync_wecom_departments(db: CurrentSessionTransaction) -> ResponseSchemaModel[dict]:
    created, updated = await wecom_sync_service.sync_departments(db)
    return response_base.success(data={'created': created, 'updated': updated})


@router.post(
    '/sync/users',
    summary='仅同步企业微信用户',
    dependencies=[DependsJwtAuth, DependsRBAC],
)
async def sync_wecom_users(
    db: CurrentSessionTransaction,
    default_password: Annotated[str, Query(description='新用户默认密码')] = '123456',
) -> ResponseSchemaModel[dict]:
    created, updated, disabled = await wecom_sync_service.sync_users(
        db=db,
        default_password=default_password,
    )
    return response_base.success(data={'created': created, 'updated': updated, 'disabled': disabled})
