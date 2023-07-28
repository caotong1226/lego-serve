import { GlobalErrorTypes, globalErrorMessages } from '../error';
import type { Context } from 'egg';

interface ResType {
  ctx: Context;
  res?: any;
  msg?: string;
}
interface ErrorRespType {
  ctx: Context;
  errorType: GlobalErrorTypes;
  error?: any;
}

export default {
  success({ ctx, res, msg }: ResType) {
    ctx.body = {
      errCode: 0,
      data: res ? res : null,
      message: msg ? msg : '请求成功',
    };
    ctx.status = 200;
  },
  error({ ctx, error, errorType }: ErrorRespType) {
    const { message, errCode } = globalErrorMessages[errorType];
    ctx.body = {
      errCode,
      message,
      ...(error && { error }),
    };
    ctx.status = 200;
  },
};
