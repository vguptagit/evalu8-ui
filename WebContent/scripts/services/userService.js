'use strict';

angular
.module('evalu8Demo')

.service('UserService',[
			'$http',
			'$rootScope',
			'$location',
			'$cookieStore',
			function($http, $rootScope, $location, $cookieStore) {

				$rootScope.globals = $cookieStore.get('globals')
						|| {};

				var config = {
					headers : {
						'x-authorization' : $rootScope.globals.authToken,
						'Accept' : 'application/json;odata=verbose'
					}
				};

				this.userPrintSettings = function(callback) {
					$http.get(
							evalu8config.apiUrl
									+ '/settings/printsettings',
							config).success(function(response) {
						callback(response)
					});
				};

				this.userDisciplines = function(callback) {

					var userDisciplines = [];
					$http
							.get(
									evalu8config.apiUrl
											+ "/settings/disciplines/",
											this.getConfig())
							.success(
									function(response, status) {

										if (response != "") {
											response
													.forEach(function(
															item) {
														userDisciplines
																.push(item);
													});

										}

										callback(userDisciplines,
												status);
									}).error(
									function(error, status) {
										callback(userDisciplines, status);
									});
				};

				this.userBookIDs = function(callback) {

					var userBookIDs = [];

					$http.get(
							evalu8config.apiUrl + '/settings/books',
							config).success(function(response) {

						if (response != "") {
							response.forEach(function(item) {
								userBookIDs.push(item);
							});
						}

						callback(userBookIDs);
					});
				};

				this.userQuestionMetadata = function(callback) {

					var userQuestionMetadata = [];
					$http
							.get(
									evalu8config.apiUrl
											+ "/settings/questionmetadata/",
									config)
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
									});

				};

				this.saveUserBooks = function(userBookIDs, callback) {

					$http.post(
							evalu8config.apiUrl + '/settings/books',
							userBookIDs, config).success(
							function(response) {
								if (callback)
									callback();
							}).error(function(error, status) {

					})
				}

				this.saveUserDisciplines = function(
						userDisciplines, callback) {

					$http.post(
							evalu8config.apiUrl
									+ '/settings/disciplines',
							userDisciplines, config).success(
							function(response) {
								if (callback)
									callback();
							}).error(function(error, status) {

					})
				}

				this.saveUserQuestionMetadata = function(userQuestionMetadata, callback) {

					$http
							.post(
									evalu8config.apiUrl
											+ '/settings/questionmetadata',
									userQuestionMetadata, config)
							.success(
									function(response) {
										document
												.getElementById("divSaveMessage").innerHTML = "<p style='color:green'>Settings saved successfully</p>";
										callback(true);
									})
							.error(
									function(error, status) {
										document
												.getElementById("divSaveMessage").innerText = "<p style='color:red'>Error saving settings</p>" + "<p>" + error.message + "</p>";
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