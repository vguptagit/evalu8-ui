angular
		.module('e8MyTests')
		.filter(
				'searchFields',
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
						'UserBookService','$modal','notify','CommonService',
						function($scope, $rootScope, $location, $routeParams,
								$http, UserService, BookService,
								DisciplineService,UserBookService,$modal,notify,CommonService) {

							$scope.searchedDiscpline = "";
							$scope.disciplines = {
								all : [],
								userSelected : []
							};

							$scope.userBook = {	books:[] };
							
							$scope.selectedAllUserBooks = false;
							$scope.enableDisableNextButton = function(state) {
								if (state) {
									$(".btn-primary").addClass("btnDisbled");
									$("div.row.setupHeader btn-primary").addClass(
											"btnDisbled");
								} else {
									$(".nextButton").removeClass("btnDisbled");
									$("div.row.setupHeader input").removeClass(
											"btnDisbled");
								}
							}

							$scope.isDesciplineEmpty = function() {
								if ($scope.disciplines.userSelected.length > 0)
									return false;
								else
									return true;

							}

							$rootScope.blockPage.start();
							
							DisciplineService.allDisciplines(function(allDisciplines) {
								if(allDisciplines==null){
									CommonService.showErrorMessage(e8msg.error.cantFetchDisciplines)
				        			return;
								}
								$scope.disciplines.all = allDisciplines;
								
								UserService.userDisciplines(function(userDisciplines) {
									if(userDisciplines==null){
										CommonService.showErrorMessage(e8msg.error.cantFetchDisciplines)
										return;
									}
									try{
										if (userDisciplines.length == 0) {
											$scope.enableDisableNextButton($scope.isDesciplineEmpty());
										} else {
											$scope.disciplines.userSelected = userDisciplines;
										}
									}catch(e){
										console.log(e);
									}finally{
										$rootScope.blockPage.stop();				
									}
								});
							});

							

							$scope.selectDiscipline = function(discipline) {
								$scope.addToselectedDiscipline(
										discipline.discipline, false)
							}

							$scope.searchDisciplineOnClick = function() {
								$scope.searchedDiscpline = $(".searchDiscpline")
										.val();
								if ($scope.searchedDiscpline == undefined
										|| $scope.searchedDiscpline == "") {
									return false;

								}
								$scope.addToselectedDiscipline(
										$scope.searchedDiscpline, true);
							}

							$scope.searchDiscipline = function(event) {
								$(".dropdown-menu")
								.addClass("startupautocompleteList");
								
								 if(event.which === 40){					                	
					                   $('ul.dropdown-menu').scrollTop (($('ul.dropdown-menu li.active').index()) * 25);																	
					                }
					                if(event.which === 38){
					                    $('ul.dropdown-menu').scrollTop (($('ul.dropdown-menu li.active').index()) * 25);
					                    										
					                }
								$scope.searchedDiscpline = $(".searchDiscpline").val();
								if ($scope.searchedDiscpline == undefined
										|| $scope.searchedDiscpline == "") {
									$(".discplineheight")[0].scrollTop = 0;
									return false;

								}

								if (event.keyCode === 13) {
										$scope.addToselectedDiscipline(
												$scope.searchedDiscpline, true);
									

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
								var container = $('.discplineheight'), scrollTo = $(
										".discplineheight").find(
										"div:contains('" + disciplineName
												+ "')");

								if (scrollTo.offset().top > (container.offset().top + container
										.height())) {
									container.scrollTop(scrollTo.offset().top
											- container.offset().top
											+ container.scrollTop());
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
										.saveUserDisciplines($scope.disciplines.userSelected,function() {
											$scope.saveBooks();
										});
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
							$scope.enterBook = function() {
								$rootScope.blockPage.start();
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
											if(userBookIDs==null){
												CommonService.showErrorMessage(e8msg.error.cantFetchBooks)
					                			return;
											}
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
							
							var arrangedBooks=[];
							// To get books for the given discipline.
							$scope.getBooks = function(discipline,useSelectedBooks) {
								BookService.disciplineBooks(discipline,function(disciplineBooks) {
									if(disciplineBooks==null){
										CommonService.showErrorMessage(e8msg.error.cantFetchDisciplines)
				            			return;
									}
									try{
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
										$scope.enableDisableNextButton($scope.isBookEmpty());
										$scope.disciplineBooks.sort(function(a, b) {
											return a.name.localeCompare(b.name)
										});
									
									}catch(e){
										console.log(e);
									}
									finally{
										$rootScope.blockPage.stop();
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

							$scope.searchedBookOnEnter = function(event) {
								$(".dropdown-menu")
										.addClass("startupautocompleteList");
								
								 if(event.which === 40){					                	
					                   $('ul.dropdown-menu').scrollTop (($('ul.dropdown-menu li.active').index()) * 87);																	
					                }
					                if(event.which === 38){
					                    $('ul.dropdown-menu').scrollTop (($('ul.dropdown-menu li.active').index()) * 87);
					                    										
					                }

								$scope.searchedBook = $(".searchBook").val();
								if ($scope.searchedBook == undefined
										|| $scope.searchedBook == "") {
									$(".bookContainer")[0].scrollTop = 0;
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

									var container = $('.bookContainer'), scrollTo = $(
											".bookContainer").find("div:contains('"+ $scope.searchedBook+ "')");

									if (scrollTo.offset().top+150 > (container
											.offset().top + container.height())) {
										container
												.scrollTop(scrollTo.offset().top
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
										.saveUserBooks($scope.books.currentlySelected, function(){
											//$location.path('/home/questionbanks');
										});
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

							$scope.saveDiscplineAndBook = function() {
								if ($scope.isBookEmpty()) {
									return false;
								} else {
									$scope.saveDiscpline();
									return true;
								}

							}
							
							var confirmObject = {
									templateUrl : 'views/partials/alert.html',
									controller : 'AlertMessageController',
									windowClass: 'alert-Modal',
									backdrop : 'static',
									keyboard : false,
									resolve : {
										parentScope : function() {
											return $scope;
										}
									}
								};

							
							$scope.finishWizard = function() {
								var isUserBookEmpty = false;
								var selectedUserBook = [];

								if ($scope.userBook.books.length == 1) {
									isUserBookEmpty = $scope.userBook.books[0].emptyRecords ||  $scope.userBook.books[0].isImported
								}

								$.grep($scope.userBook.books, function(book) {
									if (book.isSelected && !book.isImported) {			
										delete book.isSelected;
										selectedUserBook.push(book.guid);
									}
								});	

								if (isUserBookEmpty) {
									$location.path('/home/questionbanks');
								} else if (!isUserBookEmpty
										&& selectedUserBook.length == 0) {
									$scope.IsConfirmation = true;
									$scope.message = "Are you sure you don’t want to import any tests now? Select items below to import or choose Next to skip this step"

									$modal.open(confirmObject).result
											.then(function(ok) {
												if (ok) {
													$location
															.path('/home/questionbanks');
												}
												return false;
											});
								} else {
									$scope.importUserBooks(selectedUserBook);
								}
							}							
							
							
							$scope.importUserBooks = function(selectedUserBook) {											
								UserBookService.importUserBooks(selectedUserBook,function(status) {	
									if(status){
										$location.path('/home/yourtests');		
									}else {										
										$scope.showErrorMessage();
									}									
								});		
							}
							
							$scope.showErrorMessage = function(){
								var msg = e8msg.error.importUserBooks;
								var messageTemplate ='<p class="alert-danger"><span class="glyphicon glyphicon-alert"></span><span class="warnMessage">' + msg  + '</p> ';
								$scope.positions = ['center', 'left', 'right'];
								$scope.position = $scope.positions[0];
								notify({
									messageTemplate: messageTemplate,						                
									classes: 'alert alert-danger',	
									position: $scope.position,
									duration: '1500'
								});
							};

						} ]);