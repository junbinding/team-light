'use strict';

const Service = require('egg').Service;
const axios = require('axios');
const CryptoJS = require('crypto-js');


const TUYA_API = 'https://openapi.tuyacn.com';
const TUYA_TOKEN_CACHE = 'TUYA_TOKEN_CACHE';

const colorMap = {
  open: [{ code: 'switch_led', value: true }],
  off: [{ code: 'switch_led', value: false }],
  success: [
    { code: 'switch_led', value: true },
    { code: 'colour_data_v2', value: '{"h":135,"s":1000,"v":1000}' },
  ],
  fail: [
    { code: 'switch_led', value: true },
    { code: 'colour_data_v2', value: '{"h":356,"s":1000,"v":1000}' },
  ],
  info: [
    { code: 'switch_led', value: true },
    { code: 'colour_data_v2', value: '{"h":204,"s":1000,"v":1000}' },
  ],
  warning: [
    { code: 'switch_led', value: true },
    { code: 'colour_data_v2', value: '{"h":54,"s":1000,"v":1000}' },
  ],
};

class TuyaService extends Service {
  // 获取 token
  async getToken() {
    // 缓存本地 token，目前涂鸦侧有缓存，不是每次自动生成
    const { app } = this;
    const tokenStr = await app.redis.get(TUYA_TOKEN_CACHE);
    let token = await this.getNewToken();
    if (!tokenStr) {
      token = await this.getNewToken();
    } else {
      token = JSON.parse(tokenStr);
    }
    return token.access_token;
  }

  // 获取初始化 token
  async getNewToken() {
    const { app } = this;
    const httpMethod = 'GET';
    const query = {
      grant_type: 1,
    };
    const url = '/v1.0/token';
    const timestamp = Date.now();
    const signMap = this.stringToSign(query, httpMethod, '', url);
    const sign = this.calcSign(app.config.tuya.clientId, '', timestamp, '', signMap.signUrl, app.config.tuya.clientSecret);

    const config = {
      method: httpMethod,
      url: TUYA_API + signMap.url,
      headers: {
        client_id: app.config.tuya.clientId,
        sign,
        t: timestamp,
        sign_method: 'HMAC-SHA256',
      },
    };

    const { data: { result, success } } = await axios(config);
    console.log('get token', success, result);
    if (success) {
      app.redis.set(TUYA_TOKEN_CACHE, JSON.stringify(result), 'EX', result.expire_time);
    }
    return result;
  }

  // 获取设备状态
  async getThingStatus() {
    const { app } = this;
    const url = '/v1.0/devices/status';
    const httpMethod = 'GET';
    const timestamp = Date.now();
    const query = {
      device_ids: app.config.tuya.deviceId,
    };

    const signMap = this.stringToSign(query, httpMethod, '', url);
    const token = await this.getToken();
    const sign = this.calcSign(app.config.tuya.clientId, token, timestamp, '', signMap.signUrl, app.config.tuya.clientSecret);

    const config = {
      method: httpMethod,
      url: TUYA_API + signMap.url,
      headers: {
        client_id: app.config.tuya.clientId,
        access_token: token,
        sign,
        t: timestamp,
        sign_method: 'HMAC-SHA256',
        'Content-Type': 'application/json',
      },
    };

    const { data: { success, result, msg } } = await axios(config);
    console.log('get thing status', success, result, msg);
    return result || msg;
  }

  // 更新设备状态
  async updateThingStatus(action = 'success') {
    const { app } = this;
    const url = `/v1.0/devices/${app.config.tuya.deviceId}/commands`;
    const httpMethod = 'POST';
    const timestamp = Date.now();
    if (!(action in colorMap)) {
      console.log('update thing status: error action - ', action);
      return false;
    }
    const baseData = {
      commands: [
        {
          code: 'work_mode',
          value: 'colour',
        },
        {
          code: 'temp_value_v2',
          value: 600,
        },
        ...colorMap[action],
      ],
    };

    const data = JSON.stringify(baseData);
    const signMap = this.stringToSign(null, httpMethod, data, url);
    const token = await this.getToken();
    const sign = this.calcSign(app.config.tuya.clientId, token, timestamp, '', signMap.signUrl, app.config.tuya.clientSecret);

    const config = {
      method: httpMethod,
      url: TUYA_API + signMap.url,
      headers: {
        client_id: app.config.tuya.clientId,
        access_token: token,
        sign,
        t: timestamp,
        sign_method: 'HMAC-SHA256',
        'Content-Type': 'application/json',
      },
      data,
    };

    const { data: { success, result, msg } } = await axios(config);
    console.log('update thing status', success, result, msg);
    return success;

  }

  // 生成签名字符串
  stringToSign(query, method, body, originUrl) {
    let sha256 = '';
    let url = '';
    const headersStr = '';
    const baseMap = {};
    let arr = [];
    let bodyStr = '';
    console.log('origin url: ', originUrl);
    if (query) {
      this.toJsonObj(query, arr, baseMap);
    }
    if (body) {
      bodyStr = body.toString();
    }
    sha256 = CryptoJS.SHA256(bodyStr);
    arr = arr.sort();
    arr.forEach(function(item) {
      url += item + '=' + baseMap[item] + '&';
    });
    if (url.length > 0) {
      url = url.substring(0, url.length - 1);
      url = originUrl + '?' + url;
    } else {
      url = originUrl;
    }

    const resMap = {};
    resMap.signUrl = method + '\n' + sha256 + '\n' + headersStr + '\n' + url;
    resMap.url = url;
    return resMap;
  }

  toJsonObj(params, arr, map) {
    const jsonBodyStr = JSON.stringify(params);
    const jsonBody = JSON.parse(jsonBodyStr);

    Object.keys(jsonBody).forEach(function(key) {
      arr.push(key);
      map[key] = jsonBody[key];
    });
  }

  calcSign(clientId, token, timestamp, nonce, signStr, secret) {
    const str = clientId + (token || '') + timestamp + nonce + signStr;
    const hash = CryptoJS.HmacSHA256(str, secret);
    const hashInBase64 = hash.toString();
    const signUp = hashInBase64.toUpperCase();
    return signUp;
  }
}

module.exports = TuyaService;
