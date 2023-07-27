import type { Application } from 'egg';
module.exports = (app: Application) => {
  const { router, controller } = app;
  router.post('/api/users/create', controller.user.createByEmail);
  router.get('/api/users/getUserInfo', app.jwt as any, controller.user.show);
  router.post('/api/users/loginByEmail', controller.user.loginByEmail);
  router.post('/api/users/genVeriCode', controller.user.sendVeriCode);
  router.post('/api/users/loginByPhoneNumber', controller.user.loginByCellphone);
  router.post('/api/users/passport/gitee', controller.user.oauth);
  router.post('/api/users/passport/gitee/callback', controller.user.oauthByGitee);
};
