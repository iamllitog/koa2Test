/**
 * Created by litong on 15-11-11.
 */
'use strict';

module.exports = (app) => {

    //404页面
    app.use(function *() {
        this.status = 404;
        yield this.render('notfound');
    });

    //异常捕获
    app.on('error',(err,ctx) => {
        console.error('server error:',err,ctx);
    });

};