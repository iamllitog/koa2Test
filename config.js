/**
 * Created by litong on 15-12-29.
 */
'use strict';
/**
 * 应用配置文件--开发环境
 */
const develop = {
    //监听端口
    port : 8090,
    //cookie密钥
    cookieKeys : ['why i am ','a array?'],
    //redis 配置
    redisOption : {
        host : '127.0.0.1',
        port : 6379
    },
    //session 配置
    sessionOption : {
        cookie : {
            maxAge:1000 * 60 * 60   //设置过期时间--1小时
        }
    }
};

module.exports = develop;