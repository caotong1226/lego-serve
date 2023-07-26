import { Controller } from 'egg';
const userCreateRules = {
  username: 'email',
  password: { type: 'password', min: 8 },
};

const sendCodeRules = {
  phoneNumber: { type: 'string', format: /^1[3-9]\d{9}$/, message: '手机号码格式错误' },
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
  sendVeriCodeFrequentlyFailInfo: {
    errCode: 101005,
    message: '请勿频繁的获取短信验证码',
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
  validateUserInput(rules) {
    const { ctx, app } = this;
    const errors = app.validator.validate(rules, ctx.request.body);
    ctx.logger.warn(errors);
    return errors;
  }
  async sendVeriCode() {
    const { ctx, app } = this;
    const { phoneNumber } = ctx.request.body;
    // 检查用户输入
    const error = this.validateUserInput(sendCodeRules);
    if (error) {
      return ctx.helper.error({ ctx, errorType: 'userValidateFail', error });
    }
    // 获取redis数据
    // phoneVeriCode - phone number
    const preVeriCode = app.redis.get(`phoneVeriCode-${phoneNumber}`);
    // 判断preVeriCode是否存在
    if (await preVeriCode) {
      return ctx.helper.error({ ctx, errorType: 'sendVeriCodeFrequentlyFailInfo', error });
    }
    // [0 - 1) * 9000 + 1000 = [1000 - 10000)
    const veriCode = Math.floor((Math.random() * 9000) + 1000).toString();
    await app.redis.set(`phoneVeriCode-${phoneNumber}`, veriCode, 'ex', 60);
    ctx.helper.success({ ctx, res: { veriCode }, msg: '发送成功' });
  }
  async loginByEmail() {
    const { ctx, service, app } = this;
    const error = this.validateUserInput(userCreateRules);
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
