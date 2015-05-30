'use strict';

angular
		.module('evalu8Demo')

		.service(
				'questionService',
				[
						'$http',
						'$rootScope',
						'$cookieStore',
						function($http, $rootScope, $cookieStore) {

							$rootScope.globals = $cookieStore.get('globals')
									|| {};
							var config = {
								headers : {
									'x-authorization' : $rootScope.globals.authToken,
									'Accept' : 'application/json;odata=verbose'
								}
							};

							this.getAllQuestionsOfContainer = function(bookid,
									containerid, callback) {

								var questions = [];
								var url = evalu8config.apiUrl + "/books/"
										+ bookid + "/nodes/" + containerid
										+ "/questions?flat=1";

								$http.get(url, config).success(
										function(response) {
											response.forEach(function(item) {
												questions.push(item);
											});

											callback(questions);

										}).error(function() {
									callback(questions);
								});

							};

						} ]);