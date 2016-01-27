/**
 * Created by litong on 15-12-28.
 */
'use strict';

const koa = require('koa');
const path = require('path');
const favicon = require('koa-favicon');
const logger = require('koa-logger');
const koaBody = require('koa-body');
const gzip = require('koa-gzip');
const views = require('koa-views');
const serve = require('koa-static');
const session = require('koa-generic-session');
const redisStore = require('koa-redis');
const errorHandler = require('koa-errorhandler');

const config = require('./config');
const routes = require('./routes');

const app = koa();

//设置cookie签名密钥
app.keys = config.cookieKeys;
//gizp压缩,要放在第一的位置
app.use(gzip());
//session配置
app.use(session(Object.assign({
    store : redisStore()
},config.sessionOption)));
//设置图标
app.use(favicon(path.join(__dirname, 'frontend/dist/static/internalM/publicAsset', 'favicon.png')));
//设置视图
app.use(views(path.join(__dirname, 'frontend/dist/views'),{
    default :'ejs'
}));
//设置静态资源
app.use(serve(path.join(__dirname, 'frontend/dist/static'),config.staticRSOption));
//日志
app.use(logger());
//请求解析器
app.use(koaBody());
//非生成器函数的异常处理，生成器函数异常处理使用try-cache
app.use(errorHandler({
    template : 'frontend/dist/views/error.ejs',
    html : function (err){
        console.log("报错啦:"+err);
    }
}));
//路由设置+异常处理
routes(app);

module.exports = app;