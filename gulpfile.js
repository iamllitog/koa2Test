/**
 * Created by litong on 15-12-28.
 * node代码检测工具
 */
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jshintStylish = require('jshint-stylish');
var map = require('map-stream');
var shell = require('gulp-shell');

//nodejs 代码检测
var hintDirs = ['**/**.js','!node_modules/**','!frontend/**'];
var hintOption = {
    esnext : true,
    node : true
};
gulp.task('nodeHint',function(){
    gulp.src(hintDirs)
        .pipe(jshint(hintOption))
        .pipe(jshint.reporter(jshintStylish));
});

//默认任务，开发任务
gulp.task('developBack',function(){
    gulp.start(['nodeHint']);
    gulp.watch(hintDirs,['nodeHint']);
});


//发布任务
gulp.task('publishBack',function(){
    gulp.src(hintDirs)
        .pipe(jshint(hintOption))
        .pipe(jshint.reporter(jshintStylish))
        .pipe(function(file){
            if(!file.jshint.success){
                console.error('jshint failed');
                process.exit(1);
            }
        });
});

//默认任务，开发任务
gulp.task('default',function(){
    gulp.start(['developBack']);
});

//发布任务
gulp.task('publish',function(){
    gulp.start(['publishBack']);
});