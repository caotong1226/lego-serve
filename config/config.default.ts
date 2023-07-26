import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

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

  // add your special config in here
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
    baseUrl: 'default.url',
  };

  // the return config will combines to EggAppConfig
  return {
    ...config,
    ...bizConfig,
  };
};
