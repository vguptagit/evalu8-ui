'use strict';

angular.module('e8Login')

.factory('AuthenticationService',
		['$http', '$cookieStore', '$rootScope', '$timeout',
		 function ($http, $cookieStore, $rootScope, $timeout) {
			var service = {};

			service.Login = function (username, password, callback) {
				
				var credentials = {'userName': username, 'password': password};
				
				$http.post(evalu8config.host + '/auth', credentials)
				.success(function (response) {
					
					var response = { 'success': true, 'token' : response.token, 'loginCount': response.loginCount };
					callback(response);
				})
				.error(function(data, status) {
					var response = { 'success': false, 'message' : data };
					callback(response);
				})
			};			

			service.SetCredentials = function (authToken, loginCount) {

				$rootScope.globals = {
						authToken: authToken,
						loginCount: loginCount
				};

				$cookieStore.put('globals', $rootScope.globals);
			};

			service.ClearCredentials = function () {
				$rootScope.globals = {
						authToken: '',
						loginCount: ''
				};

				$cookieStore.put('globals', $rootScope.globals);       
			};
			
			service.logout = function() {
				
				this.ClearCredentials();				
				
				piSession.logout();								
			};
						
			service.onLogout = function() {
				piSession.login(evalu8config.signinUrl, evalu8config.loginGraceTimeSeconds);
			};						

			return service;
		}])
