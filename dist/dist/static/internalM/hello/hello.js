define('internalM/hello/hello', function(require, exports, module) {

  /**
   * Created by litong on 16-1-4.
   */
  'use strict';
  
  require('externalM/browser-polyfill');
  
  require('externalM/external-helpers');
  
  var _externalMJquery = require('externalM/jquery');
  
  var _externalMJquery2 = babelHelpers.interopRequireDefault(_externalMJquery);
  
  var _externalMAvalonAvalonShim = require('externalM/avalon/avalon.shim');
  
  var _externalMAvalonAvalonShim2 = babelHelpers.interopRequireDefault(_externalMAvalonAvalonShim);
  
  function timeout(ms) {
      return new Promise(function (resolve) {
          setTimeout(resolve, ms);
      }).then(function () {
          (0, _externalMJquery2['default'])('body').css('background', 'red');
      });
  }
  
  timeout(2000);

});
