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
										evalu8config.apiUrl + "/books?discipline=" + discipline, config)
										.success(
												function(response) {
													
													response.forEach (function(item) {
														item.hasEdition = false;
														item.showEdition = true;
														item.isSelected = false;
														item.isCollasped = false;
														disciplineBooks.push(item);    							    							
													});
													
													callback(disciplineBooks);
												});
							};
							
							this.userBooks = function(callback) {
								
								var url = evalu8config.apiUrl
								+ "/books?userBooks=true";

								$http.get(url, config)
								.success(
										function(response) {
											
											callback(response);
										});
							};

						} ])