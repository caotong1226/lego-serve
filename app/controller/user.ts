import { Controller } from 'egg';
const userCreateRules = {
  username: 'email',
  password: { type: 'password', min: 8 },
};

export const userErrorMessages = {
  userValidateFail: {
    errCode: 101001,
    message: '输入信息验证失败',
  },
  createUserAlreadyExists: {
    errCode: 101002,
    message: '该邮箱已被注册，请直接登录',
  },
  loginCheckFailInfo: {
    errCode: 101003,
    message: '该用户不存在或密码错误',
  },
  loginValidateFail: {
    errCode: 101004,
    message: '登录检验失败',
  },
};

export default class HomeController extends Controller {
  async createByEmail() {
    const { ctx, service, app } = this;
    const errors = app.validator.validate(userCreateRules, ctx.request.body);
    ctx.logger.warn(errors);
    if (errors) {
      return ctx.helper.error({ ctx, errorType: 'userValidateFail', error: errors });
    }
    const { username } = ctx.request.body;
    const user = await service.user.findByUsername(username);
    if (user) {
      return ctx.helper.error({ ctx, errorType: 'createUserAlreadyExists', error: errors });
    }
    const userData = await service.user.createByEmail(ctx.request.body);
    ctx.helper.success({ ctx, res: userData });
  }
  validateUserInput() {
    const { ctx, app } = this;
    const errors = app.validator.validate(userCreateRules, ctx.request.body);
    ctx.logger.warn(errors);
    return errors;
  }
  async loginByEmail() {
    const { ctx, service, app } = this;
    const error = this.validateUserInput();
    if (error) {
      return ctx.helper.error({ ctx, errorType: 'userValidateFail', error });
    }
    const { username, password } = ctx.request.body;
    const user = await service.user.findByUsername(username);
    if (!user) {
      return ctx.helper.error({ ctx, errorType: 'loginCheckFailInfo', error });
    }
    const verifyPwd = await ctx.compare(password, user.password);
    if (!verifyPwd) {
      return ctx.helper.error({ ctx, errorType: 'loginCheckFailInfo', error });
    }
    const token = app.jwt.sign({ username: user.username }, app.config.jwt.secret);
    ctx.helper.success({ ctx, res: { token }, msg: '登录成功' });
  }
  async show() {
    const { ctx, service } = this;
    const userData = await service.user.findByUsername(ctx.state.user.username);
    ctx.helper.success({ ctx, res: userData });
  }
}
