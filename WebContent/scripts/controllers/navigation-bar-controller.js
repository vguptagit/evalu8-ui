'use strict';

angular.module('evalu8Demo')

.controller(
		'NavigationBarController',
		[ '$scope', '$rootScope', '$modal', 'AuthenticationService',
				function($scope, $rootScope, $modal, AuthenticationService) {
					// $scope.userName =
					// $rootScope.globals.currentUser.username;

					$scope.logout = function() {

						AuthenticationService.logout();
					}
					
					$scope.settings_open = function() {

						$modal.open({
							templateUrl : 'views/usersettings.htm',
							controller : 'UserSettingsController',
							size : 'lg',
							backdrop : 'static',
							keyboard : false
						});
					}

				} ]);
