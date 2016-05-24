/**
 * Created by litong on 16-1-4.
 */
/**
 * @require /externalM/jquery.js
 * @require /externalM/amazeui/js/amazeui.js
 * @require /externalM/jqRaty/jquery.raty.js
 * @require /externalM/avalon/avalon.shim.js
 * @require /internalM/hello/hello.scss
 * @require /externalM/amazeui/css/amazeui.min.css
 * @require /externalM/es6-promise.js
 */

function backgroundChange(){
    return new Promise(function(resolve){
        setTimeout(resolve,1000);
    }).then(function(){
        $('body').css('background','red');
    });
}