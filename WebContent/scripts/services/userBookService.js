'use strict';

angular
.module('evalu8Demo')

.service('UserBookService', ['$http','$rootScope','$cookieStore','HttpService', function(
	$http, $rootScope, $cookieStore, HttpService) {
	
		 this.getUserBooks = function(callback) {
	
			 var userBooks = [];
	
			 $http.get(evalu8config.apiUrl + "/my/importbooks", HttpService.getConfig())
			 .success(function(response) {
	
				 userBooks = response;
				 callback(userBooks);
			 })
			 .error(function() {
				 callback(null);
			 });
		 };
		 
		 this.importUserBooks = function(userBooks,callback) {				

			 $http.post(evalu8config.apiUrl + "/my/importbooks", userBooks, HttpService.getConfig())
			 .success(function() {					
				 callback(true);
			 })
			 .error(function() {				 
				 callback(false);			
			 });
		 };
		 
	} 
])