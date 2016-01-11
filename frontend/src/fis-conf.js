/**
 * Created by litong on 16-1-7.
 */
fis.set('project.ignore',['components/**','fis-conf.js']);
fis.hook('commonjs',{});
fis.match('::package',{
    postpackager : fis.plugin('loader',{
        resourceType : 'commonJs',
        useInlineMap : true
    }),
    spriter : fis.plugin('csssprites',{
        margin: 80,
        layout: 'matrix'
    })
});

//------------------css打包------------------
fis.match('{externalM/amazeui/css/amazeui.min.css}',{
    packTo : '/static/pkg/pkg.css'
});
fis.media('publish').match('{externalM/amazeui/css/amazeui.min.css}',{
    packTo : '/static/pkg/pkg.css',
    optimizer : fis.plugin('clean-css'),
    useHash : true
});

//------------------内部css------------------
fis.match('internalM/**.scss',{
    release : '/static/$0',
    url : '$0',
    rExt : '.css',
    useSprite: true,
    parser : fis.plugin('node-sass',{
        include_paths:[
            './components/compass'
        ]
    })
});
fis.media('publish').match('internalM/**.scss',{
    release : '/static/$0',
    url : '$0',
    rExt : '.css',
    useSprite: true,
    parser : fis.plugin('node-sass',{
        include_paths:[
            './components/compass'
        ]
    }),
    optimizer : fis.plugin('clean-css'),
    useHash : true
});

//------------------ejs------------------
fis.match('views/**.ejs',{
    isHtmlLike : true
});

//------------------ejs内部引用------------------
fis.match('inlinePart/**',{
    release : false
});

//------------------图片------------------
fis.match('*.png',{
    optimizer : fis.plugin('png-compressor',{
        type : 'pngquant'
    }),
    release : '/static/$0',
    url : '$0',
});

//------------------js内部引用------------------
fis.match('internalM/**.js',{
    release : '/static/$0',
    url : '$0',
    isMod : true,
    parser: fis.plugin('babel-5.x',{
        stage : 3,
        externalHelpers : true
    }),
    lint : fis.plugin('jshint',{
        i18n : 'zh-CN',
        esnext : true,
        camelcase :false,			//驼峰法命名
        curly : false,				//大口号包裹
        eqeqeq : true,				//对于简单类型，使用===和!==，而不是==和!=
        newcap : true,				//对于首字母大写的函数（声明的类），强制使用new
        noarg : true,				//禁用arguments.caller和arguments.callee
        sub : false,				//对于属性使用aaa.bbb而不是aaa['bbb']
        undef : true,				//查找所有未定义变量
        boss : true,				//查找类似与if(a = 0)这样的代码
        devel : true,				//定义用于调试的全局变量： console ， alert
        browser : true,				//浏览器环境
        nonstandard:true,
        scripturl:true,				//允许JavaScript:void 0
    })
});
fis.media('publish').match('internalM/**.js',{
    release : '/static/$0',
    url : '$0',
    isMod : true,
    parser: fis.plugin('babel-5.x',{
        stage : 3,
        externalHelpers : true
    }),
    lint : fis.plugin('jshint',{
        i18n : 'zh-CN',
        esnext : true,
        camelcase :false,			//驼峰法命名
        curly : false,				//大口号包裹
        eqeqeq : true,				//对于简单类型，使用===和!==，而不是==和!=
        newcap : true,				//对于首字母大写的函数（声明的类），强制使用new
        noarg : true,				//禁用arguments.caller和arguments.callee
        sub : false,				//对于属性使用aaa.bbb而不是aaa['bbb']
        undef : true,				//查找所有未定义变量
        boss : true,				//查找类似与if(a = 0)这样的代码
        devel : true,				//定义用于调试的全局变量： console ， alert
        browser : true,				//浏览器环境
        nonstandard:true,
        scripturl:true,				//允许JavaScript:void 0
    }),
    useHash : true,
    optimizer : fis.plugin('uglify-js',{
        mangle : {
            except : 'exports,module,require,define'
        },compress:{
            drop_console : true
        }
    })
});

//------------------js外部引用------------------
fis.match("{externalM/**.js,!externalM/boot/mod.js}",{
    release : '/static/$0',
    url : '$0',
    isMod : true
});
fis.media('publish').match("{externalM/**.js,!externalM/boot/mod.js}",{
    release : '/static/$0',
    url : '$0',
    isMod : true,
    optimizer : fis.plugin('uglify-js',{
        mangle : {
            except : 'exports,module,require,define'
        },compress:{
            drop_console : true
        }
    }),
    useHash : true
});

//------------------资源外部引用------------------
fis.match("{externalM/**,!externalM/**.js}",{
    release : '/static/$0',
    url : '$0'
});
fis.match("{externalM/**.css,!externalM/**.js}",{
    release : '/static/$0',
    url : '$0',
    optimizer : fis.plugin('clean-css'),
    useHash : true
});

//------------------modjs引用------------------
fis.match('externalM/boot/mod.js',{
    release : '/static/$0',
    url : '$0',
    isMod : false
});
fis.media('publish').match('externalM/boot/mod.js',{
    release : '/static/$0',
    url : '$0',
    isMod : false,
    optimizer : fis.plugin('uglify-js',{
        mangle : {
            except : 'exports,module,require,define'
        },compress:{
            drop_console : true
        }
    })
});