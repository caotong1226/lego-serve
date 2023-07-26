// This file is created by egg-ts-helper@1.34.7
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportCustomError from '../../../app/middleware/customError';
import ExportLogger from '../../../app/middleware/logger';

declare module 'egg' {
  interface IMiddleware {
    customError: typeof ExportCustomError;
    logger: typeof ExportLogger;
  }
}
