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
						'step','source','parentScope','CommonService','SharedTabService',
						function($scope, $rootScope, $location, $routeParams,
								$http, UserService, BookService,
								DisciplineService, UserQuestionsService, WizardHandler,
								$modalInstance, blockUI, step, source,parentScope,CommonService,SharedTabService) {
							
							parentScope.isAddQstBankClicked=false;
							parentScope.isClicked=false;
							$scope.searchedDiscipline = "";
							$scope.disciplines = {
								all : [],
								userSelected : []
							};

							$scope.step = step;

							$scope.setStep = function(step) {

								if (step == '2' && !$scope.isDesciplineEmpty()) {
									$scope.exitDiscipline()
									$scope.step = step;
								} else if (step == '1' && !$scope.isBookLoading) {
									$scope.searchedDiscipline="";
									$scope.step = step;
								}
							}

							$scope.cancel = function() {
								$modalInstance.dismiss('cancel');

							};

							DisciplineService.allDisciplines(function(allDisciplines) {
								$scope.disciplines.all = allDisciplines;
								if(allDisciplines==null){
									CommonService.showErrorMessage(e8msg.error.cantFetchDisciplines)
				        			return;
								}
								UserService.userDisciplines(function(userDisciplines) {
									if(userDisciplines==null){
										CommonService.showErrorMessage(e8msg.error.cantFetchDisciplines)
					        			return;
									}
									$scope.disciplines.userSelected = userDisciplines;
									if ($scope.step == '2') {
										$scope.exitDiscipline();
									}
								});
							});

							

							$scope.isDesciplineEmpty = function() {
								if ($scope.disciplines.userSelected.length > 0)
									return false;
								else
									return true;

							}

							$scope.selectDiscipline = function(event, discipline) {
								$scope.addToselectedDiscipline(event,
										discipline.discipline, false)
							}

							$scope.searchDisciplineOnClick = function() {
								$scope.searchedDiscipline = $(".searchDiscpline").val();
								if ($scope.searchedDiscipline == undefined
										|| $scope.searchedDiscipline == "") {
									return false;

								}
								$scope.addToselectedDiscipline(event,$scope.searchedDiscipline,
										true);
							}

							$scope.searchDiscipline = function(event) {
								$(".dropdown-menu")
								.addClass("autocompleteQuestionList");
								
								 if(event.which === 40){					                	
					                   $('div.modal-content ul.dropdown-menu').scrollTop ( ($('div.modal-content ul.dropdown-menu li.active').index() ) * 25);																	
					                }
					                if(event.which === 38){
					                    $('div.modal-content ul.dropdown-menu').scrollTop ( ($('div.modal-content ul.dropdown-menu li.active').index() ) * 25);
					                    										
					                }
								$scope.searchedDiscipline = $(".searchDiscpline").val();
								if ($scope.searchedDiscipline == undefined
										|| $scope.searchedDiscipline == "") {
									$(".disciplineContainerInLightBox")[0].scrollTop = 0;
									return false;

								}

								if (event.keyCode === 13) {
										$scope.addToselectedDiscipline(event,
												$scope.searchedDiscipline, true);
									}
							}

							$scope.addToselectedDiscipline = function(event,
									disciplineName, isSearched) {
								var index = $scope.disciplines.userSelected
										.indexOf(disciplineName);
								if (index > -1) {
									if (!isSearched) {
										$scope.disciplines.userSelected.splice(
												index, 1);
									}
									if(event.which != 1){
										$scope.setDisciplineScroll(disciplineName);
									}
									
								} else {

									if ($scope
											.validateDiscipline(disciplineName)) {
										$scope.disciplines.userSelected
												.push(disciplineName);
										if(event.which != 1){
											$scope.setDisciplineScroll(disciplineName);
										}
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

								if (scrollTo.offset().top+15>(container.offset().top +container.height())) {
									container.scrollTop(scrollTo.offset().top
										- container.offset().top
										+ container.scrollTop());
								}else if (scrollTo.offset().top-15<(container.height()-container.offset().top )){
									container.scrollTop(
										-container.offset().top
										-container.scrollTop()-scrollTo.offset().top);
								}else{
									container.scrollTop(
										-container.offset().top
										+container.scrollTop()+scrollTo.offset().top);
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
							$scope.exitDiscipline = function() {
								$scope.searchedDiscipline="";
								$scope.disciplineBooks = [];
								$scope.isBookLoading=true;
								$(".btnGotoDispBook").addClass("btnDisbledGotoDispBook");

								$scope.books = {
									all : [],
									userSelected : [],
									currentlySelected : []
								};

								if ($scope.disciplines.userSelected.length > 0) {

									// Getting User selected books
									UserService.userBookIDs(function(userBookIDs) {
											if(userBookIDs==null){
												CommonService.showErrorMessage(e8msg.error.cantFetchBooks)
					                			return;
											}
											$scope.books.userSelected = userBookIDs;
											$scope.selectedDisciplineCounter=0;
											$scope.disciplines.userSelected.forEach(function(discipline) {
														$scope.getBooks(discipline,$scope.books.userSelected);
											});
										});

									return true;
								} else {
									return false;
								}
							}

							var arrangedBooks=[];
							// To get books for the given discipline.
							$scope.getBooks = function(discipline,useSelectedBooks) {
								BookService.disciplineBooks(discipline,function(disciplineBooks) {
									if(disciplineBooks==null){
										CommonService.showErrorMessage(e8msg.error.cantFetchDisciplines)
				            			return;
									}
									disciplineBooks.sort(function(a, b) {
										return new Date(b.created) - new Date(a.created);
									});
									disciplineBooks.forEach(function(book) {
										if (useSelectedBooks.indexOf(book.guid) > -1) {
											book.isSelected = true;
											$scope.books.currentlySelected.push(book.guid)
										}
										$scope.books.all.push(book);
										var i = 0;
										var versionedBook=false;
										var versionedBookPosition=false;
										arrangedBooks.forEach(function(filtBook) {
											if (isEditionBook(filtBook, book)) {
												if(isLatestEditionBook(filtBook, book)){
													filtBook.hasEdition = true;
												}
												book.showEdition = false;
												book.parentBookID = filtBook.guid;
												setParentBookStatus(book);
												versionedBook=true;
												versionedBookPosition=i;
											}
											i=i+1;
										});	
										if(versionedBook){
											arrangedBooks.splice(versionedBookPosition+1, 0, book);
										}else{
											arrangedBooks.push(book);	
										}
									});

									$scope.disciplineBookMaping = {};
									$scope.disciplineBookMaping["name"] = discipline
									$scope.disciplineBookMaping["books"] = arrangedBooks
									arrangedBooks=[];
									$scope.disciplineBooks.push($scope.disciplineBookMaping);
									$scope.disciplineBooks.sort(function(a, b) {
										return a.name.localeCompare(b.name)
									});
									$scope.selectedDisciplineCounter++;
									if($scope.selectedDisciplineCounter==$scope.disciplines.userSelected.length){
										$scope.isBookLoading=false;
										$(".btnGotoDispBook").removeClass("btnDisbledGotoDispBook");
										$scope.buttonEnableDisable($scope.isBookEmpty());
									}
								});
							}
							
							var isEditionBook = function(book1, book2){
								var editionBook=false;
								if(book1.isbn13 == null && book2.isbn13 == null && book1.isbn10 != null && book2.isbn10 != null && book1.isbn10 == book2.isbn10){
									editionBook=true;
								}else if (book1.isbn10 == null && book2.isbn10 == null && book1.isbn13 != null && book2.isbn13 != null && book1.isbn13 == book2.isbn13){
									editionBook=true;
								}else if(book1.isbn10 != null && book2.isbn10 != null && book1.isbn13 != null && book2.isbn13 != null && book1.isbn10 == book2.isbn10 && book1.isbn13 == book2.isbn13){
									editionBook=true;
								}
								return editionBook;
							}
							
							var isLatestEditionBook = function(book1, book2){
								if(book1.created != null && book2.created != null && new Date(book1.created) > new Date(book2.created)){
									return true;
								}else {
									return false;
								}
							}
							var setParentBookStatus = function(book){
								if ($scope.books.userSelected.indexOf(book.guid) > -1) {
									book.showEdition = true;
									var parentBookID=book.parentBookID;
									arrangedBooks.forEach(function(filtBook) {
										if(filtBook.guid==parentBookID){
											filtBook.isCollasped = true;
										}
									});
								}
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
								
								 if(event.which === 40){					                	
					                   $('div.modal-content ul.dropdown-menu').scrollTop ( ($('div.modal-content ul.dropdown-menu li.active').index() ) * 87);																	
					                }
					                if(event.which === 38){
					                    $('div.modal-content ul.dropdown-menu').scrollTop ( ($('div.modal-content ul.dropdown-menu li.active').index() ) * 87);
					                    										
					                }

								$scope.searchedBook = $(".searchBook").val();
								if ($scope.searchedBook == undefined
										|| $scope.searchedBook == "") {
									$(".bookContainerInLightBox")[0].scrollTop = 0;
									return false;

								}
								if (event.keyCode === 13) {
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
										}else{
											container.scrollTop(
													-container.offset().top
													+container.scrollTop()+scrollTo.offset().top);
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

							$scope.showOldEdition = function(event,parentbookid,
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
								if($scope.isBookEmpty()){
									return false;
								}
								UserService.saveUserDisciplines($scope.disciplines.userSelected, function() {
									
									UserService.saveUserBooks($scope.books.currentlySelected, function() {
										
                                        BookService.userBooks(function(response) {
                                        	if(response==null){
                                				CommonService.showErrorMessage(e8msg.error.cantFetchBooks)
                                				return;
                                			}
                                        	$scope.$parent.userBooks = response;
                                        	
                                        	if(source && source == "questionBankTab") {
                                        		$rootScope.$broadcast("SaveSettings");
                                        	}else{
                                        		UserService.saveUserQuestionMetadata($scope.questionMetadata.userSelected, function(success) {
                                       			 if(success) {
                                       				 SharedTabService.userQuestionSettings=$scope.questionMetadata.userSelected;
                                       				 
                                       				 $rootScope.$broadcast("SaveSettings");
                                       				 
                                       				 $modalInstance.close();				 
                                       			 }else{
                                 					CommonService.showErrorMessage(e8msg.error.cantSaveMetadata)
                                    			 }
                                       		 });
                                        		
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