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
								 
								$http.get(
										evalu8config.host + "/books?discipline=" + discipline, config)
										.success(
												function(response) {
													
													response.forEach (function(item) {    							
														disciplineBooks.push(item);    							    							
													});
													
													callback(disciplineBooks);
												});
							};

						} ])