angular
		.module('e8MyTests')
		.controller(
				'startupWizardController',
				[
						'$scope',
						'$rootScope',
						'$location',
						'$routeParams',
						'$http',
						'UserService',
						'BookService',
						'DisciplineService',
						function($scope, $rootScope, $location, $routeParams,
								$http, UserService, BookService,
								DisciplineService) {

							$scope.searched = "";
							$scope.trackEnterKey = 0;
							$scope.disciplines = {
								all : [],
								userSelected : []
							};

							$scope.enableDisableNextButton = function(state) {
								if (state) {
									$(".nextButton").addClass("btnDisbled");
								} else {
									$(".nextButton").removeClass("btnDisbled");
								}
							}

							$scope.disciplines.all = DisciplineService
									.allDisciplines();

							UserService
									.userDisciplines(function(userDisciplines) {
										$scope.disciplines.userSelected = userDisciplines;
									});

							$scope.isDesciplineEmpty = function() {
								if ($scope.disciplines.userSelected.length > 0)
									return false;
								else
									return true;

							}

							/*
							 * $scope.enableDisableNextButton($scope
							 * .isDesciplineEmpty());
							 */

							$scope.selectDiscipline = function(discipline) {
								$scope.addToselectedDiscipline(
										discipline.discipline, false)
							}

							$scope.searchedDisciplineOnClick = function() {
								$scope.searched = $(".searchDiscpline").val();
								if ($scope.searched == undefined
										|| $scope.searched == "") {
									return false;

								}
								$scope.addToselectedDiscipline($scope.searched,
										true);
							}

							$scope.searchedDiscipline = function(event) {
								$scope.searched = $(".searchDiscpline").val();
								if ($scope.searched == undefined
										|| $scope.searched == "") {
									$(".disciplineContainer")[0].scrollTop = 0;
									return false;

								}

								if (event.keyCode === 13) {
									if ($scope.trackEnterKey > 0) {
										$scope.addToselectedDiscipline(
												$scope.searched, true);
									} else {
										$scope.trackEnterKey = 1
									}

								} else {
									$scope.trackEnterKey = 0
								}
							}

							$scope.addToselectedDiscipline = function(
									disciplineName, isSearched) {
								var index = $scope.disciplines.userSelected
										.indexOf(disciplineName);
								if (index > -1) {
									if (!isSearched) {
										$scope.disciplines.userSelected.splice(
												index, 1);
									}
									$scope.setDisciplineScroll(disciplineName);
								} else {

									if ($scope
											.validateDiscipline(disciplineName)) {
										$scope.disciplines.userSelected
												.push(disciplineName);
										$scope
												.setDisciplineScroll(disciplineName);
									}

								}
							}

							$scope.setDisciplineScroll = function(
									disciplineName) {

								$scope.enableDisableNextButton($scope
										.isDesciplineEmpty());

								var vtop = $(".disciplineContainer").find(
										"div:contains('" + disciplineName
												+ "')").position().top;
								if (vtop > $(".disciplineContainer")[0].clientHeight
										|| vtop < 0) {
									$(".disciplineContainer")[0].scrollTop = vtop;
								}
							}

							$scope.isSelectedDiscipline = function(discipline) {
								var index = $scope.disciplines.userSelected
										.indexOf(discipline.discipline);
								if (index < 0) {
									return false;
								} else {
									return true;
								}
							}

							$scope.validateDiscipline = function(disciplineName) {
								var isDesciplineExists = false;
								$scope.disciplines.all.forEach(function(
										discipline) {
									if (discipline == disciplineName) {
										isDesciplineExists = true;
									}
								});
								return isDesciplineExists;

							}

							$scope.saveDiscpline = function() {
								UserService
										.saveUserDisciplines($scope.disciplines.userSelected);
							};

							/* books related starts */
							$scope.searchedBook = undefined;
							$scope.trackEnterKey = 0;
							$scope.disciplineBookMaping = {};

							$scope.exitDiscipline = function() {

								$scope.books = {
									all : [],
									userSelected : []
								};

								if ($scope.disciplines.userSelected.length > 0) {

									$scope.disciplines.userSelected
											.forEach(function(discipline) {
												$scope.getBooks(discipline);
											});

									// Getting User selected books
									UserService
											.userBookIDs(function(userBookIDs) {
												$scope.books.userSelected = userBookIDs;
											});

									/*
									 * $scope.enableDisableNextButton($scope
									 * .isBookEmpty());
									 */

									return true;
								} else {
									return false;
								}
							}

							$scope.isBookEmpty = function() {
								if ($scope.books.userSelected.length > 0) {
									return false;
								} else {
									return true;
								}
							}

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
								$scope.addBookToSelectedList(bookid, false);
							}

							$scope.searchedBookOnEnter = function(event) {
								$scope.searchedBook = $(".searchBook").val();
								if ($scope.searchedBook == undefined
										|| $scope.searchedBook == "") {
									$(".bookContainer")[0].scrollTop = 0;
									return false;

								}
								if (event.keyCode === 13) {
									if ($scope.trackEnterKey > 0) {
										$scope
												.addBookToSelectedList(
														$scope
																.getGUIDByTitle($scope.searchedBook),
														true);
									} else {
										$scope.trackEnterKey = 1;
									}
								} else {
									$scope.trackEnterKey = 0
								}

							}

							$scope.searchedBookOnClick = function() {
								$scope.searchedBook = $(".searchBook").val();
								if ($scope.searchedBook == undefined
										|| $scope.searchedBook == "") {
									return false;

								}
								$scope.addBookToSelectedList($scope
										.getGUIDByTitle($scope.searchedBook),
										true);
							}

							$scope.addBookToSelectedList = function(book,
									isSearched) {
								var index = $scope.books.userSelected
										.indexOf(book);
								if (index > -1) {
									if (!isSearched) {
										$scope.books.userSelected.splice(index,
												1);
									}
									$scope.setBookScrollBar();

								} else {
									if ($scope.validateBook(book)) {
										$scope.books.userSelected.push(book);
										$scope.setBookScrollBar();
									}

								}
							}

							$scope.setBookScrollBar = function() {
								$scope.enableDisableNextButton($scope
										.isBookEmpty());
								var vtop = $(".bookContainer").find(
										"div:contains('" + $scope.searchedBook
												+ "')").position().top;
								if (vtop > $(".bookContainer")[0].clientHeight
										|| vtop < 0) {
									$(".bookContainer")[0].scrollTop = vtop;
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

							$scope.enableDisableNextButton = function(state) {
								if (state) {
									$(".nextButton").addClass("btnDisbled");
								} else {
									$(".nextButton").removeClass("btnDisbled");
								}
							}

							$scope.saveBooks = function() {
								UserService
										.saveUserBooks($scope.books.userSelected);
							};

							$scope.finishWizard = function() {
								if ($scope.isBookEmpty()) {
									return false
								} else {
									$scope.saveDiscpline();
									$scope.saveBooks();
									$location.path('/home/questionbanks');
								}

							}

						} ]);