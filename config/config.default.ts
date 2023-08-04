import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';
import { join } from 'path';
import * as dotenv from 'dotenv';
dotenv.config();
export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1689665855933_6837';

  // add your egg config in here
  // config.middleware = [ 'logger', 'customError' ];

  config.mongoose = {
    client: {
      url: 'mongodb://127.0.0.1:27017/lego',
      options: {
        useNewUrlParser: true,
      },
    },
  };

  config.bcrypt = {
    saltRounds: 10,
  };

  config.security = {
    csrf: {
      enable: false,
    },
    domainWhiteList: [ 'http://localhost:8080' ],
  };

  config.jwt = {
    enable: true,
    secret: process.env.JWT_SECRET || '',
    match: [ '/api/users/getUserInfo', '/api/works', '/api/utils/upload-img', '/api/channel' ],
  };

  config.redis = {
    client: {
      port: 6379,
      host: '127.0.0.1',
      password: '',
      db: 0,
    },
  };

  // config.cors = {
  //   origin: 'https://localhost:8080',
  //   allowMethods: 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH',
  // };

  config.multipart = {
    // mode: 'file',
    // tmpdir: join(appInfo.baseDir, 'uploads'),
    whitelist: [ '.png', '.jpg', '.gif', '.webp' ],
    fileSize: '1mb',
  };

  config.oss = {
    client: {
      accessKeyId: process.env.ALI_KEY_ID || '',
      accessKeySecret: process.env.ALI_KEY_SECRET || '',
      bucket: 'robot-server-image',
      endpoint: 'oss-cn-hangzhou.aliyuncs.com',
    },
  };

  config.static = {
    dir: [
      { prefix: '/public', dir: join(appInfo.baseDir, 'app/public') },
      { prefix: '/uploads', dir: join(appInfo.baseDir, 'uploads') },
    ],
  };

  const aliCloudConfig = {
    accessKeyId: process.env.ALI_KEY_ID,
    accessKeySecret: process.env.ALI_KEY_SECRET,
    endpoint: 'dysmsapi.aliyuncs.com',
  };

  const giteeOauthConfig = {
    clientId: process.env.GITEE_OAUTH_CLIENT_ID,
    clientSecret: process.env.GITEE_OAUTH_CLIENT_SECRET,
    redirectURL: 'http://localhost:7001/api/users/passport/gitee/callback',
    authURL: 'https://gitee.com/oauth/token?grant_type=authorization_code',
    giteeUserAPI: 'https://gitee.com/api/v5/user',
  };

  // add your special config in here
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
    baseUrl: 'default.url',
    aliCloudConfig,
    giteeOauthConfig,
    H5BaseURL: 'http://localhost:7001/api/pages',
    jwtExpires: '1h',
  };

  // the return config will combines to EggAppConfig
  return {
    ...config,
    ...bizConfig,
  };
};
