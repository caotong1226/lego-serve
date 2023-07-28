// This file is created by egg-ts-helper@1.34.7
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportUser from '../../../app/controller/user';
import ExportWork from '../../../app/controller/work';

declare module 'egg' {
  interface IController {
    user: ExportUser;
    work: ExportWork;
  }
}
