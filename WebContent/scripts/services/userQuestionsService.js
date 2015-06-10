'use strict';

angular.module('evalu8Demo')

.service('UserQuestionsService', 
		['$http', '$rootScope', '$location', '$cookieStore', 
	 function($http, $rootScope, $location, $cookieStore) {
		
		$rootScope.globals = $cookieStore.get('globals') || {};		
		 
		var config = {
				headers : {
					'x-authorization' : $rootScope.globals.authToken,
					'Accept' : 'application/json;odata=verbose'
				}
		};
		
		this.userQuestions = function(callback) {	

			var userQuestions = [];
			$http.get(evalu8config.apiUrl + "/my/questions", config)
				.success(function(response) {
					userQuestions= response;
					callback(userQuestions)
				})
				.error(function(){
					callback(userQuestions);
				})
		};
		
		this.userQuestionsCount = function(callback) {	

			var userQuestionsCount = 0;
			$http.get(evalu8config.apiUrl + "/my/questions/count", config)
				.success(function(response) {
					userQuestionsCount = response;
					callback(userQuestionsCount)
				})
				.error(function(){
					callback(userQuestionsCount);
				})
		};
	}
])		