'use strict';

angular.module('evalu8Demo')

.service('HttpService',['$http', 'UuidService', function ($http, UuidService) {
	
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
	
	this.get = function(url, methodConfig){
		var config = $.extend({}, this.getConfig(), methodConfig);
		return $http.get(url, config);
	}
	
	this.head = function(url, methodConfig, skipAuth){
		
		var config;
		if(skipAuth) {
			config = $.extend({}, methodConfig);	
		} else {
			config = $.extend({}, this.getConfig(), methodConfig);
		}
		
		return $http.head(url, config);
	}
	
	this.post = function(url, data, methodConfig, skipAuth){
		var config;
		if(skipAuth) {
			config = $.extend({}, methodConfig);	
		} else {
			config = $.extend({}, this.getConfig(), methodConfig);
		}
		
		return $http.post(url, data, config);
	}
	
	this.put = function(url, data, methodConfig){
		var config = $.extend({}, this.getConfig(), methodConfig);
		return $http.put(url, data, config);
	}
	
	this.delete = function(url, methodConfig){
		var config = $.extend({}, this.getConfig(), methodConfig);
		return $http.delete(url, config);
	}
}]);