import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const config: PowerPartial<EggAppConfig> = {
    baseUrl: 'prod.url',
  };
  config.mongoose = {
    client: {
      url: 'mongodb://lego-mongo:27017/lego',
      options: {
        user: process.env.MONGO_DB_USERNAME,
        pass: process.env.MONGO_DB_PASSWORD,
      },
    },
  };
  config.redis = {
    client: {
      port: 6379,
      host: 'lego-redis',
      password: process.env.REDIS_PASSWORD,
    },
  };
  config.security = {
    domainWhiteList: [ 'http://139.224.229.225:8080' ],
  };
  config.jwtExpires = '2 days';
  config.giteeOauthConfig = {
    redirectURL: 'http://139.224.229.225:7001/api/users/passport/gitee/callback',
  };
  config.H5BaseURL = 'http://139.224.229.225:7001/api/pages';
  return config;
};
