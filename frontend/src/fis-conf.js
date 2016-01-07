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

fis.match('internalM/**.js',{
    release : '/static/$0',
    url : '$0',
    isMod : true,
    parser: fis.plugin('es6-babel',{})
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