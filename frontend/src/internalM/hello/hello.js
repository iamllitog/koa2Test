/**
 * Created by litong on 16-1-4.
 */
import '/externalM/boot/browser-polyfill';
import '/externalM/boot/external-helpers';
var $ = require('/externalM/jquery');
import '/externalM/jqRaty/jquery.raty';
import '/externalM/amazeui/js/amazeui';
import avalon from'/externalM/avalon/avalon.shim';

import '/internalM/hello/hello.scss';
import '/externalM/amazeui/css/amazeui.min.css';

function test(){
    return new Promise((resolve) => {
        setTimeout(resolve,1000);
    }).then(() => {
        $('body').css('background','red');
    });
}

test();