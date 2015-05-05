'use strict';

angular
		.module('evalu8Demo')

		.service(
				'BookService',
				[
						'$http',
						'$rootScope',
						'$cookieStore',
						function($http, $rootScope, $cookieStore) {

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

							this.disciplineBooks = function(discipline,
									callback) {

								var disciplineBooks = [];
								$
										.ajax({
											type : 'GET',
											async : false,
											url : evalu8config.host
													+ "/books?discipline="
													+ discipline,
											headers : {
												'x-authorization' : $rootScope.globals.authToken,
												'Accept' : 'application/json;odata=verbose'
											},
											success : function(response) {
												response
														.forEach(function(item) {
															disciplineBooks
																	.push(item);
														});
												callback(disciplineBooks);

											},
											error : function(error) {

											}
										});
							};

						} ])