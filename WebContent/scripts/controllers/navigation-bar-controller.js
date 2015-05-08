'use strict';

angular.module('evalu8Demo')

	.controller('NavigationBarController', ['$scope', '$rootScope', '$modal', 
      function ($scope, $rootScope, $modal) {
      //$scope.userName = $rootScope.globals.currentUser.username;
      
      $scope.settings_open = function() {
          
            $modal
            .open({
                templateUrl : 'views/usersettings.htm',
                controller : 'UserSettingsController',
                size : 'lg',
                backdrop : 'static',
                keyboard : false
            });
      }	  
	  
  }]);
