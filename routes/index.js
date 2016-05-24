/**
 * Created by litong on 15-12-30.
 */
'use strict';

const router = require('koa-router');

const indexRoute = router();
const errorHandle = require('./errorHandle');
const testRoute = require('./test');

//首页路由
indexRoute.get('/',function *(){
    yield this.render('hello');
});
indexRoute.get('/index',function *(){
    yield this.render('hello');
});

//测试路由
indexRoute.use('/test',testRoute.routes());

/**
 * 设置路由
 * @param app
 */
module.exports = (app) => {
    app.use(indexRoute.routes());
    errorHandle(app);
};