/**
 * Created by litong on 15-12-30.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const router = require('koa-router');

const testRoute = router();

//遍历frontend/src/test 的文件，生成对应测试路由
var testFolder = path.join(__dirname, '../frontend/src/test');

function walk(path){  
  var dirList = fs.readdirSync(path);
  var startIndex = testFolder.length;
  dirList.forEach(function(item){
    if(fs.statSync(path + '/' + item).isDirectory()){
      walk(path + '/' + item);
    }else{
      var url = path + '/' + item;
      if(url.endsWith('test.ejs')){
      	url = url.substring(startIndex,url.length - '.test.ejs'.length);
				testRoute.get(url,function *(){
				    yield this.render('test/'+url.substring(1) + '.test.ejs');
				});
      }
    }
  });
}

walk(testFolder);

module.exports = testRoute;