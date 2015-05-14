angular
		.module('e8MyTests')
		.filter(
				'searchFields',
				function() {
					return function(books, searchText) {

						var filteredBooks = [];
						var isAuthorExists = false;
						var authorName = [];
						searchText = searchText.toLowerCase();
						books
								.forEach(function(book) {
									book.authorName = "";
									if (book.authors != null
											&& book.authors.length > 0) {
										book.authors
												.forEach(function(author) {
													if (author != ""
															&& author
																	.indexOf("{") > -1) {
														JSON
																.parse(author)
																.forEach(
																		function(
																				authorDetail) {
																			if (authorDetail.FirstName
																					.toLowerCase()
																					.indexOf(
																							searchText) > -1
																					|| authorDetail.middleName
																							.toLowerCase()
																							.indexOf(
																									searchText) > -1
																					|| authorDetail.lastName
																							.toLowerCase()
																							.indexOf(
																									searchText) > -1) {
																				isAuthorExists = true;

																				authorName
																						.push(authorDetail.FirstName
																								+ " "
																								+ authorDetail.middleName
																								+ " "
																								+ authorDetail.lastName)
																			}
																		});
													} else {
														if (author
																.toLowerCase()
																.indexOf(
																		searchText) > -1) {
															isAuthorExists = true;
															authorName
																	.push(author);
														}
													}

												});
									}

									if (isAuthorExists) {
										book.authorName = authorName;
									}

									if (book.title.toLowerCase().indexOf(
											searchText) > -1
											|| (book.guid != null && book.guid
													.toLowerCase().indexOf(
															searchText) > -1)
											|| (book.isbn13 != null && book.isbn13
													.toLowerCase().indexOf(
															searchText) > -1)
											|| (book.isbn10 != null && book.isbn10
													.toLowerCase().indexOf(
															searchText) > -1)
											|| (book.publisher != null && book.publisher
													.toLowerCase().indexOf(
															searchText) > -1)
											|| (isAuthorExists)) {

										filteredBooks.push(jQuery.extend(true,
												{}, book));

									}
									isAuthorExists = false;
									authorName = [];
								});
						return filteredBooks;
					};
				})
		.directive(
				'resize',
				function($window) {
					return function(scope, element) {
						var divHeight = ($(document).height() - $(
								'.searchPanel').offset().top) + 60;

						$('.disciplineContainer').height(divHeight);

						$('.bookContainer').height(divHeight);

					}
				})
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

							$scope.isDesciplineEmpty = function() {
								if ($scope.disciplines.userSelected.length > 0)
									return false;
								else
									return true;

							}

							$scope.disciplines.all = DisciplineService
									.allDisciplines();

							UserService
									.userDisciplines(function(userDisciplines,
											status) {
										if (status == "404") {
											$scope
													.enableDisableNextButton($scope
															.isDesciplineEmpty());
										} else {
											$scope.disciplines.userSelected = userDisciplines;
										}

									});

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

							$scope.exitDiscipline = function() {
								if ($scope.disciplines.userSelected.length > 0) {
									return true
								} else {
									$scope.enableDisableNextButton(true);
									return false;
								}
							}

							$scope.enterDiscipline = function() {
								$(".searchDiscpline").val("");
								if ($scope.disciplines.userSelected.length > 0) {
									$scope.enableDisableNextButton(false);
									return true
								} else {
									$scope.enableDisableNextButton(true);
									return false;
								}
							}

							/* books related starts */
							$scope.searchedBook = undefined;
							$scope.trackEnterKey = 0;
							$scope.enterBook = function() {

								$(".searchBook").val("");
								$scope.disciplineBooks = [];

								$scope.books = {
									all : [],
									userSelected : [],
									currentlySelected : []
								};

								// Getting User selected books
								UserService
										.userBookIDs(function(userBookIDs,
												status) {
											if (userBookIDs.length == 0) {
												$scope
														.enableDisableNextButton($scope
																.isBookEmpty());
											} else {
												$scope.books.userSelected = userBookIDs;
											}

											$scope.disciplines.userSelected
													.sort()
													.forEach(
															function(discipline) {
																$scope
																		.getBooks(
																				discipline,
																				$scope.books.userSelected);

															});
										});

								return true;
							}

							// To get books for the given discipline.
							$scope.getBooks = function(discipline,
									useSelectedBooks) {

								BookService
										.disciplineBooks(
												discipline,
												function(disciplineBooks) {
													disciplineBooks
															.forEach(function(
																	book) {
																disciplineBooks
																		.forEach(function(
																				filtBook) {
																			if ((book.isbn10 != null
																					&& filtBook.isbn10 != null && book.isbn10 == filtBook.isbn10)
																					&& (book.isbn13 != null
																							&& filtBook.isbn13 != null && book.isbn13 == filtBook.isbn13)
																					&& (book.created != null
																							&& filtBook.created != null && new Date(
																							book.created) > new Date(
																							filtBook.created))) {

																				book.hasEdition = true;
																				filtBook.showEdition = false;
																				filtBook.parentBookID = book.guid;

																				if (useSelectedBooks
																						.indexOf(filtBook.guid) > -1) {
																					filtBook.showEdition = true;
																					book.isCollasped = true;
																				}

																			}

																		});
																if (useSelectedBooks
																		.indexOf(book.guid) > -1) {
																	book.isSelected = true;
																	$scope.books.currentlySelected
																			.push(book.guid)
																}

																$scope.books.all
																		.push(book);
															});

													$scope.disciplineBookMaping = {};
													$scope.disciplineBookMaping["name"] = discipline
													$scope.disciplineBookMaping["books"] = disciplineBooks

													$scope.disciplineBooks
															.push($scope.disciplineBookMaping);

													$scope.disciplineBooks
															.sort(function(a, b) {
																return a.name
																		.localeCompare(b.name)
															});
												});

							}

							$scope.selectBook = function(bookid, disciplineName) {

								$scope.disciplineBooks
										.forEach(function(discipline) {
											if (discipline.name == disciplineName) {
												discipline.books
														.forEach(function(book) {
															if (book.guid == bookid
																	&& book.isSelected == false) {
																book.isSelected = true;
															} else if (book.guid == bookid
																	&& book.isSelected == true) {
																book.isSelected = false;
															}
														});
											}
										});

								$scope.addBookToSelectedList(bookid, false);

							}

							$scope.searchedBookOnEnter = function(event) {
								$(".dropdown-menu")
										.addClass("autocompleteList");

								$scope.searchedBook = $(".searchBook").val();
								if ($scope.searchedBook == undefined
										|| $scope.searchedBook == "") {
									$(".bookContainer")[0].scrollTop = 0;
									return false;

								}
								if (event.keyCode === 13) {
									if ($scope.trackEnterKey > 0) {
										var bookguid = $scope
												.getGUIDByTitle($scope.searchedBook);
										$scope.addBookToSelectedList(bookguid,
												true);

										var parentbookid;
										$scope.disciplineBooks
												.forEach(function(discipline) {
													discipline.books
															.forEach(function(
																	book) {
																if (book.guid == bookguid
																		&& book.isSelected == false) {
																	book.isSelected = true;
																	book.showEdition = true;
																	parentbookid = book.parentBookID
																} else if (book.guid == bookguid
																		&& book.isSelected == true) {
																	book.showEdition = true;
																	parentbookid = book.parentBookID
																}
															});
												});
										$scope.disciplineBooks
												.forEach(function(discipline) {
													discipline.books
															.forEach(function(
																	book) {
																if (book.guid == parentbookid
																		&& book.isCollasped == false) {
																	book.isCollasped = true;
																}
															})
												});
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
								var bookguid = $scope
										.getGUIDByTitle($scope.searchedBook);

								$scope.addBookToSelectedList(bookguid, true);

								var parentbookid;

								$scope.disciplineBooks.forEach(function(
										discipline) {
									discipline.books.forEach(function(book) {
										if (book.guid == bookguid
												&& book.isSelected == false) {
											book.isSelected = true;
											book.showEdition = true;
											parentbookid = book.parentBookID
										} else if (book.guid == bookguid
												&& book.isSelected == true) {
											book.showEdition = true;
											parentbookid = book.parentBookID
										}
									});
								});

								$scope.disciplineBooks.forEach(function(
										discipline) {
									discipline.books.forEach(function(book) {
										if (book.guid == parentbookid
												&& book.isCollasped == false) {
											book.isCollasped = true;
										}
									})
								});

							}

							$scope.addBookToSelectedList = function(book,
									isSearched) {
								var index = $scope.books.currentlySelected
										.indexOf(book);
								if (index > -1) {
									if (!isSearched) {
										$scope.books.currentlySelected.splice(
												index, 1);
									}
									$scope.setBookScrollBar();

								} else {
									if ($scope.validateBook(book)) {
										$scope.books.currentlySelected
												.push(book);
										$scope.setBookScrollBar();
									}

								}
							}

							$scope.setBookScrollBar = function() {
								$scope.enableDisableNextButton($scope
										.isBookEmpty());

								if ($scope.searchedBook != undefined
										&& $scope.searchedBook != "") {
									var vtop = $(".bookContainer").find(
											"div:contains('"
													+ $scope.searchedBook
													+ "')").position().top;
									if (vtop > $(".bookContainer")[0].clientHeight
											|| vtop < 0) {
										$(".bookContainer")[0].scrollTop = vtop;
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

							$scope.enableDisableNextButton = function(state) {
								if (state) {
									$(".nextButton").addClass("btnDisbled");
								} else {
									$(".nextButton").removeClass("btnDisbled");
								}
							}

							$scope.saveBooks = function() {
								UserService
										.saveUserBooks($scope.books.currentlySelected);
							};

							$scope.showOldEdition = function(parentbookid,
									disciplineName) {
								var parentBook = null;
								var oldEditions = [];
								var isAnyOldEditionsSelected = false;

								$scope.disciplineBooks
										.forEach(function(discipline) {
											if (discipline.name == disciplineName) {
												discipline.books
														.forEach(function(book) {
															if (book.parentBookID == parentbookid) {
																oldEditions
																		.push(book);
																if ($scope.books.currentlySelected
																		.indexOf(book.guid) > -1) {
																	isAnyOldEditionsSelected = true;
																}
															}
															if (book.guid == parentbookid) {
																parentBook = book;
															}
														});
											}
										});

								if (!isAnyOldEditionsSelected) {
									oldEditions.forEach(function(book) {
										if (book.showEdition == false) {
											book.showEdition = true;
										} else if (book.showEdition == true) {
											book.showEdition = false;
										}
									});

									if (parentBook.isCollasped == false) {
										parentBook.isCollasped = true;
									} else if (parentBook.isCollasped == true) {
										parentBook.isCollasped = false;
									}

								}

								event.stopPropagation();

							}

							$scope.isBookEmpty = function() {
								if ($scope.books.currentlySelected.length > 0) {
									return false;
								} else {
									return true;
								}
							}

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