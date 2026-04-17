const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

export const paths = {
  // Auth
  auth: {
    login: `${ROOTS.AUTH}/fba/sign-in`,
    fba: {
      signIn: `${ROOTS.AUTH}/fba/sign-in`,
    },
  },
  // Dashboard
  dashboard: {
    root: ROOTS.DASHBOARD,
    monitor: `${ROOTS.DASHBOARD}/monitor`,
    user: {
      root: `${ROOTS.DASHBOARD}/user`,
      list: `${ROOTS.DASHBOARD}/user/list`,
      edit: (id: number | string) => `${ROOTS.DASHBOARD}/user/${id}/edit`,
    },
    role: `${ROOTS.DASHBOARD}/role`,
    dept: `${ROOTS.DASHBOARD}/dept`,
    menu: `${ROOTS.DASHBOARD}/menu`,
    file: `${ROOTS.DASHBOARD}/file`,
    dataRule: `${ROOTS.DASHBOARD}/data-rule`,
    dataScope: `${ROOTS.DASHBOARD}/data-scope`,
    plugin: `${ROOTS.DASHBOARD}/plugin`,
    log: {
      opera: `${ROOTS.DASHBOARD}/log/opera`,
      login: `${ROOTS.DASHBOARD}/log/login`,
    },
    task: {
      root: `${ROOTS.DASHBOARD}/task`,
      result: `${ROOTS.DASHBOARD}/task/result`,
      scheduler: `${ROOTS.DASHBOARD}/task/scheduler`,
    },
    session: `${ROOTS.DASHBOARD}/session`,
  },
  // Error pages
  page403: '/error/403',
  page404: '/error/404',
  page500: '/error/500',
};
