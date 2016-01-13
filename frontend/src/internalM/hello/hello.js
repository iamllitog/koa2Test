/**
 * Created by litong on 16-1-4.
 */
/**
 * @require /externalM/boot/browser-polyfill.js
 * @require /externalM/boot/external-helpers.js
 * @require /externalM/jquery.js
 * @require /externalM/amazeui/js/amazeui.js
 * @require /externalM/jqRaty/jquery.raty.js
 * @require /externalM/avalon/avalon.shim.js
 * @require /internalM/hello/hello.scss
 * @require /externalM/amazeui/css/amazeui.min.css
 */

function test(){
    return new Promise((resolve) => {
        setTimeout(resolve,1000);
    }).then(() => {
        $('body').css('background','red');
    });
}

test();