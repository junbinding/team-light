'use strict';

const Controller = require('egg').Controller;

class IotController extends Controller {
  async index() {
    this.ctx.body = 'welcome to iot center';
  }

  async getThingStatus() {
    const { ctx } = this;
    const res = await ctx.service.tuya.getThingStatus();
    ctx.body = res;
  }

  async updateThingStatus() {
    const { ctx } = this;
    const { action } = ctx.query;
    if (!action) {
      ctx.body = {
        err: 1,
        msg: '参数异常',
      };
      return;
    }
    const res = await ctx.service.tuya.updateThingStatus(action.trim());
    ctx.body = res;
  }
}

module.exports = IotController;
