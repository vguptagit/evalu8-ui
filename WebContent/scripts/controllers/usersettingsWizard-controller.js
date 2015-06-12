angular
		.module('e8MyTests')
		.filter(
				'searchFields22',
				function() {
					return function(books, searchText) {

						var filteredBooks = [];
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

																			authorName
																					.push(authorDetail.FirstName
																							+ " "
																							+ authorDetail.middleName
																							+ " "
																							+ authorDetail.lastName)

																		});
													} else {

														authorName.push(author);

													}

												});
									}

									book.authorName = authorName.toString();

									if (book.title.toLowerCase().indexOf(
											searchText) > -1
											|| (book.guid != null && book.guid
													.toLowerCase().indexOf(
															searchText) > -1)
											|| (book.isbn != null && book.isbn
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
											|| (book.authorName != null && book.authorName
													.toLowerCase().indexOf(
															searchText) > -1)) {

										filteredBooks.push(jQuery.extend(true,
												{}, book));
									}

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

						$('.disciplineContainerInLightBox').height(divHeight);

						$('.bookContainerInLightBox').height(divHeight);

					}
				})

		.controller(
				'usersettingsWizardController',
				[
						'$scope',
						'$rootScope',
						'$location',
						'$routeParams',
						'$http',
						'UserService',
						'BookService',
						'DisciplineService',
						'UserQuestionsService',
						'WizardHandler',
						'$modalInstance',
						'blockUI',
						'step','source',
						function($scope, $rootScope, $location, $routeParams,
								$http, UserService, BookService,
								DisciplineService, UserQuestionsService, WizardHandler,
								$modalInstance, blockUI, step, source) {

							$scope.searchedDiscipline = "";
							$scope.trackEnterKey = 0;
							$scope.disciplines = {
								all : [],
								userSelected : []
							};

							$scope.step = step;

							$scope.setStep = function(step) {

								if (step == '2' && !$scope.isDesciplineEmpty()) {
									$scope.exitDiscipline()
									$scope.step = step;
								} else if (step == '1') {
									$scope.searchedDiscipline="";
									$scope.step = step;
								}
							}

							$scope.cancel = function() {
								$modalInstance.dismiss('cancel');

							};

							$scope.disciplines.all = DisciplineService
									.allDisciplines();

							UserService
									.userDisciplines(function(userDisciplines) {
										$scope.disciplines.userSelected = userDisciplines;

										if ($scope.step == '2') {
											$scope.exitDiscipline();
										}
									});

							$scope.isDesciplineEmpty = function() {
								if ($scope.disciplines.userSelected.length > 0)
									return false;
								else
									return true;

							}

							$scope.selectDiscipline = function(discipline) {
								$scope.addToselectedDiscipline(
										discipline.discipline, false)
							}

							$scope.searchDisciplineOnClick = function() {
								$scope.searchedDiscipline = $(".searchDiscpline").val();
								if ($scope.searchedDiscipline == undefined
										|| $scope.searchedDiscipline == "") {
									return false;

								}
								$scope.addToselectedDiscipline($scope.searchedDiscipline,
										true);
							}

							$scope.searchDiscipline = function(event) {
								$(".dropdown-menu")
								.addClass("autocompleteQuestionList");
								$scope.searchedDiscipline = $(".searchDiscpline").val();
								if ($scope.searchedDiscipline == undefined
										|| $scope.searchedDiscipline == "") {
									$(".disciplineContainerInLightBox")[0].scrollTop = 0;
									return false;

								}

								if (event.keyCode === 13) {
									if ($scope.trackEnterKey > 0) {
										$scope.addToselectedDiscipline(
												$scope.searchedDiscipline, true);
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

								$scope.buttonEnableDisable($scope
										.isDesciplineEmpty());

								var container = $('.disciplineContainerInLightBox'), scrollTo = $(
										".disciplineContainerInLightBox").find(
										"div:contains('" + disciplineName
												+ "')");

								if (scrollTo.offset().top > (container.offset().top + container.height())) {
									container.scrollTop(scrollTo.offset().top
										- container.offset().top
										+ container.scrollTop());
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

							$scope.exitDiscipline = function() {
								$scope.searchedDiscipline="";
								$scope.disciplineBooks = [];

								$scope.books = {
									all : [],
									userSelected : [],
									currentlySelected : []
								};

								if ($scope.disciplines.userSelected.length > 0) {

									// Getting User selected books
									UserService
											.userBookIDs(function(userBookIDs) {
												$scope.books.userSelected = userBookIDs;

												$scope.disciplines.userSelected
														.forEach(function(
																discipline) {
															$scope
																	.getBooks(
																			discipline,
																			$scope.books.userSelected);
														});
											});

									return true;
								} else {
									return false;
								}
							}

							// To get books for the given discipline.
							$scope.getBooks = function(discipline,
									useSelectedBooks) {

								BookService
										.disciplineBooks(
												discipline,
												function(disciplineBooks) {
													disciplineBooks.sort(function(a, b) {
														return new Date(b.created) - new Date(a.created);
													});
													
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

							$scope.searchBookOnEnter = function(event) {
								$(".dropdown-menu")
										.addClass("autocompleteQuestionList");

								$scope.searchedBook = $(".searchBook").val();
								if ($scope.searchedBook == undefined
										|| $scope.searchedBook == "") {
									$(".bookContainerInLightBox")[0].scrollTop = 0;
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

							$scope.searchBookOnClick = function() {
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

								$scope
										.buttonEnableDisable($scope
												.isBookEmpty());

								if ($scope.searchedBook != undefined
										&& $scope.searchedBook != "") {
									var container = $('.bookContainerInLightBox'), scrollTo = $(
									".bookContainerInLightBox").find("div:contains('"+ $scope.searchedBook+ "')");

									if (scrollTo.offset().top+150 > (container
											.offset().top + container.height())) {
											container.scrollTop(scrollTo.offset().top
												- container.offset().top
												+ container.scrollTop());
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

							$scope.save = function() {
								
								UserService.saveUserDisciplines($scope.disciplines.userSelected, function() {
									
									UserService.saveUserBooks($scope.books.currentlySelected, function() {
										
                                        BookService.userBooks(function(response) {

                                        	$scope.$parent.userBooks = response;
                                        	
                                        	if(source && source == "questionBankTab") {
                                        		$rootScope.$broadcast("SaveSettings");
                                        	}
                                        	
                                        	$modalInstance.close();
                                        });
									});
								});
							}

							$scope.buttonEnableDisable = function(state) {
								if (state) {
									if ($scope.step == '1') {
										$(".btnGotoDispBook").addClass(
												"btnDisbledGotoDispBook");
									} else {
										$(".nextButton").addClass("btnDisbled");
									}

								} else {
									if ($scope.step == '1') {
										$(".btnGotoDispBook").removeClass(
												"btnDisbledGotoDispBook");
									} else {
										$(".nextButton").removeClass(
												"btnDisbled");
									}

								}
							}

						} ]);