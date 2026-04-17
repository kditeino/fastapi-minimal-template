-- ============================================================================
-- Minimal UI + FBA — custom menu seed
-- ----------------------------------------------------------------------------
-- Replaces FBA's default vben-admin menus with a tree matching the Minimal UI
-- frontend routes (src/routes/sections/dashboard.tsx) and PermissionGuard codes.
--
-- Run this AFTER `fba init` against the FBA database (e.g. `fba-new`).
-- Safe to re-run: TRUNCATEs sys_menu + sys_role_menu and re-INSERTs everything.
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE sys_menu;
TRUNCATE TABLE sys_role_menu;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------------
-- sys_menu
--
-- type: 0 = DIRECTORY, 1 = MENU, 2 = BUTTON, 3 = EMBEDDED, 4 = LINK
-- status: 1 = enabled
-- display: 1 = visible in sidebar, 0 = hidden
-- cache: 1 = keep-alive (cached page component)
-- ----------------------------------------------------------------------------

INSERT INTO sys_menu
  (id, title, name, path, sort, icon, type, component, perms, status, display, cache, link, remark, parent_id, created_time)
VALUES
-- ===== Dashboard (flat top-level) =====
(1,  'nav.dashboard.overview', 'dashboardOverview', '/dashboard',          10,  'solar:home-angle-bold-duotone',      1, NULL, NULL, 1, 1, 1, NULL, NULL, NULL, NOW()),
(2,  'nav.dashboard.monitor',  'dashboardMonitor',  '/monitor',            20,  'solar:monitor-bold',                 1, NULL, NULL, 1, 1, 1, NULL, NULL, NULL, NOW()),

-- ===== System directory =====
(10, 'nav.system.title',       'system',            NULL,                  30,  'solar:settings-bold-duotone',        0, NULL, NULL, 1, 1, 1, NULL, NULL, NULL, NOW()),

(11, 'nav.system.user',        'systemUser',        '/dashboard/user',     10,  'solar:user-rounded-bold',            1, NULL, NULL, 1, 1, 1, NULL, NULL, 10,   NOW()),
(12, '新增用户',               'systemUserAdd',     NULL,                  10,  NULL,                                 2, NULL, 'sys:user:add', 1, 0, 1, NULL, NULL, 11, NOW()),
(13, '删除用户',               'systemUserDel',     NULL,                  20,  NULL,                                 2, NULL, 'sys:user:del', 1, 0, 1, NULL, NULL, 11, NOW()),

(20, 'nav.system.role',        'systemRole',        '/dashboard/role',     20,  'solar:shield-keyhole-bold-duotone',  1, NULL, NULL, 1, 1, 1, NULL, NULL, 10,   NOW()),
(21, '新增角色',               'systemRoleAdd',     NULL,                  10,  NULL,                                 2, NULL, 'sys:role:add', 1, 0, 1, NULL, NULL, 20, NOW()),
(22, '删除角色',               'systemRoleDel',     NULL,                  20,  NULL,                                 2, NULL, 'sys:role:del', 1, 0, 1, NULL, NULL, 20, NOW()),

(30, 'nav.system.dept',        'systemDept',        '/dashboard/dept',     30,  'solar:users-group-rounded-bold-duotone', 1, NULL, NULL, 1, 1, 1, NULL, NULL, 10, NOW()),
(31, '新增部门',               'systemDeptAdd',     NULL,                  10,  NULL,                                 2, NULL, 'sys:dept:add', 1, 0, 1, NULL, NULL, 30, NOW()),
(32, '修改部门',               'systemDeptEdit',    NULL,                  20,  NULL,                                 2, NULL, 'sys:dept:edit', 1, 0, 1, NULL, NULL, 30, NOW()),
(33, '删除部门',               'systemDeptDel',     NULL,                  30,  NULL,                                 2, NULL, 'sys:dept:del', 1, 0, 1, NULL, NULL, 30, NOW()),

(40, 'nav.system.menu',        'systemMenu',        '/dashboard/menu',     40,  'solar:list-bold',                    1, NULL, NULL, 1, 1, 1, NULL, NULL, 10,   NOW()),
(41, '新增菜单',               'systemMenuAdd',     NULL,                  10,  NULL,                                 2, NULL, 'sys:menu:add', 1, 0, 1, NULL, NULL, 40, NOW()),
(42, '修改菜单',               'systemMenuEdit',    NULL,                  20,  NULL,                                 2, NULL, 'sys:menu:edit', 1, 0, 1, NULL, NULL, 40, NOW()),
(43, '删除菜单',               'systemMenuDel',     NULL,                  30,  NULL,                                 2, NULL, 'sys:menu:del', 1, 0, 1, NULL, NULL, 40, NOW()),

