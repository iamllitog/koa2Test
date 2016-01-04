/**
 * Created by litong on 15-12-28.
 * node代码检测工具
 */
var gulp = require('gulp');
require('./backendGulp');
require('./frontend/frontendGulp');

//默认任务，开发任务
gulp.task('default',function(){
    gulp.start(['developBack','developFront']);
});

//发布任务
gulp.task('publish',function(){
    gulp.start(['publishBack','publishFront']);
});