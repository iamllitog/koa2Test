/**
 * Created by litong on 16-1-7.
 */
fis.set('project.ignore',['components/**','fis-conf.js']);
fis.hook('commonjs',{});
fis.match('::package',{
    postpackager : fis.plugin('loader',{
        resourceType : 'commonJs',
        useInlineMap : true
    })
});

fis.match('{externalM/amazeui/css/amazeui.min.css}',{
    packTo : '/static/pkg/pkg.css'
});

fis.match('internalM/**.scss',{
    release : '/static/$0',
    url : '$0',
    rExt : '.css',
    parser : fis.plugin('node-sass',{
        include_paths:[
            './components/compass'
        ]
    })
});

fis.match('views/**.ejs',{
    isHtmlLike : true
});

fis.match('inlinePart/**',{
    release : false
});

fis.match('*.png',{
    optimizer : fis.plugin('png-compressor',{
        type : 'pngquant'
    }),
    release : '/static/$0',
    url : '$0',
});

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
        globals : {
            //全局变量忽略--amd
            "define" : false,
            "require" : false
        }
    })
});

fis.match("{externalM/**,!externalM/mod.js}",{
    release : '/static/$0',
    url : '$0',
    isMod : true
});

fis.match('externalM/mod.js',{
    release : '/static/$0',
    url : '$0',
    isMod : false
});