'use strict';

angular
.module('evalu8Demo')

.service('UserBookService', ['$http','$rootScope','$cookieStore', function(
	$http, $rootScope, $cookieStore) {

		 $rootScope.globals = $cookieStore.get('globals')
		 || {};
	
		 var config = {
				 headers : {
					 'x-authorization' : $rootScope.globals.authToken,
					 'Accept' : 'application/json;odata=verbose'
				 }
		 };
	
		 this.getUserBooks = function(callback) {
	
			 var userBooks = [];
	
			 $http.get(evalu8config.apiUrl + "/userbooks", config)
			 .success(function(response) {
	
				 userBooks = response;
				 callback(userBooks);
			 })
			 .error(function() {
				 callback(userBooks);
			 });
		 };
	} 
])