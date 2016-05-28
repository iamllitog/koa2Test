/**
 * Created by litong on 15-12-28.
 * node代码检测工具
 */
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jshintStylish = require('jshint-stylish');
var map = require('map-stream');
var shell = require('gulp-shell');
var del = require('del');

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
    gulp.start(['nodeHint']);
});

//默认任务，前端开发任务
gulp.task('developFrontend',shell.task([
    'cd frontend/src && fis3 release -d ../dist -wl'
]));

//默认任务，前端发布任务
gulp.task('developPublish',shell.task([
    'cd frontend/src && fis3 release publish -d ../dist -l'
]));

//删除前端生成文件
gulp.task('delFrontDist',function(done){
    del(['frontend/dist','!frontend/dist/views/**'],done);
});

//默认任务，开发任务
gulp.task('default',function(){
    gulp.start(['developBack','delFrontDist','developFrontend']);
});

//发布任务
gulp.task('publish',function(){
    gulp.start(['publishBack','delFrontDist','developPublish']);
});