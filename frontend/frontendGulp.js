/**
 * Created by litong on 15-12-31.
 */
var spawn = require('child_process').spawn;

var gulp = require('gulp');
var wrench = require('wrench');
var watch = require('gulp-watch');

var fileInclude = require('gulp-file-include');
var webpack = require('gulp-webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

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
var webpackInternalMFun = function(cb,webPackSrc){
    var destSrc = __dirname+'/dist/static';
    var entry = {};

    if(webPackSrc){
        var packSrc = webPackSrc.substring((__dirname + '/src/internalM').length);
        entry[packSrc] = webPackSrc;
    }else{
        wrench.readdirSyncRecursive(__dirname + '/src/internalM').filter(function(file) {
            return (/\.js$/i).test(file);
        }).map(function(file) {
            entry[file] = __dirname + '/src/internalM/' + file;
        });
    }

    return gulp.src(_webpackInternalMSrc)
        .pipe(webpack({
            entry : entry,
            output : {
                filename : 'internalM/[name]'
            },
            module : {
                loaders:[
                    {test : /\.css$/,loader : 'style!css'},
                    {test : /\.(scss|sass)$/,loader : 'style!css!sass'},
                    {test : /\.js$/,loader : 'babel'}
                ]
            },
            plugins : [
                new ExtractTextPlugin('internalM/[name].css')
            ]
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
    watch(_includeSrc,function(file){
        console.log('fileInclude:'+file.path);
        fileIncludeFun(null,file.path);
    });

    gulp.start('webpackSingle:all');
    watch(_webpackInternalMSrc,function(file){
        if(file.event === 'add' || file.event === 'change'){
            webpackInternalMFun(null,file.path);
        }
    });
});
//前端发布任务
gulp.task('publishFront', function(){
    gulp.start('fileInclude:all');
    gulp.start('webpackSingle:all');
});