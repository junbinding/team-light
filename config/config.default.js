/* eslint valid-jsdoc: "off" */

'use strict';
require('dotenv').config();

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1630506017100_3264';

  // add your middleware config here
  config.middleware = [];

  config.redis = {
    Redis: require('ioredis'),
    client: {
      port: 7012, // Redis port
      host: '127.0.0.1', // Redis host
      password: 'Djb@123.!@#Redis',
      db: 0,
    },
  };

  const TUYA_CLIENT_ID = process.env.TUYA_CLIENT_ID;
  const TUYA_SECRET = process.env.TUYA_SECRET;
  const TUYA_DEVICE_ID = process.env.TUYA_DEVICE_ID;
  // add your user config here
  const userConfig = {
    tuya: {
      clientId: TUYA_CLIENT_ID,
      clientSecret: TUYA_SECRET,
      deviceId: TUYA_DEVICE_ID,
    },
  };

  return {
    ...config,
    ...userConfig,
  };
};
