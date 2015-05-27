'use strict';

angular
.module('evalu8Demo')
.service('ContainerService',[
	'$http',
	'$rootScope',
	'$cookieStore',
	function($http, $rootScope, $cookieStore) {

		$rootScope.globals = $cookieStore.get('globals') || {};

		var config = {
			headers : {
				'x-authorization' : $rootScope.globals.authToken,
				'Accept' : 'application/json;odata=verbose'
			}
		};

		this.bookNodes = function(bookId, callback) {

			var bookNodes = [];				
			 
			$http.get(evalu8config.apiUrl + "/books/" + bookId + "/nodes", config)
			.success(function(response) {
				bookNodes = response;
				callback(bookNodes);
			})
			.error(function(){
				callback(bookNodes);
			});
		};
	}
]);