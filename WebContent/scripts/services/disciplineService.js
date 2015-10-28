'use strict';

angular.module('evalu8Demo')

.service('DisciplineService', 
		['$http', '$rootScope', '$cookieStore', 'HttpService',
	 function($http, $rootScope, $cookieStore, HttpService) {
		
		
		this.allDisciplines = function(callback) {
			
			$http.get(evalu8config.apiUrl + "/disciplines/", HttpService.getConfig())
			.success(function(response) {				
						
				if(response == null) {
					response = [];
				}
				callback(response);
			})
			.error(function(){
				callback(null);
			});
		};
		
		this.userDisciplines = function(callback) {				
			var userDisciplines = [];
			$http.get(evalu8config.apiUrl + "/settings/disciplines/", HttpService.getConfig())
			.success(function(response) {
						
				response.forEach (function(item) {    							
					userDisciplines.push({"item": item});    							    							
				});
				callback (userDisciplines);
			})
			.error(function(){
				callback(null);
			});
			
		};			
		
}])