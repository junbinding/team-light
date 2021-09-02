'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.iot.index);
  router.get('/getThingStatus', controller.iot.getThingStatus);
  router.get('/updateThingStatus', controller.iot.updateThingStatus);
};
