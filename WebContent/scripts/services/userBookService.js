'use strict';

angular
.module('evalu8Demo')

.service('UserBookService', ['$http','$rootScope','$cookieStore', function(
	$http, $rootScope, $cookieStore) {
	
		$rootScope.globals = JSON.parse(sessionStorage.getItem('globals'));
	
		 var config = {
				 headers : {
					 'x-authorization' : $rootScope.globals.authToken,
					 'Accept' : 'application/json;odata=verbose'
				 }
		 };
	
		 this.getUserBooks = function(callback) {
	
			 var userBooks = [];
	
			 $http.get(evalu8config.apiUrl + "/my/importbooks", config)
			 .success(function(response) {
	
				 userBooks = response;
				 callback(userBooks);
			 })
			 .error(function() {
				 callback(userBooks);
			 });
		 };
		 
		 this.importUserBooks = function(userBooks,callback) {				

			 $http.post(evalu8config.apiUrl + "/my/importbooks", userBooks,config)
			 .success(function() {					
				 callback(true);
			 })
			 .error(function() {				 
				 callback(false);			
			 });
		 };
		 
	} 
])