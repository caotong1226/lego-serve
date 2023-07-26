import type { IBoot, Application } from 'egg';
// import { createConnection } from 'mongoose';
// import { join } from 'path';
// import assert from 'assert';

export default class AppBoot implements IBoot {
  private readonly app: Application;
  constructor(app: Application) {
    this.app = app;
    console.log(this.app);
    // const { url } = this.app.config.mongoose;
    // assert(url, '[egg-mongoose] url is required on config');
    // const db = createConnection(url);
    // db.on('connected', () => {
    //   console.log(`[egg-mongoose] ${url} connected successfully`);
    // });
    // app.mongoose = db;
  }
  configWillLoad(): void {
    // 此时config文件已被合并读取，但是还未生效
    // 这是应用层修改配置的最后时机
  }
  async willReady(): Promise<void> {
    // app/model/user.ts => app.model.User
    // const dir = join(this.app.config.baseDir, 'app/model');
    // this.app.loader.loadToApp(dir, 'model', {
    //   caseStyle: 'upper',
    // });
  }
  async didReady(): Promise<void> {
    //
  }
}
