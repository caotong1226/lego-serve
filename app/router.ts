import type { Application } from 'egg';
module.exports = (app: Application) => {
  const { router, controller } = app;
  router.post('/api/users/create', controller.user.createByEmail);
  router.get('/api/users/getUserInfo', app.jwt as any, controller.user.show);
  router.post('/api/users/loginByEmail', controller.user.loginByEmail);
};
