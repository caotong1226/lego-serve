import { appendFileSync } from 'fs';
import type { Context } from 'egg';
export default () => {
  return async (ctx: Context, next: () => Promise<any>) => {
    const startTime = Date.now();
    const requestTime = Date.now();
    await next();
    const ms = Date.now() - startTime;
    const logTime = `${requestTime} -- ${ctx.method} -- ${ctx.url} -- ${ms}ms`;
    appendFileSync('./log.txt', logTime + '\n');
  };
};
