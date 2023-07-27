import { Controller } from 'egg';
const userCreateRules = {
  username: 'email',
  password: { type: 'password', min: 8 },
};

const sendCodeRules = {
  phoneNumber: { type: 'string', format: /^1[3-9]\d{9}$/, message: '手机号码格式错误' },
};

const userPhoneCreateRules = {
  phoneNumber: { type: 'string', format: /^1[3-9]\d{9}$/, message: '手机号码格式错误' },
  veriCode: { type: 'string', format: /^\d{4}$/, message: '验证码格式错误' },
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
  loginVeriCodeIncorrectFailInfo: {
    errCode: 101006,
    message: '验证码不正确',
  },
  sendVeriCodeError: {
    errCode: 101007,
    message: '验证码发送失败',
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
    const preVeriCode = await app.redis.get(`phoneVeriCode-${phoneNumber}`);
    // 判断preVeriCode是否存在
    if (preVeriCode) {
      return ctx.helper.error({ ctx, errorType: 'sendVeriCodeFrequentlyFailInfo', error });
    }
    // [0 - 1) * 9000 + 1000 = [1000 - 10000)
    const veriCode = Math.floor((Math.random() * 9000) + 1000).toString();
    // 判断运行环境
    if (app.config.env === 'prod') {
      // 发送短信
      const resp = await this.service.user.sendSMS(phoneNumber, veriCode);
      if (resp.body.code !== 'OK') {
        return ctx.helper.error({ ctx, errorType: 'sendVeriCodeError' });
      }
    }
    await app.redis.set(`phoneVeriCode-${phoneNumber}`, veriCode, 'ex', 60);
    ctx.helper.success({ ctx, msg: '验证码发送成功', res: app.config.env === 'local' ? { veriCode } : null });
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
  async loginByCellphone() {
    const { ctx, app } = this;
    const { phoneNumber, veriCode } = ctx.request.body;
    const error = this.validateUserInput(userPhoneCreateRules);
    if (error) {
      return ctx.helper.error({ ctx, errorType: 'userValidateFail', error });
    }
    // 验证码是否正确
    const preVeriCode = await app.redis.get(`phoneVeriCode-${phoneNumber}`);
    if (preVeriCode !== veriCode) {
      return ctx.helper.error({ ctx, errorType: 'loginVeriCodeIncorrectFailInfo' });
    }
    const token = await ctx.service.user.loginByCellphone(phoneNumber);
    ctx.helper.success({ ctx, res: { token } });
  }
  async show() {
    const { ctx, service } = this;
    const userData = await service.user.findByUsername(ctx.state.user.username);
    ctx.helper.success({ ctx, res: userData });
  }
}
