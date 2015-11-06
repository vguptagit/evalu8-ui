'use strict';

angular
.module('evalu8Demo')

.service('UserService',[
			'$http',
			'$rootScope',
			'$location',
			'$cookieStore', 'HttpService',
			function($http, $rootScope, $location, $cookieStore, HttpService) {

				this.userPrintSettings = function(callback) {
					HttpService.get(evalu8config.apiUrl+ '/settings/printsettings')
					.success(function(response) {
						callback(response)
					})
					.error(function (error, status) {
						callback(null)
					});
				};

				this.userDisciplines = function(callback) {

					HttpService.get(evalu8config.apiUrl + "/settings/disciplines/")
					.success(function(response) {

						callback(response);
					})
					.error(function (error, status) {
					callback(null);
				  })
				};

				this.userBookIDs = function(callback) {

					var userBookIDs = [];

					HttpService.get(evalu8config.apiUrl + '/settings/books')
					.success(function(response) {

						if (response != "") {
							response.forEach(function(item) {
								userBookIDs.push(item);
							});
						}

						callback(userBookIDs);
					})
					.error(function (error, status) {
						callback(null);
					}) 
				};

				this.userQuestionMetadata = function(callback) {

					var userQuestionMetadata = [];
					HttpService.get(evalu8config.apiUrl+ "/settings/questionmetadata/")
					.success(
							function(response) {

								if (response != "") {
									response
											.forEach(function(
													item) {
												userQuestionMetadata
														.push(item);
											});
								}

								callback(userQuestionMetadata);
							})
							.error(function (error, status) {
								callback(null);
							}) 

				};

				this.saveUserBooks = function(userBookIDs, callback) {

					HttpService.post(
							evalu8config.apiUrl + '/settings/books',
							userBookIDs).success(
							function(response) {
								if (callback)
									callback();
							}).error(function(error, status) {
								callback(null);
					})
				}

				this.saveUserDisciplines = function(
						userDisciplines, callback) {

					HttpService.post(
							evalu8config.apiUrl
									+ '/settings/disciplines',
							userDisciplines).success(
							function(response) {
								if (callback)
									callback();
							}).error(function(error, status) {

					})
				}

				this.saveUserQuestionMetadata = function(userQuestionMetadata, callback) {

					HttpService
							.post(
									evalu8config.apiUrl
											+ '/settings/questionmetadata',
									userQuestionMetadata)
							.success(
									function(response) {
										callback(true);
									})
							.error(
									function(error, status) {
										callback(false);
									})
				}
				
				this.getConfig = function(){
					if(config.headers["x-authorization"] == null){
						config.headers["x-authorization"] = $cookieStore.get('globals').authToken;
					}
					else if(config.headers["x-authorization"].length == 0){
						config.headers["x-authorization"] = $cookieStore.get('globals').authToken;
					}
					return config;
				}
} ])