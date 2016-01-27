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

};