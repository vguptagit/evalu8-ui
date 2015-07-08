'use strict';

angular.module('evalu8Demo')

.controller(
		'NavigationBarController',
		[ '$scope', '$rootScope', '$modal', 'AuthenticationService',
				function($scope, $rootScope, $modal, AuthenticationService) {
			$scope.isSettingsClicked=false;
			$scope.showUserInNavBar = function() {
				return (window.location.href.indexOf("signin") == -1) ? true : false;				
			}
  
			$scope.logout = function() {

				AuthenticationService.logout();
			}
			
			$scope.settings_open = function() {
				$scope.isSettingsClicked=true;
				$modal.open({
					templateUrl : 'views/usersettings.htm',
					controller : 'UserSettingsController',
					size : 'lg',
					backdrop : 'static',
					keyboard : false,
					resolve: {
			            parentScope: function () {
			                return $scope;
			            }
			        }
				});
			}

		} ]);
