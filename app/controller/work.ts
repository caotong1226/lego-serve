import { Controller } from 'egg';
const workCreateRules = {
  title: 'string',
};

export const workErrorMessages = {
  workValidateFail: {
    errCode: 101001,
    message: '输入信息验证失败',
  },
};

export default class WorkController extends Controller {
  async createWork() {
    const { ctx, service } = this;
    const errors = this.validateWorkInput(workCreateRules);
    if (errors) {
      return ctx.helper.error({ ctx, errorType: 'workValidateFail', error: errors });
    }
    const workData = await service.work.createEmptyWork(ctx.request.body);
    ctx.helper.success({ ctx, res: workData });
  }
  validateWorkInput(rules) {
    const { ctx, app } = this;
    const errors = app.validator.validate(rules, ctx.request.body);
    ctx.logger.warn(errors);
    return errors;
  }
  async show() {
    const { ctx, service } = this;
    const userData = await service.user.findByUsername(ctx.state.user.username);
    ctx.helper.success({ ctx, res: userData });
  }
}
