'use strict';

angular.module('evalu8Demo')

.service('HttpService',['UuidService', function (UuidService) {
	
	this.getConfig = function(){

		var globals = JSON.parse(sessionStorage.getItem('globals'));

		var config = {
			headers : {
				'x-authorization' : globals.authToken,
				'Accept' : 'application/json;odata=verbose',
				'Correlation-Id' : UuidService.newuuid()
			}
		};
		
		return config;
	};
}]);