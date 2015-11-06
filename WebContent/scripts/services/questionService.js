'use strict';

angular
		.module('evalu8Demo')

		.service(
				'questionService',
				[
						'$http',
						'$rootScope',
						'$cookieStore','HttpService',
						function($http, $rootScope, $cookieStore, HttpService) {

							this.getAllQuestionsOfContainer = function(bookid,
									containerid, callback) {

								var questions = [];
								var url = evalu8config.apiUrl + "/books/"
										+ bookid + "/nodes/" + containerid
										+ "/questions?flat=1";

								HttpService.get(url).success(
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