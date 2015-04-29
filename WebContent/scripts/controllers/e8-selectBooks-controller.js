'use strict';

angular

		.module('e8SelectBooks', [ "checklist-model" ])

		.controller(
				'SelectBooksController',
				[
						'$scope',
						'$rootScope',
						'$location',
						'$routeParams',
						'$http',
						'DisciplineService',
						'BookService',
						'UserService',
						function($scope, $rootScope, $location, $routeParams,
								$http, DisciplineService, BookService,
								UserService) {

							$scope.searchedBook = undefined;
							$scope.trackEnterKey = 0;
							$scope.userDisciplines = undefined;
							$scope.books = {
								all : [],
								userSelected : []
							};

							$scope.disciplineBookMaping = {};

							// Getting User selected discipline
							UserService.userDisciplines(function(Disciplines) {
								$scope.userDisciplines = Disciplines;

								$scope.userDisciplines.forEach(function(
										discipline) {
									$scope.getBooks(discipline);
								});

							});

							// Getting User selected books
							UserService.userBookIDs(function(userBookIDs) {
								$scope.books.userSelected = userBookIDs;
							});

							// To get books for the given discipline.
							$scope.getBooks = function(discipline) {

								BookService
										.disciplineBooks(
												discipline,
												function(disciplineBooks) {
													disciplineBooks
															.forEach(function(
																	book) {
																$scope.books.all
																		.push(book);
															});

													$scope.disciplineBookMaping[discipline] = disciplineBooks;
												});

							}

							// getting the books for a given discipline from
							// cached array
							$scope.getBooksByDiscipline = function(discipline) {
								return $scope.disciplineBookMaping[discipline];
							}

							$scope.isSelectedBook = function(book) {
								var index = $scope.books.userSelected
										.indexOf(book);
								if (index < 0) {
									return false;
								} else {
									return true;
								}
							}

							$scope.selectBook = function(bookid) {
								$scope.addBookToSelectedList(bookid);
							}

							$scope.searchedBookOnEnter = function(event) {

								if ($scope.searchedBook == undefined
										|| $scope.searchedBook == "") {
									$(".disciplineContainer")[0].scrollTop = 0;
									return false;

								}
								if (event.keyCode === 13) {
									if ($scope.trackEnterKey > 0) {
										$scope
												.addBookToSelectedList($scope
														.getGUIDByTitle($scope.searchedBook));
									} else {
										$scope.trackEnterKey = 1;
									}
								} else {
									$scope.trackEnterKey = 0
								}

							}

							$scope.searchedBookOnClick = function() {
								if ($scope.searchedBook == undefined
										|| $scope.searchedBook == "") {
									return false;

								}
								$scope.addBookToSelectedList($scope
										.getGUIDByTitle($scope.searchedBook));
							}

							$scope.addBookToSelectedList = function(book) {
								var index = $scope.books.userSelected
										.indexOf(book);
								if (index > -1) {
									$scope.books.userSelected.splice(index, 1);
								} else {
									if ($scope.validateBook(book)) {
										$scope.books.userSelected.push(book);

										var vtop = $(".disciplineContainer")
												.find(
														"div:contains('"
																+ $scope.searchedBook
																+ "')")
												.position().top;
										if (vtop > $(".disciplineContainer")[0].clientHeight) {
											$(".disciplineContainer")[0].scrollTop = vtop;
										}
									}

								}
							}

							$scope.validateBook = function(selectedbook) {
								var isBookExists = false;
								$scope.books.all.forEach(function(book) {
									if (book.guid == selectedbook) {
										isBookExists = true;
									}
								});
								if (isBookExists) {
									return true;
								} else {
									return false;
								}
							}

							$scope.getGUIDByTitle = function(selectedbook) {
								var bookGUID = "";
								$scope.books.all.forEach(function(book) {
									if (book.title == selectedbook) {
										bookGUID = book.guid;
									}
								});
								return bookGUID;
							}

							$scope.saveBooks = function() {
								UserService
										.saveUserBooks($scope.books.userSelected);
								$location.path('/questionBanks');
							};

						} ]);