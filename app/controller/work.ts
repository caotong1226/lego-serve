import checkPermission from '../decorator/checkPermission';
import { Controller } from 'egg';
import inputValidate from '../decorator/inputValidate';
import { PopulateOptions } from 'mongoose';
const workCreateRules = {
  title: 'string',
};

export interface IndexCondition {
  pageIndex?: number;
  pageSize?: number;
  select?: string | string[];
  populate?: PopulateOptions | (string | PopulateOptions)[];
  customSort?: Record<string, any>;
  find?: Record<string, any>;
}

export default class WorkController extends Controller {
  @inputValidate(workCreateRules, 'workValidateFail')
  @checkPermission('Work', 'workNoPermissionFail')
  async createWork() {
    const { ctx, service } = this;
    const workData = await service.work.createEmptyWork(ctx.request.body);
    ctx.helper.success({ ctx, res: workData });
  }
  async myList() {
    const { ctx } = this;
    const userId = ctx.state.user._id;
    const { title, pageIndex, pageSize, isTemplate } = ctx.query;
    const findCondition = {
      user: userId,
      ...(title && { title: { $regex: title, $options: 'i' } }),
      ...(isTemplate && { isTemplate: !!parseInt(isTemplate) }),
    };
    const listCondition: IndexCondition = {
      select: 'id author copiedCount CoverImg desc title user isHot CreatedAt',
      populate: { path: 'user', select: 'username nickName picture' },
      find: findCondition,
      ...(pageIndex && { pageIndex: parseInt(pageIndex) }),
      ...(pageSize && { pageSize: parseInt(pageSize) }),
    };
    const res = await ctx.service.work.getList(listCondition);
    ctx.helper.success({ ctx, res });
  }
  async templateList() {
    const { ctx } = this;
    const { pageIndex, pageSize } = ctx.query;
    const listCondition: IndexCondition = {
      select: 'id author copiedCount coverImg desc title user isHot createdAt',
      populate: { path: 'user', select: 'username nickName picture' },
      find: { isPublic: true, isTemplate: true },
      ...(pageIndex && { pageIndex: parseInt(pageIndex) }),
      ...(pageSize && { pageSize: parseInt(pageSize) }),
    };
    const res = await ctx.service.work.getList(listCondition);
    ctx.helper.success({ ctx, res });
  }
  @checkPermission('Work', 'workNoPermissionFail')
  async update() {
    const { ctx } = this;
    const { id } = ctx.params;
    const payload = ctx.request.body;
    const res = await ctx.model.Work.findByIdAndUpdate({ id }, payload, { new: true });
    ctx.helper.success({ ctx, res });
  }
  @checkPermission('Work', 'workNoPermissionFail')
  async delete() {
    const { ctx } = this;
    const { id } = ctx.params;
    const res = await ctx.model.Work.findByIdAndDelete({ id }).select('_id id title').lean();
    ctx.helper.success({ ctx, res });
  }
  @checkPermission('Work', 'workNoPermissionFail')
  async publish(isTemplate: boolean) {
    const { ctx, service } = this;
    const url = await service.work.publish(ctx.params.id, isTemplate);
    ctx.helper.success({ ctx, res: { url } });
  }
  async publishWork() {
    await this.publish(false);
  }
  async publishTemplate() {
    await this.publish(true);
  }
}
