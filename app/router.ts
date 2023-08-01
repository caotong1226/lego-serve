import { Application } from 'egg';
module.exports = (app: Application) => {
  const jwtMiddleware = app.jwt as any;
  const { router, controller } = app;
  router.post('/api/users/create', controller.user.createByEmail);
  router.get('/api/users/getUserInfo', jwtMiddleware, controller.user.show);
  router.post('/api/users/loginByEmail', controller.user.loginByEmail);
  router.post('/api/users/genVeriCode', controller.user.sendVeriCode);
  router.post('/api/users/loginByPhoneNumber', controller.user.loginByCellphone);
  router.post('/api/users/passport/gitee', controller.user.oauth);
  router.post('/api/users/passport/gitee/callback', controller.user.oauthByGitee);

  router.post('/api/works', jwtMiddleware, controller.work.createWork);
  router.get('/api/works', jwtMiddleware, controller.work.myList);
  router.get('/templates', controller.work.templateList);
  router.patch('/api/works/:id', jwtMiddleware, controller.work.update);
  router.delete('/api/works/:id', jwtMiddleware, controller.work.delete);
  router.post('/api/works/publish/:id', jwtMiddleware, controller.work.publishWork);
  router.post('/api/works/publish-template/:id', jwtMiddleware, controller.work.publishTemplate);

  router.post('/utils/upload-img', jwtMiddleware, controller.utils.uploadMultipleFiles);
};
