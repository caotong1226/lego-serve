import { Controller } from 'egg';
import inputValidate from '../decorator/inputValidate';
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

export default class HomeController extends Controller {
  @inputValidate(userCreateRules, 'userValidateFail')
  async createByEmail() {
    const { ctx, service } = this;
    const { username } = ctx.request.body;
    const user = await service.user.findByUsername(username);
    if (user) {
      return ctx.helper.error({ ctx, errorType: 'createUserAlreadyExists' });
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
  @inputValidate(sendCodeRules, 'userValidateFail')
  async sendVeriCode() {
    const { ctx, app } = this;
    const { phoneNumber } = ctx.request.body;
    // 获取redis数据
    // phoneVeriCode - phone number
    const preVeriCode = await app.redis.get(`phoneVeriCode-${phoneNumber}`);
    // 判断preVeriCode是否存在
    if (preVeriCode) {
      return ctx.helper.error({ ctx, errorType: 'sendVeriCodeFrequentlyFailInfo' });
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
    await app.redis.set(`phoneVeriCode-${phoneNumber}`, veriCode, 'ex', 360000);
    ctx.helper.success({ ctx, msg: '验证码发送成功', res: app.config.env === 'local' ? { veriCode } : null });
  }
  @inputValidate(userCreateRules, 'loginValidateFail')
  async loginByEmail() {
    const { ctx, service, app } = this;
    const { username, password } = ctx.request.body;
    const user = await service.user.findByUsername(username);
    if (!user) {
      return ctx.helper.error({ ctx, errorType: 'loginCheckFailInfo' });
    }
    const verifyPwd = await ctx.compare(password, user.password);
    if (!verifyPwd) {
      return ctx.helper.error({ ctx, errorType: 'loginCheckFailInfo' });
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
  async oauth() {
    const { ctx, app } = this;
    const { clientId, redirectUrl } = app.config.giteeOauthConfig;
    ctx.redirect(`https://gitee.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUrl}&response_type=code`);
  }
  async oauthByGitee() {
    const { ctx } = this;
    const { code } = ctx.request.query;
    try {
      const token = await ctx.service.user.loginByGitee(code);
      await ctx.render('success.nj', { token });
      ctx.helper.success({ ctx, res: { token } });
    } catch (error) {
      return ctx.helper.error({ ctx, errorType: 'giteeOauthError', error });
    }
  }
  async show() {
    const { ctx, service } = this;
    const userData = await service.user.findByUsername(ctx.state.user.username);
    ctx.helper.success({ ctx, res: userData });
  }
}
