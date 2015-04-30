'use strict';

angular
		.module('e8Books')

		.controller(
				'BookController',
				[
						'$http',
						'$scope',
						'$rootScope',
						'$cookieStore',
						'$location',
						function($http, $scope, $rootScope, $cookieStore,
								$location) {

							$rootScope.globals = $cookieStore.get('globals')
									|| {};

							// Converts object to query string
							$scope.o2qs = function(o) {
								var qs = [];
								for ( var x in o) {
									qs.push(x + '=' + o[x]);
								}
								return qs.join('&');
							};

							if ($rootScope.globals.authToken == '') {
								$location.path('/login');
							} else {
								var config = {
									headers : {
										'x-authorization' : $rootScope.globals.authToken,
										'Accept' : 'application/json;odata=verbose'
									}
								};

								var ep = evalu8config.host + "/books";
								var s = $location.search();
								if (s) {

									s = $scope.o2qs(s);

								}

								ep = s ? ep + '?' + s : ep;

								$http.get(ep, config).success(
										function(response) {
											$scope.books = response;
										});
							}

							$scope.toggleSerchView = function() {

								$scope.searchview = $location.search() || !$scope.searchview;

								if (!$scope.$$phase && !$scope.$root.$$phase) {
									$scope.$apply()
								}
							};
							
							$scope.searchBooks = function() {

								if ($scope.searchparam)
									if ($scope.searchparam != "") {
										var booksSearchEndPoint = evalu8config.host
												+ "/books";
										booksSearchEndPoint = booksSearchEndPoint
												+ "?s="
												+ $scope.searchparam
										$http.get(booksSearchEndPoint, config)
												.success(function(response) {
													$scope.books = response;

												});
										this.toggleClearSerch();
									}

							};
							$scope.booksSearch = function() {
								$location.search(this.buildQuery());
								this.toggleClearSerch();
							};

							$scope.buildQuery = function() {

								var q = {};

								this.addQuery(q, "guid", $scope.guid);
								this.addQuery(q, "title", $scope.title);
								this.addQuery(q, "isbn", $scope.isbn);
								this.addQuery(q, "authors", $scope.authors);
								this.addQuery(q, "discipline",
										$scope.discipline);
								this.addQuery(q, "publisher", $scope.publisher);

								return q;

							};

							$scope.addQuery = function(q, key, value) {
								if (value && value != "")
									q[key] = value;
								// return q;
							};

							$scope.toggleClearSerch = function() {

								$scope.clearSearch = !$scope.clearSearch;

								if (!$scope.$$phase && !$scope.$root.$$phase) {
									$scope.$apply()
								}

							};
							$scope.clearSerch = function() {
								$http.get(evalu8config.host + "/books", config)
										.success(function(response) {
											$scope.books = response;
										});
								$scope.searchparam = "";
								$scope.guid = "";
								$scope.title = "";
								$scope.isbn = "";
								$scope.authors = "";
								$scope.discipline = "";
								$scope.publisher = "";
								this.toggleClearSerch();
							};

//							$scope.$on('$routeUpdate', function() {
//								$scope.booksSearch();
//							});
							

						} ]);
