/**
 * Created by litong on 15-12-31.
 */
var gulp = require('gulp');
var wrench = require('wrench');

var fileInclude = require('gulp-file-include');
var webpack = require('gulp-webpack');

//在html中引入任务
var _includeSrc = __dirname+'/src/**/*.ejs';
var fileIncludeFun = function(cb,includeSrc){
    var destSrc = __dirname+'/dist';
    if(!includeSrc){
        includeSrc = _includeSrc;
    }else{
        destSrc = destSrc + includeSrc.substring(__dirname.length+'/src'.length,includeSrc.lastIndexOf('/'));
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

//webpack单独页面打包
var _webpackInternalMSrc = __dirname+'/src/internalM/**/*.js';
var webpackInternalMFun = function(cb,webpackSrc){
    var destSrc = __dirname+'/dist';

    var entry = {};
    if(!webpackSrc){
        wrench.readdirSyncRecursive(__dirname + '/src/internalM').filter(function(file) {
            return (/\.js$/i).test(file);
        }).map(function(file) {
            console.log(file);
            entry[file] = __dirname + '/src/internalM/' + file;
        });
    }else{
        var packSrc = webpackSrc.substring(__dirname.length+'/src/internalM'.length);
        entry[packSrc] = webpackSrc;
    }

    return gulp.src(_webpackInternalMSrc)
        .pipe(webpack({
            entry : entry,
            output : {
                filename : 'internalM/[name]'
            }
        }))
        .on('error',function(err){
            console.error("ERROR:webpack:"+err.message);
            cb(err);
        })
        .pipe(gulp.dest(destSrc));
};
gulp.task('webpackSingle:all',[],function(cb){
    return webpackInternalMFun(cb);
});

//前端开发任务
gulp.task('developFront', function(){
    gulp.start('fileInclude:all');
    gulp.watch([_includeSrc],function(event){
        console.log('fileInclude:'+event.path);
        fileIncludeFun(null,event.path);
    });

    gulp.start('webpackSingle:all');
    gulp.watch([_webpackInternalMSrc],function(event){
        console.log('webpackSingle:'+event.path);
        webpackInternalMFun(null,event.path);
    });
});
//前端发布任务
gulp.task('publishFront', ['fileInclude:all'], function(){
});