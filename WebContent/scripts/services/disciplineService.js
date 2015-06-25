'use strict';

angular.module('evalu8Demo')

.service('DisciplineService', 
		['$http', '$rootScope', '$cookieStore', 
	 function($http, $rootScope, $cookieStore) {
		
		$rootScope.globals = $cookieStore.get('globals') || {};
		var config = {
				headers : {
					'x-authorization' : $rootScope.globals.authToken,
					'Accept' : 'application/json;odata=verbose'
				}
		};
		
		this.allDisciplines = function(callback) {
			
			$http.get(evalu8config.apiUrl + "/disciplines/", config)
			.success(function(response) {				
						
				if(response == null) {
					response = [];
				}
				callback(response);
			});
		};
		
		this.userDisciplines = function(callback) {				
			var userDisciplines = [];
			$http.get(evalu8config.apiUrl + "/settings/disciplines/", config)
			.success(function(response) {
						
				response.forEach (function(item) {    							
					userDisciplines.push({"item": item});    							    							
				});
				callback (userDisciplines);
			});
			
		};			
		
}])