/**
 * Created by litong on 16-1-4.
 */
import '/externalM/boot/browser-polyfill';
import '/externalM/boot/external-helpers';
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