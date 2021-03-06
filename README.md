# TeamLight 团队告警灯
一款基于涂鸦智能灯泡的团队告警灯，通过API调用，传入不同的告警级别，展示不同的颜色，使所有团队成员更直观的看到当前团队的问题。

## 背景
当团队出现生产告警的时候，无论是通过微信、企微、钉钉等在线工具，都很难直观有效的让所有同学都明白生产出现事故了。
因此需要一个有效的方式让大家了解到，像消防车一样，我们需要一个现场的、明显的方式提醒团队成员。

## 优劣
- 优点：直观明了的现场提醒
- 缺点：能携带的信息很少，就只是提示作用，无法告知更多信息

## 依赖
- 涂鸦彩色智能灯泡
- 涂鸦Iot开发者账号
- 一台云端服务器
- Node.js 14 + 环境

### 使用指南
1. 在 Iot 开发平台上申请云开发密钥
2. 下载 Smart Life App，绑定智能灯泡
3. 在 Iot 平台云开发中关联 App 账号，能看到自己的设备
4. 在本项目中，将 .env.demo 复制一份，命名为 .env
5. 更改 .env 文件中的云开发相关信息和设备信息
6. 安装 docker 环境，docker-compose up 启动项目依赖的 redis
7. 安装项目依赖 `npm i`
8. 启动项目 `npm run dev`
9. 目前支持6中行为，open: 开启，off: 关闭，success: 绿色，fail: 红色，warning: 黄色，info: 蓝色，
10. 通过浏览器访问 `http://127.0.0.1:7011/updateThingStatus?action=open` 来控制灯泡颜色。

### 开发环境

```bash
npm i
npm run dev
open http://localhost:7001/
```

### 生产环境
```bash
npm i
npm start
```

## 历史缘由
在18年，波波找了外部的一个 CTO 到我司演讲，讲到他有做一些非常有趣，对团队效果明显的玩具。
其中有一个就是买了一个告警灯，当生产出问题后，这个告警灯就亮着了，无论技术团队、还是产品团队都反应很好。

在最近几年，我陆陆续续通过不同方式实现了这个功能。
先是通过易微联的通断器;
后来通过 esp8266 自己烧录程序，不断轮训服务端;
再后来通过易微联智能灯泡实现;
最终发现涂鸦智能有 Iot 平台，提供开发 API 控制我们的设备，于是衍生了当前的方案。


## 参考文档
1. [涂鸦Iot平台](https://iot.tuya.com/cloud/)
2. [涂鸦Api接口文档](https://developer.tuya.com/cn/docs/cloud/oauth-management?id=K95ztzpoll7v5)
3. [涂鸦Postman接口包](https://developer.tuya.com/cn/docs/iot/set-up-postman-environment?id=Ka7o385w1svns)