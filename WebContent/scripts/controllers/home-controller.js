'use strict';

angular.module('evalu8Demo')
  .controller('HomeController', function ($scope) {
    
  });angular.module('blockUI').run(['$templateCache', function($templateCache){
	  $templateCache.put('angular-block-ui/angular-block-ui.ng.html', '<div class=\"block-ui-overlay\"></div><div class=\"block-ui-message-container\" aria-live=\"assertive\" aria-atomic=\"true\"><div class=\"block-ui-message\" ng-class=\"$_blockUiMessageClass\"><div class="fa fa-spinner fa-pulse "></div></div></div>');
  }]);
