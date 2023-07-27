import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';
import * as dotenv from 'dotenv';
dotenv.config();
export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1689665855933_6837';

  // add your egg config in here
  config.middleware = [ 'logger', 'customError' ];

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
  };

  config.jwt = {
    secret: '1234567890',
  };

  config.redis = {
    client: {
      port: 6379,
      host: '127.0.0.1',
      password: '',
      db: 0,
    },
  };

  config.cors = {
    origin: 'https://localhost:8080',
    allowMethods: 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH',
  };

  const aliCloudConfig = {
    accessKeyId: process.env.ALI_KEY_ID,
    accessKeySecret: process.env.ALI_KEY_SECRET,
    endpoint: 'dysmsapi.aliyuncs.com',
  };

  const giteeOauthConfig = {
    clientId: process.env.GITEE_OAUTH_CLIENT_ID,
    clientSecret: process.env.GITEE_OAUTH_CLIENT_SECRET,
    redirectUrl: 'http://localhost:7002/api/users/loginGetOauthToken',
    authUrl: 'https://gitee.com/oauth/token?grant_type=authorization_code',
    giteeUserInfoApi: 'https://gitee.com/api/v5/user',
  };

  // add your special config in here
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
    baseUrl: 'default.url',
    aliCloudConfig,
    giteeOauthConfig,
  };

  // the return config will combines to EggAppConfig
  return {
    ...config,
    ...bizConfig,
  };
};
