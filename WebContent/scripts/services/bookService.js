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

							$rootScope.globals = JSON.parse(sessionStorage.getItem('globals'));

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
										evalu8config.apiUrl
												+ "/books?discipline="
												+ discipline, config).success(
										function(response) {

											response.forEach(function(item) {
												item.hasEdition = false;
												item.showEdition = true;
												item.isSelected = false;
												item.isCollasped = false;
												disciplineBooks.push(item);
											});

											callback(disciplineBooks);
										})
										.error(
												function(error) {

													callback (null);
												})	
							};

							this.userDisciplineBooks = function(discipline,
									callback) {
								var disciplineBooks = [];

								$http.get(evalu8config.apiUrl
										+ "/books?discipline="
										+ discipline.item
										+ "&userBooks=true", config).success(
										function(response) {

											response.forEach(function(item) {
												item.hasEdition = false;
												item.showEdition = true;
												item.isSelected = false;
												item.isCollasped = false;
												disciplineBooks.push(item);
											});

											if(disciplineBooks.length == 0) {

												var emptyNode = { "nodeType": "empty", "draggable": false, "title": "There are no books selected under this Discipline", "sequence": 0 }
												disciplineBooks.push(emptyNode);
											}
											callback(disciplineBooks);
										})
										.error(
												function(error) {

													callback (null);
												});
							}
							
							this.userBooks = function(callback) {

								var url = evalu8config.apiUrl
										+ "/books?userBooks=true";

								$http.get(url, config).success(
										function(response) {

											callback(response);
										})
										.error(
												function(error) {

													callback (null);
												})
							};
						} ])