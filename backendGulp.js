/**
 * Created by litong on 15-12-28.
 */
'use strict';
const gulp = require('gulp');
const jshint = require('gulp-jshint');
const jshintStylish = require('jshint-stylish');
const map = require('map-stream');

//nodejs 代码检测
const hintDirs = ['**/**.js','!node_modules/**','!frontend/**'];
const hintOption = {
    esnext : true,
    node : true
};
gulp.task('nodeHint',() => {
    gulp.src(hintDirs)
        .pipe(jshint(hintOption))
        .pipe(jshint.reporter(jshintStylish));
});

//默认任务，开发任务
gulp.task('developBack',() => {
    gulp.start(['nodeHint']);
    gulp.watch(hintDirs,['nodeHint']);
});


//发布任务
gulp.task('publishBack',() =>{
    gulp.src(hintDirs)
        .pipe(jshint(hintOption))
        .pipe(jshint.reporter(jshintStylish))
        .pipe(map((file,cb) => {
            if(!file.jshint.success){
                console.error('jshint failed');
                process.exit(1);
            }
        }));
});