(50, 'nav.system.dataRule',    'systemDataRule',    '/dashboard/data-rule',  50, 'solar:file-text-bold',              1, NULL, NULL, 1, 1, 1, NULL, NULL, 10,   NOW()),
(51, '新增数据规则',           'systemDataRuleAdd', NULL,                  10,  NULL,                                 2, NULL, 'sys:data-rule:add', 1, 0, 1, NULL, NULL, 50, NOW()),
(52, '删除数据规则',           'systemDataRuleDel', NULL,                  20,  NULL,                                 2, NULL, 'sys:data-rule:del', 1, 0, 1, NULL, NULL, 50, NOW()),

(60, 'nav.system.dataScope',   'systemDataScope',   '/dashboard/data-scope', 60, 'solar:atom-bold-duotone',           1, NULL, NULL, 1, 1, 1, NULL, NULL, 10,   NOW()),
(61, '新增数据范围',           'systemDataScopeAdd', NULL,                 10,  NULL,                                 2, NULL, 'sys:data-scope:add', 1, 0, 1, NULL, NULL, 60, NOW()),
(62, '删除数据范围',           'systemDataScopeDel', NULL,                 20,  NULL,                                 2, NULL, 'sys:data-scope:del', 1, 0, 1, NULL, NULL, 60, NOW()),

(70, 'nav.system.plugin',      'systemPlugin',      '/dashboard/plugin',   70,  'solar:cup-star-bold',                1, NULL, NULL, 1, 1, 1, NULL, NULL, 10,   NOW()),
(71, '卸载插件',               'systemPluginDel',   NULL,                  10,  NULL,                                 2, NULL, 'sys:plugin:del', 1, 0, 1, NULL, NULL, 70, NOW()),

(80, 'nav.system.file',        'systemFile',        '/dashboard/file',     80,  'solar:file-bold-duotone',            1, NULL, NULL, 1, 1, 1, NULL, NULL, 10,   NOW()),

(90, 'nav.system.session',     'systemSession',     '/monitor/online',     90,  'solar:forbidden-circle-bold',        1, NULL, NULL, 1, 1, 1, NULL, NULL, 10,   NOW()),
(91, '下线会话',               'systemSessionDel',  NULL,                  10,  NULL,                                 2, NULL, 'sys:session:del', 1, 0, 1, NULL, NULL, 90, NOW()),

-- ===== Log directory =====
(100, 'nav.log.title',         'log',               NULL,                  40,  'solar:bill-list-bold-duotone',       0, NULL, NULL, 1, 1, 1, NULL, NULL, NULL, NOW()),
(101, 'nav.log.login',         'logLogin',          '/dashboard/log/login', 10, 'solar:shield-check-bold',            1, NULL, NULL, 1, 1, 1, NULL, NULL, 100,  NOW()),
(102, 'nav.log.opera',         'logOpera',          '/dashboard/log/opera', 20, 'solar:pen-bold',                     1, NULL, NULL, 1, 1, 1, NULL, NULL, 100,  NOW()),

-- ===== Task directory =====
(110, 'nav.task.title',        'task',              NULL,                  50,  'solar:calendar-date-bold',           0, NULL, NULL, 1, 1, 1, NULL, NULL, NULL, NOW()),
(111, 'nav.task.control',      'taskControl',       '/dashboard/task',     10,  'solar:play-circle-bold',             1, NULL, NULL, 1, 1, 1, NULL, NULL, 110,  NOW()),
(112, 'nav.task.result',       'taskResult',        '/dashboard/task/result', 20, 'solar:bill-list-bold',             1, NULL, NULL, 1, 1, 1, NULL, NULL, 110,  NOW()),
(113, '删除任务结果',          'taskResultDel',     NULL,                  10,  NULL,                                 2, NULL, 'task:result:del', 1, 0, 1, NULL, NULL, 112, NOW()),
(114, 'nav.task.scheduler',    'taskScheduler',     '/dashboard/task/scheduler', 30, 'solar:clock-circle-bold',       1, NULL, NULL, 1, 1, 1, NULL, NULL, 110,  NOW()),
(115, '新增定时任务',          'taskSchedulerAdd',  NULL,                  10,  NULL,                                 2, NULL, 'task:scheduler:add', 1, 0, 1, NULL, NULL, 114, NOW()),
(116, '删除定时任务',          'taskSchedulerDel',  NULL,                  20,  NULL,                                 2, NULL, 'task:scheduler:del', 1, 0, 1, NULL, NULL, 114, NOW());

-- ----------------------------------------------------------------------------
-- sys_role_menu — grant every menu (and button perm) to the super_admin role (id=1)
-- ----------------------------------------------------------------------------
INSERT INTO sys_role_menu (role_id, menu_id)
SELECT 1, id FROM sys_menu;
