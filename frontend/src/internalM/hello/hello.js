/**
 * Created by litong on 16-1-4.
 */
import '/externalM/browser-polyfill';
import '/externalM/external-helpers';
import $ from '/externalM/jquery';
import avalon from'/externalM/avalon/avalon.shim';

function timeout(ms){
    return new Promise((resolve) => {
        setTimeout(resolve,ms);
    }).then(() => {
        $('body').css('background','red');
    });
}

timeout(2000);