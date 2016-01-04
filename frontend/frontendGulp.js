/**
 * Created by litong on 15-12-31.
 */
var gulp = require('gulp');
var fileInclude = require('gulp-file-include');

//在html中引入任务
var _includeSrc = __dirname+'/src/**/*.ejs';
var fileIncludeFun = function(cb,includeSrc){
    var destSrc = __dirname+'/dist';
    if(!includeSrc){
        includeSrc = _includeSrc;
    }else{
        destSrc = destSrc + includeSrc.substring(__dirname.length+4,includeSrc.lastIndexOf('/'));
    }
    return gulp.src(includeSrc)
        .pipe(fileInclude({
            prefix : '@@',
            basepath : '@file'
        }))
        .on('error',function(err){
            console.error("ERROR:file-include:"+err.message);
            cb(err);
        })
        .pipe(gulp.dest(destSrc));
};

gulp.task('fileInclude:all',[],function(cb){
    return fileIncludeFun(cb);
});

//webpack打包
var webpackFun = function(){

};

//前端开发任务
gulp.task('developFront', function(){
    gulp.start('fileInclude:all');
    gulp.watch([_includeSrc],function(event){
        console.log('fileInclude:'+event.path);
        fileIncludeFun(null,event.path);
    });
});
//前端发布任务
gulp.task('publishFront', ['fileInclude:all'], function(){
});