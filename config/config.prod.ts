import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const config: PowerPartial<EggAppConfig> = {
    baseUrl: 'prod.url',
  };
  return config;
};
