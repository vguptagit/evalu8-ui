'use strict';

angular
		.module('evalu8Demo')

		.service(
				'UserService',
				[
						'$http',
						'$rootScope',
						'$location',
						'$cookieStore',
						function($http, $rootScope, $location, $cookieStore) {

							$rootScope.globals = $cookieStore.get('globals')
									|| {};

							if ($rootScope.globals.authToken == '') {
								$location.path('/login');
							}

							var config = {
								headers : {
									'x-authorization' : $rootScope.globals.authToken,
									'Accept' : 'application/json;odata=verbose'
								}
							};

							this.userPrintSettings = function(callback) {
								$http.get(
										evalu8config.host
												+ '/settings/printsettings',
										config).success(function(response) {
									callback(response)
								});
							};

							this.userDisciplines = function(callback) {

								var userDisciplines = [];
								$http.get(
										evalu8config.host
												+ "/settings/disciplines/",
										config).success(function(response) {

									if (response != "") {
										response.forEach(function(item) {
											userDisciplines.push(item);
										});

									}

									callback(userDisciplines);
								});

							};

							this.userBookIDs = function(callback) {

								var userBookIDs = [];

								$http.get(
										evalu8config.host + '/settings/books',
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
												evalu8config.host
														+ "/settings/questionmetadata/",
												config)
										.success(
												function(response) {

													if(response != "") {
														response.forEach(function(item) {
															userQuestionMetadata.push(item);
														});
													}
													
													callback(userQuestionMetadata);
												});

							};

							this.saveUserBooks = function(userBookIDs, callback) {

								$http.post(
										evalu8config.host + '/settings/books',
										userBookIDs, config).success(
										function(response) {
											if(callback)
												callback();
										}).error(function(error, status) {
									if (status == 403)
										$location.path('/login');
								})
							}

							this.saveUserDisciplines = function(userDisciplines, callback) {

								$http.post(
										evalu8config.host
												+ '/settings/disciplines',
										userDisciplines, config).success(
										function(response) {
											if(callback)
												callback();
										}).error(function(error, status) {

									if (status == 403)
										$location.path('/login');
								})
							}

							this.saveUserQuestionMetadata = function(
									userQuestionMetadata) {

								$http
										.post(
												evalu8config.host
														+ '/settings/questionmetadata',
												userQuestionMetadata, config)
										.success(
												function(response) {
													document
															.getElementById("divSaveMessage").innerHTML = "<span style='color:green'>Settings saved successfully<span>";
												})
										.error(
												function(error, status) {
													document
															.getElementById("divSaveMessage").innerText = error.message;
													if (status == 403)
														$location
																.path('/login');
												})
							}
						} ])