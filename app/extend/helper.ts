import { userErrorMessages } from '../controller/user';
import { workErrorMessages } from '../controller/work';
import type { Context } from 'egg';

interface ResType {
  ctx: Context;
  res?: any;
  msg?: string;
}
interface ErrorRespType {
  ctx: Context;
  errorType: keyof (typeof userErrorMessages & typeof workErrorMessages);
  error?: any;
}

const globalErrorMessages = {
  ...userErrorMessages,
  ...workErrorMessages,
};

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
