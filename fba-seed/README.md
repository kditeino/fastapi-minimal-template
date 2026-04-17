# fba-seed

Custom seed data for the FastAPI Best Architecture (FBA) backend, tailored to
the Minimal UI frontend in `web/`.

FBA ships with `init_test_data.sql` that assumes the vben-admin frontend — its
menu `path`, `name`, and `component` values point at vben's routes, which don't
match this project's routes. We override those rows with our own.

## Files

| File | Purpose |
|------|---------|
| `minimal_menus.sql` | Replaces `sys_menu` + `sys_role_menu` with a tree that matches `src/routes/sections/dashboard.tsx` and the `PermissionGuard` perm codes used across `src/sections/`. |

## Usage

1. Run FBA's standard init first (only needs to happen once per fresh DB):
   ```bash
   cd api
   export PYTHONPATH=$(pwd)
   .venv/bin/fba init   # confirm with "y"
   ```
2. Apply our menu override:
   ```bash
   mysql -h <host> -u <user> -p<pass> <schema> < /path/to/fba-seed/minimal_menus.sql
   ```
3. Clear the FBA Redis cache so the sidebar endpoint reloads:
   ```bash
   redis-cli --scan --pattern 'fba:*' | xargs -r redis-cli DEL
   ```
4. Log in to the frontend again. The sidebar should now show Chinese labels
   (via i18n keys like `nav.system.user`) and every menu item should navigate
   to a real page in the Minimal UI dashboard.

## Menu structure

```
运营概览           /dashboard
系统监控           /dashboard/monitor

系统管理/
  用户管理         /dashboard/user              perms: sys:user:add, sys:user:del
  角色管理         /dashboard/role              perms: sys:role:add, sys:role:del
  部门管理         /dashboard/dept              perms: sys:dept:add, sys:dept:edit, sys:dept:del
  菜单管理         /dashboard/menu              perms: sys:menu:add, sys:menu:edit, sys:menu:del
  数据规则         /dashboard/data-rule         perms: sys:data-rule:add, sys:data-rule:del
  数据范围         /dashboard/data-scope        perms: sys:data-scope:add, sys:data-scope:del
  插件管理         /dashboard/plugin            perms: sys:plugin:del
  文件管理         /dashboard/file
  在线会话         /dashboard/session           perms: sys:session:del

日志管理/
  登录日志         /dashboard/log/login
  操作日志         /dashboard/log/opera

任务管理/
  任务控制         /dashboard/task
  任务结果         /dashboard/task/result       perms: task:result:del
  定时任务         /dashboard/task/scheduler    perms: task:scheduler:add, task:scheduler:del
```

## Editing

When you add a new page to the frontend, add a matching row to
`minimal_menus.sql` and re-run it. Treat this file as the source of truth for
the menu tree — don't hand-edit `sys_menu` rows in the admin UI expecting them
to persist through a reseed.

The i18n keys used in `title` are defined in
`web/src/locales/langs/{cn,en}/common.json` under the `nav`
namespace. Keep both in sync.
