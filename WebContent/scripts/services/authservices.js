'use strict';

angular.module('e8Login')

.factory('AuthenticationService',
		['$http', '$rootScope', '$timeout', 'HttpService',
		 function ($http, $rootScope, $timeout, HttpService) {
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
					
					var piconfig = {
							headers : {
								'AccessToken' : event.data,
								'Accept' : 'application/json;odata=verbose'
							}
						};
					
					HttpService.head(evalu8config.apiUrl + '/login', piconfig, true)
					.success(function(data, status, headers) { 

	                    $rootScope.globals.authToken = headers("x-authorization");
	                    sessionStorage.setItem('globals', JSON.stringify($rootScope.globals));
					})
					.error(function(data, status) {

					})						
                }
			};	
			
			return service;
		}])
