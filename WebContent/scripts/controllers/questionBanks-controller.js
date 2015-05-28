'use strict';

angular
		.module('e8QuestionBanks')

		.controller(
				'QuestionBanksController',
				[
						'$scope',
						'$rootScope',
						'$location',
						'$cookieStore',
						'$http',
						'$sce',
						'DisciplineService',
						'TestService',
						'SharedTabService',
						'UserQuestionsService',
						'EnumService',
						'$modal',
						'blockUI',
						'ContainerService',
						function($scope, $rootScope, $location, $cookieStore,
								$http, $sce, DisciplineService, TestService,
								SharedTabService, UserQuestionsService,
								EnumService, $modal, blockUI,ContainerService) {
							SharedTabService.selectedMenu = SharedTabService.menu.questionBanks;
							$rootScope.globals = $cookieStore.get('globals')
									|| {};
							var config = {
								headers : {
									'x-authorization' : $rootScope.globals.authToken,
									'Accept' : 'application/json;odata=verbose'
								}
							};
							$scope.controller = EnumService.CONTROLLERS.questionBanks;
							$scope.selectedNodes = [];
							$scope.isSearchMode = false;
							$scope.dragStarted = false;

							$scope.$on('dragStarted', function() {
								$scope.dragStarted = true;
							});

							$scope.$on('dragEnd', function(event, destParent,
									source, sourceParent, sourceIndex,
									destIndex) {
								if ($scope.dragStarted) {
									$scope.dragStarted = false;
									
						            if(source.node.nodeType==='test' && destParent.controller === EnumService.CONTROLLERS.testCreationFrame){        
						                source.node.showEditIcon=false;
						                source.node.showArchiveIcon=false;
						                $rootScope.$broadcast("dropTest", source, destIndex);
						                return false;
						            }
						            
									if (!source.node.isNodeSelected) {
										$scope.selectNode(source.node);
									}
								  $scope.editQuestion(source.node,destIndex);
								}
							});

							$scope.$on('beforeDrop', function(event) {
								$rootScope.$broadcast("beforeDropQuestion");
							});

							$scope.isTestWizard = false;
							// Broadcast from SharedTabService.onClickTab()
							$scope
									.$on(
											'handleBroadcastCurrentTabIndex',
											function() {
												$scope.currentIndex = SharedTabService.currentTabIndex;
												$scope.isTestWizard = SharedTabService.tests[SharedTabService.currentTabIndex].isTestWizard;
											});

							$scope.userQuestions = [];

							// Fetch user disciplines and populate the drop down
							DisciplineService
									.userDisciplines(function(userDisciplines) {

										$scope.disciplines = userDisciplines;
										
										$scope.disciplines.forEach(function(discipline) {
											discipline["isCollapsed"]=true;
										});

										$scope.disciplines.sort(function(a, b) {
											return a.item.localeCompare(b.item)
										});

										UserQuestionsService
												.userQuestions(function(
														userQuestions) {
													if (userQuestions.length) {
														$scope.userQuestions = userQuestions;
														$scope.disciplines
																.unshift({
																	"item" : "Your Questions (user created)"
																});
													}
												})

										DisciplineService
												.disciplineDropdownOptions(
														userDisciplines,
														"Question Banks",
														function(
																disciplinesOptions,
																selectedValue) {

															$scope.disciplinesOptions = disciplinesOptions;
															$scope.selectedValue = selectedValue;
														});
									});

							$scope.disciplineFilterChange = function(option) {

								$scope.disciplines = DisciplineService
										.disciplineDropdownChange(option);

								if ($scope.userQuestions.length) {
									$scope.disciplines
											.unshift({
												"item" : "Your Questions (user created)"
											});
								}
							}

							$scope.testTitle = "New Test";
							// Function is to save the Test details with the
							// questions.

							// To get books for the given discipline.
							// This method will call the api
							// mytest/books?discipline to get the books
							// and append the collection to input discipline
							// angularjs node
							$scope.getBooks = function(discipline) {
								var blockLeftpanel = blockUI.instances
										.get('Leftpanel');

								if ($rootScope.globals.authToken == '') {
									$location.path('/login');
								} else {

									if (!discipline.collapsed) {
										discipline.collapse();
									} else {
										blockLeftpanel.start();
										discipline.expand();
										
										if($scope.isSearchMode){
											blockLeftpanel.stop();
											return;
										}
										var ep;

										if (discipline.node.item == 'Your Questions (user created)') {

											discipline.node.nodes = [];

											// qti player initialisation
											QTI.initialize();

											var yourQuestions = [];
											$scope.userQuestions
													.forEach(function(
															userQuestion) {
														var yourQuestion = {};
														var displayNode = $("<div></div>");
														QTI.BLOCKQUOTE.id = 0;
														QTI
																.play(
																		userQuestion.qtixml,
																		displayNode,
																		false,
																		false,
																		userQuestion.metadata.quizType);
														yourQuestion.isQuestion = true;
														yourQuestion.questionXML = true;

														yourQuestion.nodeType = "question";
														yourQuestion.guid = userQuestion.guid;
														yourQuestion.showEditQuestionIcon = false;
														yourQuestion.isNodeSelected = false;

														addToQuestionsArray(yourQuestion);

														yourQuestion.data = userQuestion.qtixml;
														yourQuestion.quizType = userQuestion.metadata.quizType;
														yourQuestion.extendedMetadata = userQuestion.metadata.extendedMetadata;
														yourQuestion.textHTML = displayNode
																.html();

														yourQuestion.template = 'qb_questions_renderer.html';

														yourQuestions
																.push(yourQuestion);
													})

											discipline.node.nodes = yourQuestions;
											blockLeftpanel.stop();
										} else {
											ep = evalu8config.apiUrl
													+ "/books?discipline="
													+ discipline.node.item
													+ "&userBooks=true";

											$http
													.get(ep, config)
													.success(
															function(response) {
																response.forEach(function(book) {
																	book["isCollapsed"]=true;
																});
																
																discipline.node.nodes = response;

															});
										}
										blockLeftpanel.stop();
									}
								}
							}

							// To get the Chapters for the given book
							// This method will call the api
							// mytest/books/{bookid}/nodes.
							// Output collection will be append to input book
							// angularjs node.
							$scope.getNodes = function(book) {
								// $scope.selectedNodes=[];
								$scope.bookID = book.node.guid;
								if ($rootScope.globals.authToken == '') {
									$location.path('/login');
								} else {
									if (!book.collapsed) {
										book.collapse();
									} else {
										book.expand();
										
										if($scope.isSearchMode && $scope.searchedContainerId!=book.node.guid){
											return;
										}
										
                                        ContainerService.bookNodes(book.node.guid, function(bookNodes) {
                                            book.node.nodes = bookNodes;
                                            angular.forEach(
                                                book.node.nodes,
                                                function(item) {
                                                    item.showTestWizardIcon = false;
                                                    item.showEditQuestionIcon = false;
                                                    item.isNodeSelected = false;
                                                    if ($scope.selectedNodes.length > 0)
                                                        for (var i = 0; i < $scope.selectedNodes.length; i++) {
                                                            if ($scope.selectedNodes[i].guid == item.guid) {
                                                                item.showTestWizardIcon = $scope.selectedNodes[i].showTestWizardIcon;
                                                                item.showEditQuestionIcon = $scope.selectedNodes[i].showEditQuestionIcon;
                                                                item.isNodeSelected = $scope.selectedNodes[i].isNodeSelected;
                                                                $scope.selectedNodes[i] = item;
                                                            }
                                                        }
                                                    item.nodeType = "chapter";
                                                    item.isCollapsed=true;
                                                })
                                                if(book.node.testBindings && book.node.testBindings.length) {
                                                    var publisherTestsNode = {};
                                                    publisherTestsNode.title = "Publisher Tests for this Book"
                                                    publisherTestsNode.nodeType = "publisherTests"
                                                    book.node.nodes.push(publisherTestsNode);    
                                                    
                                                    publisherTestsNode.nodes = [];
                                                    
                                                    book.node.testBindings.forEach(function (testId) {
                                                        TestService.getTest(testId, function(test){

                                                            test.nodeType = "test";
                                                            test.testType = "PublisherTest";
                                                            test.showEditIcon=true;
                                                            test.selectTestNode = false;//to show the edit icon
                                                            test.disableEdit = false;//to disable the edit icon

                                                            publisherTestsNode.nodes.push(test);                                                            
                                                        });
                                                    })
                                                }                                                
                                        });
									}
								}
							}
							
							$scope.selectTestNode = function ($event,test) {
                                
                                if (!test.node.disableEdit) {
                                    test.node.selectTestNode = !test.node.selectTestNode;
                                    if(test.node.selectTestNode && $rootScope.globals.loginCount<=2 && test.node.nodeType!='archiveTest'){
                                        $('.testMessagetip').show()
                                        setTimeout(function(){ 
                                            $('.testMessagetip').hide();
                                        }, 5000);
                                    }
                                }
                                SharedTabService.showSelectedTestTab(test.node.guid);
                            }
							
                            //to disable the edit icon once it clicked  
                            $scope.editTest = function (selectedTest) {
                                selectedTest.node.showEditIcon=false;
                                selectedTest.node.showArchiveIcon=false;
                                $rootScope.$broadcast("editTest", selectedTest);
                            }
							
							// TODO : need to move this to service.
							$scope.createTestWizardCriteria = function(
									currentNode) {
								if (!SharedTabService.isTestWizardTabPresent) {
									$rootScope
											.$broadcast('handleBroadcast_AddTestWizard');
								}
								if (!SharedTabService.tests[SharedTabService.currentTabIndex].isTestWizard) {
									return false;
								}
								if ($rootScope.globals.authToken == '') {
									$location.path('/login');
									return false;
								}
								if (!currentNode.node.isNodeSelected) {
									$scope.selectedNodes.push(currentNode.node);
									currentNode.node.isNodeSelected = !currentNode.node.isNodeSelected;
								}
								if (SharedTabService.isErrorExist(
										currentNode.node, $scope.selectedNodes)) {
									SharedTabService
											.TestWizardErrorPopup_Open();
									return false;
								}
								var selectedNodesLength = $scope.selectedNodes.length;
								var nodeCounter = 0;
								for (var i = 0; i < $scope.selectedNodes.length; i++) {
									currentNode = $scope.selectedNodes[i];
									if (currentNode.showTestWizardIcon) {
										currentNode.showTestWizardIcon = false;
										getQuestions(
												currentNode,
												function(response, currentNode) {
													$rootScope
															.$broadcast(
																	"handleBroadcast_createTestWizardCriteria",
																	response,
																	currentNode);
													nodeCounter++;
													if (nodeCounter == selectedNodesLength)
														if (SharedTabService.errorMessages.length > 0)
															SharedTabService
																	.TestWizardErrorPopup_Open();
												});
									}
								}
							}
							function getQuestions(currentNode, callBack) {
								$http
										.get(
												evalu8config.apiUrl + "/books/"
														+ currentNode.bookid
														+ "/nodes/"
														+ currentNode.guid
														+ "/questions?flat=1",
												config)
										.success(function(response) {
											callBack(response, currentNode)
										})
										.error(
												function() {
													SharedTabService
															.addErrorMessage(
																	currentNode.title,
																	SharedTabService.errorMessageEnum.NoQuestionsAvailable);
													callBack()
													currentNode.showTestWizardIcon = true;
													// currentNode.isNodeSelected
													// = false;
													$scope
															.selectNode(currentNode);
												})
							}

							// To get the topics, subtopics, question for the
							// given chapter.
							// This method will call the api
							// mytest/books/{bookid}/nodes/{nodeid}/nodes
							// and
							// mytest/books/{bookid}/nodes/{nodeid}/questions.
							// Output topic,subtopic and question collection
							// will be append to input chapter angularjs node
							$scope.getNodesWithQuestion = function(currentNode) {
								var blockLeftpanel = blockUI.instances
										.get('BlockLeftpanel');
								if ($rootScope.globals.authToken == '') {
									$location.path('/login');
								} else {
									if (!currentNode.collapsed) {
										currentNode.collapse();
										$(currentNode.$element).find(
												".captiondiv").removeClass(
												'iconsChapterVisible');
										currentNode.$element.children(1)
												.removeClass('expandChapter');
									} else {
										blockLeftpanel.start();
										currentNode.expand();
										
                                        if(currentNode.node.nodeType == 'publisherTests') {
                                            
                                            angular.forEach(currentNode.node.nodes,
                                                    function(item) {
                                                        item.template = 'tests_renderer.html';
                                                    });
                                            blockLeftpanel.stop();
                                            return;
                                        }
							                                        
										if($scope.isSearchMode && $scope.searchedContainerId!=currentNode.node.guid){
											blockLeftpanel.stop();
											return;
										}
										
										currentNode.node.nodes = [];
										$http
												.get(
														evalu8config.apiUrl
																+ "/books/"
																+ $scope.bookID
																+ "/nodes/"
																+ currentNode.node.guid
																+ "/nodes",
														config)
												.success(
														function(response) {

															currentNode.node.nodes = currentNode.node.nodes
																	.concat(response);

															angular
																	.forEach(
																			currentNode.node.nodes,
																			function(
																					item) {
																				item.template = 'nodes_renderer.html';
																				item.showTestWizardIcon = true;
																				item.showEditQuestionIcon = true;
																				item.isNodeSelected = false;
																				if ($scope.selectedNodes.length > 0)
																					for (var i = 0; i < $scope.selectedNodes.length; i++) {
																						if ($scope.selectedNodes[i].guid == item.guid) {
																							item.showTestWizardIcon = $scope.selectedNodes[i].showTestWizardIcon;
																							item.showEditQuestionIcon = $scope.selectedNodes[i].showEditQuestionIcon;
																							item.isNodeSelected = $scope.selectedNodes[i].isNodeSelected;
																							$scope.selectedNodes[i] = item;
																						}
																					}
																				item.nodeType = "topic";
																				item.isCollapsed=true;
																			})
															blockLeftpanel
																	.stop();
														})

										$http
												.get(
														evalu8config.apiUrl
																+ "/books/"
																+ $scope.bookID
																+ "/nodes/"
																+ currentNode.node.guid
																+ "/questions",
														config)
												.success(
														function(response) {

															var responseQuestions = response;
															$(
																	currentNode.$element)
																	.find(
																			".captiondiv")
																	.addClass(
																			'iconsChapterVisible');
															currentNode.$element
																	.children(0)
																	.addClass(
																			'expandChapter');

															var sortedNodes = sortNodes(
																	response,
																	currentNode);

															currentNode.node.nodes = currentNode.node.nodes
																	.concat(sortedNodes);

															angular
																	.forEach(
																			responseQuestions,
																			function(
																					item) {
																				item.nodeType = "question";
																				item.showEditQuestionIcon = false;
																				item.isNodeSelected = false;
																				addToQuestionsArray(item);
																				$scope
																						.renderQuestion(item);
																			})
															blockLeftpanel
																	.stop();

														}).error(function() {
													blockLeftpanel.stop();
												});
										;
									}
								}
							}

							$scope.getQuestions = function(currentNode) {
								// var blockLeftpanel =
								// blockUI.instances.get('BlockLeftpanel');
								if ($rootScope.globals.authToken == '') {
									$location.path('/login');
								} else {
									if (!currentNode.collapsed) {
										currentNode.collapse();
									} else {
										// blockLeftpanel.start();
										currentNode.expand();
										currentNode.node.nodes = [];

										$http
												.get(
														evalu8config.apiUrl
																+ "/books/"
																+ $scope.bookID
																+ "/nodes/"
																+ currentNode.node.guid
																+ "/questions",
														config)
												.success(
														function(response) {

															var responseQuestions = response;

															var sortedNodes = sortNodes(
																	response,
																	currentNode);

															currentNode.node.nodes = currentNode.node.nodes
																	.concat(sortedNodes);

															angular
																	.forEach(
																			responseQuestions,
																			function(
																					item) {
																				item.nodeType = "question";
																				$scope
																						.renderQuestion(item);
																			})
															// blockLeftpanel.stop();

														}).error(function() {
													// blockLeftpanel.stop();
												});
										;
									}
								}
							}

							// This method will be called from callback function
							// of question api.
							// This will call api
							// mytest/books/{bookid}/nodes/{nodeid}/questions/{guid}.
							// Out put of this api will be rendered as html and
							// append to chapter angularjs node.
							$scope.renderQuestion = function(item) {

								// qti player initialisation
								QTI.initialize();

								$http
										.get(
												evalu8config.apiUrl
														+ "/questions/"
														+ item.guid, config)
										.success(
												function(response) {
													item.data = response;
													QTI.BLOCKQUOTE.id = 0;
													var displayNode = $("<div></div>")
													QTI.play(response,
															displayNode, false,
															false);

													item.textHTML = displayNode
															.html();
													item.template = 'qb_questions_renderer.html';

												})

							};

							// Converts object to query string
							$scope.o2qs = function(o) {
								var qs = [];
								for ( var x in o) {
									qs.push(x + '=' + o[x]);
								}
								return qs.join('&');
							};

							// Rendering the question as html
							$scope.getHTML = function(datanode) {
								if (datanode.node.length) {
									return $sce
											.trustAsHtml(datanode.node[0].innerHTML);
								} else if (datanode.node) {
									return $sce
											.trustAsHtml(datanode.node.textHTML);
								}
							}

							// Sorting questions based on the questionbindings
							// property of the container
							var sortNodes = function(response, currentNode) {
								var sequenceBindings = currentNode.node.questionBindings;
								var sortedNodes = new Array(
										sequenceBindings.length);
								for (var i = 0; i < sequenceBindings.length; i++) {
									sortedNodes[i] = $.grep(response, function(
											item) {
										return item.guid == sequenceBindings[i]
									})[0]
								}
								return sortedNodes;
							}

							// Message tip
							$scope.closeTip = function() {
								$('.questionMessagetip').hide();
							}
							$('.questionMessagetip').offset(
									{
										'top' : ($(window).height() / 2)
												- $('.questionMessagetip')
														.height()
									});
							$('.questionMessagetip').hide();
							$scope.selectNode = function (node) {
							    var test = SharedTabService.tests[SharedTabService.currentTabIndex];
								if (node.isNodeSelected == false
										&& $rootScope.globals.loginCount <= 12 && node.nodeType!="question") {
									$('.questionMessagetip').show()
									setTimeout(function() {
										$('.questionMessagetip').hide();
									}, 5000);
								}
								if (!node.isNodeSelected) {
									$scope.selectedNodes.push(node);
									node.isNodeSelected = true;
									node.showEditQuestionIcon = true;
									node.showTestWizardIcon = true;
								} else {
									for (var i = 0; i < $scope.selectedNodes.length; i++) {
										if ($scope.selectedNodes[i].guid == node.guid
												&& (node.showTestWizardIcon && node.showEditQuestionIcon)) {
											$scope.selectedNodes.splice(i, 1);
											node.isNodeSelected = false;
											node.showEditQuestionIcon = false;
											node.showTestWizardIcon = false; 
											break;
										}
									}
								    //hide EditQuestionIcon on selecting the folder, if folder is already edited for that test.
									for (var j = 0; j < test.questionFolderNode.length; j++) {
									    if (node.guid === test.questionFolderNode[j].guid) {
									        node.showEditQuestionIcon = false;
									    }
									}
								}
							};

							$scope.$on('handleBroadcast_deselectedNode',
									function(handler, node) {
										$scope.selectNode(node);
									});
							$scope.editQuestion = function(scope,destIndex) {
								var test = SharedTabService.tests[SharedTabService.currentTabIndex];
					        	test.questionFolderNode = $scope.selectedNodes;
								if (SharedTabService.tests[SharedTabService.currentTabIndex].isTestWizard) {
									$rootScope
											.$broadcast('handleBroadcast_AddNewTab');
								}
								for (var i = 0; i < $scope.selectedNodes.length; i++) {
									if ($scope.selectedNodes[i].showEditQuestionIcon) {
										$scope.selectedNodes[i].showEditQuestionIcon = false;
										if ($scope.selectedNodes[i].nodeType === EnumService.NODE_TYPE.question) {
											$rootScope.$broadcast(
													"dropQuestion",
													$scope.selectedNodes[i], destIndex);
										} else if ($scope.selectedNodes[i].nodeType === EnumService.NODE_TYPE.chapter
												|| $scope.selectedNodes[i].nodeType === EnumService.NODE_TYPE.topic) {
											var questionFolder = $scope.selectedNodes[i];
											getQuestions(
													questionFolder,
													function(response,
															questionFolder) {
														$rootScope
																.$broadcast(
																		"handleBroadcast_AddQuestionsToTest",
																		response,
																		questionFolder);
													});
										}

									}
								}
							}
							$scope.questions = [];
							var addToQuestionsArray = function(item) {
								$scope.questions.push(item);
							};
							$scope
									.$on(
											'handleBroadcast_onClickTab',
											function(handler, tab) {
												for (var i = 0; i < $scope.questions.length; i++) {
													$scope.questions[i].isNodeSelected = false;
													$scope.questions[i].showEditQuestionIcon = false;
													for (var j = 0; j < tab.questions.length; j++) {
														if ($scope.questions[i].guid === tab.questions[j].guid) {
															$scope.questions[i].isNodeSelected = true;
															break;
														}
													}
												}
												for (var i = 0; i < $scope.selectedNodes.length; i++) {
												    //$scope.selectedNodes[i].showEditQuestionIcon = true;
												    for (var j = 0; j < tab.questionFolderNode.length; j++) {
												        if ($scope.selectedNodes[i].guid === tab.questionFolderNode[j].guid) {
												            $scope.selectedNodes[i].showEditQuestionIcon = false;
												        }
												    }
												}
											});
							$scope
									.$on(
											'handleBroadcast_closeTab',
											function(handler, tab) {
												for (var i = 0; i < $scope.questions.length; i++) {
													$scope.questions[i].isNodeSelected = false;
												}
											});
							// evalu8-ui : to set Active Resources Tab , handled
							// in ResourcesTabsController
							$rootScope.$broadcast(
									'handleBroadcast_setActiveResourcesTab',
									EnumService.RESOURCES_TABS.questionbanks);

							// TODO : set container height, need revesit
							$('.question_bank_scrollbar').height(
									($(document).height() - $(
											'.question_bank_scrollbar')
											.offset().top) - 40);

							$scope.openUserSettings = function(step) {
								$modal
										.open({
											templateUrl : 'views/usersettings/usersettingsWizard.html',
											controller : 'usersettingsWizardController',
											size : 'md',
											backdrop : 'static',
											keyboard : false,
											scope : $scope,
											resolve : {
												step : function() {
													return step;
												}
											}
										})
							}

							$scope.addQuestionsToTest = function(questionFolder) {
								if (SharedTabService.tests[SharedTabService.currentTabIndex].isTestWizard) {
									$rootScope
											.$broadcast('handleBroadcast_AddNewTab');
								}
								getQuestions(
										questionFolder.node,
										function(response, questionFolder) {
											$rootScope
													.$broadcast(
															"handleBroadcast_AddQuestionsToTest",
															response,
															questionFolder);
										});
							}

							$scope.selectedBooks = [];
							$scope.selectedBookIDs = [];
							$scope.searchedContainerId="";
							$scope.trackEnterKey=0;
							$scope.searchedText="";
							
							$scope.selectBook = function(node) {
								$scope.allContainers = [];
								var isBookSelected=false;
								var index = $scope.selectedBookIDs
										.indexOf(node.guid);
								if (index > -1) {
									$scope.selectedBookIDs.splice(index, 1);
									$scope.selectedBooks.splice(index, 1);
									isBookSelected=false;
								} else {
									$scope.selectedBookIDs.push(node.guid)
									$scope.selectedBooks.push(node)
									isBookSelected=true;
								}

								ContainerService.getAllContainers(
										$scope.selectedBookIDs.toString(),
										function(response) {
											$scope.allContainers = response;
											node.isNodeSelected = isBookSelected;
										});
							}

							$scope.validateSearch = function(){
								if($scope.selectedBookIDs.length == 0){
									$scope.searchedText="";
									$scope.IsConfirmation = false;
									$scope.message = "Please select a question bank to search";
									$modal.open(confirmObject);
									return;
								}
							}
							
							$scope.showContainerOnClick = function(){
								if($scope.searchedText==""){
									return;
								}
								$scope.showContainer();
							}
							
							$scope.showContainerOnEnter = function(event) {
								if($scope.searchedText==""){
									return;
								}
								
								$(".dropdown-menu")
								.addClass("autocompleteList");
								if (event.keyCode === 13) {
									if ($scope.trackEnterKey > 0) {
										$scope.showContainer();
									}
									else{
										$scope.trackEnterKey = 1;
									}
								}else {
									$scope.trackEnterKey = 0
								}
							}
							
							$scope.showContainer = function(){
								var searchedContainer = "";
								var parentContainerid = "";
								var hasParent = false;
								var searchedDiscipline = {};
								

								$scope.allContainers
										.forEach(function(container) {
											if (container.title == $scope.searchedText) {
												searchedContainer = container;
												$scope.searchedContainerId=container.guid;
												if (container.parentId != null
														&& container.parentId != "") {
													parentContainerid = container.parentId;
													hasParent = true;
												}

												$scope.selectedBooks
														.forEach(function(
																book) {
															if (container.bookid == book.guid) {
																searchedDiscipline["item"] = book.discipline;
																searchedDiscipline["isCollapsed"]=false;
																book["isCollapsed"]=false;
																searchedDiscipline["nodes"] = [ jQuery.extend(true,
																		{}, book) ];
																$scope.bookID=book.guid;
															}
														})
											}
										});

								if($scope.searchedContainerId == ""){
									return;
								}else{
									$scope.disciplines = [];
									$scope.isSearchMode = true;
								}
								
								$scope.disciplines.push(searchedDiscipline);

								if (hasParent) {
									var parentContainers = $scope
											.getParentContainers(parentContainerid)
									parentContainers.reverse();
									var containerNode = $scope.disciplines[0].nodes[0];
									parentContainers
											.forEach(function(container) {
												container.template = "nodes_renderer.html";
												container.showEditQuestionIcon=true;
												container.showTestWizardIcon=true;
												container.nodeType = "chapter";
												container.isCollapsed=false;
												containerNode["nodes"] = [jQuery.extend(true,
														{}, container)];
												containerNode = containerNode.nodes[0];
											})
									searchedContainer.template = "nodes_renderer.html";
									searchedContainer.showEditQuestionIcon=true;
									searchedContainer.showTestWizardIcon=true;
									searchedContainer.nodeType = "topic";
									searchedContainer.isCollapsed=true;
									containerNode["nodes"] = [ jQuery.extend(true,
											{}, searchedContainer) ];

								} else {
									searchedContainer.showEditQuestionIcon=true;
									searchedContainer.showTestWizardIcon=true;
									searchedContainer.nodeType = "topic";
									searchedContainer.isCollapsed=true;
									$scope.disciplines[0].nodes[0]["nodes"] = [jQuery.extend(true,
											{}, searchedContainer)];
								}
							}

							$scope.getParentContainers = function(containerid) {
								var parentContainers = [];
								var parentContainerid = "";
								var hasParent = false;

								$scope.allContainers
										.forEach(function(container) {
											if (container.guid == containerid) {
												parentContainers
														.push(container)
												if (container.parentId != null
														&& container.parentId != "") {
													parentContainer = container.parentId;
													hasParent = true;
												}
											}
										});

								if (hasParent) {
									$scope
											.getParentContainers(parentContainerid)
								}

								return parentContainers;
							}
							
							var confirmObject = {
									templateUrl : 'views/partials/alert.html',
									controller : 'AlertMessageController',
									backdrop : 'static',
									keyboard : false,
									resolve : {
										parentScope : function() {
											return $scope;
										}
									}
								};
							

						} ]);