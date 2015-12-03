'use strict';

angular.module('e8Login')

.factory('AuthenticationService',
		['$http', '$rootScope', '$timeout',
		 function ($http, $rootScope, $timeout) {
			var service = {};			

			service.SetCredentials = function (authToken, loginCount, givenName, familyName, emailAddress) {

				$rootScope.globals = {
						authToken: authToken,
						loginCount: loginCount,
						givenName: givenName, 
						familyName: familyName, 
						emailAddress: emailAddress
				};

				sessionStorage.setItem('globals', JSON.stringify($rootScope.globals));
			};

			service.ClearCredentials = function () {
				$rootScope.globals = null;

				sessionStorage.removeItem('globals');       
			};
			
			service.logout = function() {
				
				this.ClearCredentials();				
				
				piSession.logout();								
			};
						
			service.onLogout = function() {
				piSession.login(evalu8config.signinUrl, evalu8config.loginGraceTimeSeconds);
			};						

			service.onRefresh = function(event) {
				if($rootScope.globals) {
                    $rootScope.globals.authToken = event.data;
                    sessionStorage.setItem('globals', JSON.stringify($rootScope.globals));
                }
			};	
			
			return service;
		}])
