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
						'questionService',
						function($scope, $rootScope, $location, $cookieStore,
								$http, $sce, DisciplineService, TestService,
								SharedTabService, UserQuestionsService,
								EnumService, $modal, blockUI,ContainerService,questionService) {
						    SharedTabService.selectedMenu = SharedTabService.menu.questionBanks;
						    $rootScope.blockPage = blockUI.instances.get('BlockPage');
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
							
							if (SharedTabService.tests[SharedTabService.currentTabIndex].questions.length) {
							    var test = SharedTabService.tests[SharedTabService.currentTabIndex];
							    for (var i = 0; i < test.questions.length; i++) {
							        $scope.selectedNodes.push(test.questions[i]);
							    }
							}
						    //no teb switch, restore selectedNodes items
							for (var i = 0; i < SharedTabService.tests.length; i++) {
							    if (SharedTabService.tests[i].treeNode) {
							        $scope.selectedNodes.push(SharedTabService.tests[i].treeNode);
							    }
							}
							$scope.isSearchMode = false;
							$scope.dragStarted = false;
							$scope.isAdvancedSearchMode = false;
							
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
								 if (SharedTabService.tests[SharedTabService.currentTabIndex].IsAnyQstnEditMode) {                                 
                                     $scope.IsConfirmation = false;
                                     $scope.message = "A question is already in Edit mode, save it before adding or reordering questions.";
                                     $modal.open(confirmObject);
                                     $scope.dragStarted = false;                                     
                                 }
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

							$scope.loadTree = function() {
								DisciplineService.userDisciplines(function(userDisciplines) {

									$rootScope.blockPage.start();
									
									$scope.disciplines = userDisciplines;
									
									$scope.disciplines.forEach(function(discipline) {
										discipline["isCollapsed"]=true;
									});

									$scope.disciplines.sort(function(a, b) {
										return a.item.localeCompare(b.item)
									});

									UserQuestionsService.userQuestions(function(userQuestions) {
										if (userQuestions.length) {
											$scope.userQuestions = userQuestions;
											$scope.disciplines
													.unshift({
														"item" : "Your Questions (user created)",
														"isCollapsed" : true	
													});
										}
										
										$rootScope.blockPage.stop();
									})

								});								
							}
							
							$scope.loadTree();
							
							$scope.$on('SaveSettings', function() {
								$scope.loadTree();
							})

							$scope.disciplineFilterChange = function(option) {

								$scope.disciplines = DisciplineService
										.disciplineDropdownChange(option);

								if ($scope.userQuestions.length) {
									$scope.disciplines
											.unshift({
												"item" : "Your Questions (user created)",
												"isCollapsed" : true
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
								

								if ($rootScope.globals.authToken == '') {
									$location.path('/login');
								} else {

									if (!discipline.collapsed) {
										discipline.collapse();
									} else {
										discipline.expand();
										
										if($scope.isSearchMode){
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
									}
								}
							}

							// To get the Chapters for the given book
							// This method will call the api
							// mytest/books/{bookid}/nodes.
							// Output collection will be append to input book
							// angularjs node.
							$scope.getNodes = function(book) {

								$scope.bookID = book.node.guid;

								if (!book.collapsed) {
									book.collapse();
								} else {
									book.expand();
									
									if($scope.isSearchMode && $scope.searchedContainerId!=book.node.guid){
										return;
									}
									
                                    ContainerService.bookNodes(book.node.guid, $scope.selectedQuestionTypes.toString(),
                                    		function(bookNodes) {
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
                                                publisherTestsNode.nodeType = EnumService.NODE_TYPE.publisherTests;
                                                book.node.nodes.push(publisherTestsNode);    
                                                publisherTestsNode.isCollapsed=true;
                                                
                                                publisherTestsNode.testBindings = book.node.testBindings;                                                    
                                            }                                                
                                    });
								}
								
							}
							
					        $scope.closeTip=function(){
					        	$('.testMessagetip').hide();
					        }
					        $('.testMessagetip').offset({'top':($(window).height()/2)-$('.testMessagetip').height()});
					        $('.testMessagetip').hide();
							
							$scope.selectTestNode = function ($event,test) {                                

                                    test.node.selectTestNode = !test.node.selectTestNode;
                                    if(test.node.selectTestNode && $rootScope.globals.loginCount <= evalu8config.messageTipLoginCount 
                                    		&& test.node.nodeType != EnumService.NODE_TYPE.archiveTest){
                                        $('.testMessagetip').show()
                                        setTimeout(function(){ 
                                            $('.testMessagetip').hide();
                                        }, 5000);
                                    }

                                    SharedTabService.showSelectedTestTab(test.node.guid);
                            }
							
                            //to disable the edit icon once it clicked  
                            $scope.editTest = function (selectedTest) {
                            	selectedTest.node.testType = EnumService.TEST_TYPE.PublisherTest;
                                selectedTest.node.showEditIcon=false;
                                selectedTest.node.showArchiveIcon=false;
                                $rootScope.$broadcast("editTest", selectedTest);
                            }
							
                            $scope.createTestWizardMode=false;
                            
							// TODO : need to move this to service.
							$scope.createTestWizardCriteria = function(
									currentNode) {
								$scope.createTestWizardMode=true;
								
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
									    $rootScope.blockPage.start();
										getQuestions(
												currentNode,
												function (response, currentNode) {
												    try {
												    	
													$rootScope
															.$broadcast(
																	"handleBroadcast_createTestWizardCriteria",
																	response,
																	$scope.selectedQuestionTypes.toString(),
																	currentNode);
													nodeCounter++;
													if (nodeCounter == selectedNodesLength)
														if (SharedTabService.errorMessages.length > 0)
															SharedTabService
																	.TestWizardErrorPopup_Open();
                                                    } catch (e) {
                                                        console.log(e);
                                                    } finally {
                                                    	$scope.createTestWizardMode=false;
                                                        $rootScope.blockPage.stop();
                                                    }
												});
									}
								}
							}
							function getQuestions(currentNode, callBack) {
								var questions=[];
								if($scope.isSearchMode && !$scope.createTestWizardMode && currentNode.guid!= $scope.searchedContainerId ){
									callBack(questions, currentNode)
								}else{
									
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
												//callBack()
												currentNode.showTestWizardIcon = true;
												// currentNode.isNodeSelected
												// = false;
												$scope
														.selectNode(currentNode);
												$rootScope.blockPage.stop();
											})
								}
							}


							$scope.getNodesWithQuestion = function(currentNode) {

								if (!currentNode.collapsed) {
									currentNode.collapse();
									$(currentNode.$element).find(".captiondiv").removeClass('iconsChapterVisible');
									currentNode.$element.children(1).removeClass('expandChapter');
								} else {
									currentNode.expand();
									
                                    if(currentNode.node.nodeType == 'publisherTests') {
                                        
                                    	currentNode.node.nodes = [];
                                    	
                                    	currentNode.node.testBindings.forEach(function (testId) {
                                            TestService.getTest(testId, function(test){

                                                test.nodeType = EnumService.NODE_TYPE.test;
                                                test.testType = "PublisherTest";
                                                test.showEditIcon=true;
                                                test.selectTestNode = false;//to show the edit icon

                                                currentNode.node.nodes.push(test);  
                                                
                                                test.template = 'tests_renderer.html';
                                                updateTreeNode(test);
                                            });
                                        })
                                    	
                                        return;
                                    }
						                                        
									if($scope.isSearchMode && $scope.searchedContainerId!=currentNode.node.guid){
										return;
									}else if ($scope.isAdvancedSearchMode){
										$scope.bookID=currentNode.node.bookid;
									}
									
									currentNode.node.nodes = [];
									ContainerService.containerNodes($scope.bookID, 
										currentNode.node.guid,
										$scope.selectedQuestionTypes.toString(),
										false,
										function(response) {

											currentNode.node.nodes = currentNode.node.nodes.concat(response);

											angular.forEach(currentNode.node.nodes, function(item) {
												item.template = 'nodes_renderer.html';
												item.showTestWizardIcon = false;
												item.showEditQuestionIcon = false;
												item.isNodeSelected = false;
                                                item.nodeType = "topic";
												item.isCollapsed=true;
												updateTreeNode(item);
											})
										})

									$http.get(evalu8config.apiUrl
															+ "/books/"
															+ $scope.bookID
															+ "/nodes/"
															+ currentNode.node.guid
															+ "/questions",
													config)
											.success(
													function(response) {

														var responseQuestions = response;
														$(currentNode.$element).find(".captiondiv").addClass('iconsChapterVisible');
														currentNode.$element.children(0).addClass('expandChapter');

														var sortedNodes = sortNodes(response, currentNode);

														currentNode.node.nodes = currentNode.node.nodes.concat(sortedNodes);

														angular.forEach(responseQuestions, function(item) {
															if($scope.isAdvancedSearchMode == false  || ($scope.isAdvancedSearchMode == true && $scope.selectedQuestionTypes.toString().indexOf(item.quizType)>-1))
															{
																item.nodeType = "question";
																item.showEditQuestionIcon = false;
																item.isNodeSelected = false;
																updateTreeNode(item);
																addToQuestionsArray(item);
																$scope
																		.renderQuestion(item);
															}
														})

													}).error(function() {
											});
										
									}
								
							}

							var updateTreeNode = function (item) {
							    if ($scope.selectedNodes.length > 0)
							        for (var i = 0; i < $scope.selectedNodes.length; i++) {
							            if ($scope.selectedNodes[i].guid == item.guid) {
							                item.showTestWizardIcon = $scope.selectedNodes[i].showTestWizardIcon;
							                item.showEditQuestionIcon = $scope.selectedNodes[i].showEditQuestionIcon;
							                item.showEditIcon = $scope.selectedNodes[i].showEditIcon;
							                item.selectTestNode = $scope.selectedNodes[i].selectTestNode;
							                item.isNodeSelected = $scope.selectedNodes[i].isNodeSelected; 
							                $scope.selectedNodes[i] = item;
							            }
							        }
							}

							$scope.getQuestions = function(currentNode) {
								
								if ($rootScope.globals.authToken == '') {
									$location.path('/login');
								} else {
									if (!currentNode.collapsed) {
										currentNode.collapse();
									} else {
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

														}).error(function() {
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
															false,item.quizType);

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
							$scope.closeQuestionTip = function() {
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
										&& $rootScope.globals.loginCount <= evalu8config.messageTipLoginCount 
										&& node.nodeType != EnumService.NODE_TYPE.question
										&& node.nodeType != EnumService.NODE_TYPE.publisherTests) {
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
							$scope.editQuestion = function (scope, destIndex) {							    
								var test = SharedTabService.tests[SharedTabService.currentTabIndex];
					        	test.questionFolderNode = $scope.selectedNodes;
								if (SharedTabService.tests[SharedTabService.currentTabIndex].isTestWizard) {
									$rootScope
											.$broadcast('handleBroadcast_AddNewTab');
								}
								for (var i = 0; i < $scope.selectedNodes.length; i++) {
									if ($scope.selectedNodes[i].showEditQuestionIcon) {										
										if ($scope.selectedNodes[i].nodeType === EnumService.NODE_TYPE.question) {
                                            if (SharedTabService.tests[SharedTabService.currentTabIndex].IsAnyQstnEditMode) {
                                            	$scope.selectedNodes[i].showEditQuestionIcon = true;
                                                $scope.IsConfirmation = false;
                                                $scope.message = "A question is already in Edit mode, save it before adding or reordering questions.";
                                                $modal.open(confirmObject);
                                                $scope.dragStarted = false;
                                                break;
                                            }else{               
                                                $rootScope.blockPage.start();
                                            	$scope.selectedNodes[i].showEditQuestionIcon = false;
                                                $rootScope.$broadcast("dropQuestion",$scope.selectedNodes[i], destIndex);
                                            }    

										} else if ($scope.selectedNodes[i].nodeType === EnumService.NODE_TYPE.chapter
												|| $scope.selectedNodes[i].nodeType === EnumService.NODE_TYPE.topic) {
										    $rootScope.blockPage.start();
											$scope.selectedNodes[i].showEditQuestionIcon = false;
											var questionFolder = $scope.selectedNodes[i];
											getQuestions(
													questionFolder,
													function(response,
															questionFolder) {
														$rootScope
																.$broadcast(
																		"handleBroadcast_AddQuestionsToTest",
																		response,
																		$scope.selectedQuestionTypes.toString(),
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
												    if ($scope.selectedNodes[i].nodeType != EnumService.NODE_TYPE.question) {
												        $scope.selectedNodes[i].showEditQuestionIcon = true;
												    }
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
							
							$scope.deselectQuestionNode = function (node) {							 
									for (var i = 0; i < $scope.selectedNodes.length; i++) {
										if ($scope.selectedNodes[i].guid == node.guid
												&& (node.showTestWizardIcon && !node.showEditQuestionIcon)) {
												$scope.selectedNodes.splice(i, 1);																			
												$scope.setDeselectedNodeState(node);
												break;
											}									
								}
							};			
							
							$scope.setDeselectedNodeState = function(deselectedNode){
								for (var i = 0; i < $scope.questions.length; i++) {
										if ($scope.questions[i].guid === deselectedNode.guid) {
		                                        $scope.questions[i].isNodeSelected = false;
		                                        $scope.questions[i].showEditQuestionIcon = false;
		                                        $scope.questions[i].showTestWizardIcon = false; 
		                                        break;
	                                    	}
                                }
							}
						
							//Handling the Broadcast event when selected question is removed from the Test creation frame.
							// here need to remove the question node from selected list and need to chnage his state. 
							$scope.$on('handleBroadcast_deselectQuestionNode',
									function(handler, node) {
										$scope.deselectQuestionNode(node);
									});
							
							
							// evalu8-ui : to set Active Resources Tab , handled
							// in ResourcesTabsController
							$rootScope.$broadcast(
									'handleBroadcast_setActiveResourcesTab',
									EnumService.RESOURCES_TABS.questionbanks);

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
												},
												source : function() {
													return "questionBankTab";
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
									$scope.selectedContainer="";
									$scope.IsConfirmation = false;
									$scope.message = "Please select a question bank to search";
									$modal.open(confirmObject);
									return false;
								}else{
									return true;
								}
							}
							
							$scope.showContainerOnClick = function(){
								if($scope.selectedContainer==""){
									return;
								}
								$scope.showContainer();
							}
							
							$scope.showContainerOnEnter = function(event) {
								if($scope.selectedContainer==""){
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
							
							$scope.parentNode;
							$scope.showContainer = function(){
								var searchedContainer = "";
								var parentContainerid = "";
								var hasParent = false;
								var searchedDiscipline = {};
								$scope.allContainers
										.forEach(function(container) {
											if (container.guid == $scope.selectedContainer.guid) {
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
												container.showEditQuestionIcon=false;
												container.showTestWizardIcon=false;
												container.nodeType = "chapter";
												container.isCollapsed=false;
												containerNode["nodes"] = [jQuery.extend(true,
														{}, container)];
												containerNode = containerNode.nodes[0];
											})
									$scope.parentNode = containerNode;		
									$scope.addSearchedContainer(searchedContainer);

								} else {
									$scope.parentNode = $scope.disciplines[0].nodes[0];
									$scope.addSearchedContainer(searchedContainer);
								}
							}


							$scope.addSearchedContainer = function(searchedContainer) {
								if($scope.isAdvancedSearchMode){
									$rootScope.blockPage.start();
									ContainerService.containerNodes($scope.bookID,searchedContainer.guid,$scope.selectedQuestionTypes.toString(), true, function(response){
										if(response.length > 0){
											searchedContainer.template = "nodes_renderer.html";
											searchedContainer.showEditQuestionIcon=false;
											searchedContainer.showTestWizardIcon=false;
											searchedContainer.nodeType = "topic";
											searchedContainer.isCollapsed=true;
											$scope.parentNode["nodes"] = [ jQuery.extend(true,
													{}, searchedContainer) ];
											$rootScope.blockPage.stop();
										}else{
											$rootScope.blockPage.stop();
											$scope.IsConfirmation = false;
											$scope.message = "No search results match your criteria, broaden your criteria, or select more question banks to search";
											$modal.open(confirmObject);
										}
									});
								}
								else{
									searchedContainer.template = "nodes_renderer.html";
									searchedContainer.showEditQuestionIcon=false;
									searchedContainer.showTestWizardIcon=false;
									searchedContainer.nodeType = "topic";
									searchedContainer.isCollapsed=true;
									$scope.parentNode["nodes"] = [ jQuery.extend(true,
											{}, searchedContainer) ];	
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
							
							$scope.showAdvancedSearch = false;
							$scope.selectedQuestionTypes = [];
							$scope.isSaveDisabled=true;
							
							$scope.openAdvancedSearch = function() {
								if($scope.validateSearch()){
									if (!$scope.showAdvancedSearch) {
										$scope.showAdvancedSearch = true;
									} else {
										$scope.showAdvancedSearch = false;
									}	
								}
							}
							
							$scope.closeAdvancedSearch = function() {
								$scope.showAdvancedSearch = false;
								if(!$scope.isAdvancedSearchMode){
									$scope.selectedQuestionTypes=[];
									$scope.selectedQuestionTypesToShow=[];
								}
							}
							
							$scope.isThisQuizTypeSelected = function(questionType){
								var index = $scope.selectedQuestionTypes.indexOf(questionType);
								if (index > -1) {
									return true;
								}else{
									return false;
								}
							}
							
							var selectedQuestionTypesToShow=[];
							
							$scope.toggleQuestiontypeSelection = function(
									questionType) {

								var index = $scope.selectedQuestionTypes
										.indexOf(questionType);
								if (index > -1) {
									$scope.selectedQuestionTypes.splice(index,1);
									selectedQuestionTypesToShow.splice(index,1);
								} else {
									$scope.selectedQuestionTypes.push(questionType);
									$scope.addQuestionTypesToShow(questionType);
								}
								if($scope.selectedQuestionTypes.length == 0){
									$scope.isSaveDisabled=true;
								}else{
									$scope.isSaveDisabled=false;
								}
							}
							
							$scope.addQuestionTypesToShow = function(quizTypes)
							{
								if(quizTypes=='Essay'){
									selectedQuestionTypesToShow.push(" Essay") 
								}else if(quizTypes=='MultipleResponse'){
									selectedQuestionTypesToShow.push(" Multiple Response")
								}else if(quizTypes=='Matching'){
									selectedQuestionTypesToShow.push(" Matching")
								}else if(quizTypes=='MultipleChoice'){
									selectedQuestionTypesToShow.push(" Multiple Choice")
								}else if(quizTypes=='TrueFalse'){
									selectedQuestionTypesToShow.push(" True False")
								}else if(quizTypes=='FillInBlanks'){
									selectedQuestionTypesToShow.push(" Fill in the Blanks")
								}
							}
							
							$scope.getSearchCriteriaSelections = function(){
								if(selectedQuestionTypesToShow.length!=0){
									return selectedQuestionTypesToShow.toString() + " :";	
								}else{
									return "";
								}
							}
							
							$scope.showHideSearchCriteria =function(){
								if($scope.isAdvancedSearchMode == true || $scope.isSearchMode == true){
									return true;
								} else{
									false;
								}
							}
							
							
							$scope.searchBooksForQuestionTypes = function(node) {
								$scope.showAdvancedSearch = false;
								if($scope.selectedContainer!=undefined && $scope.selectedContainer!=""){
									$scope.isAdvancedSearchMode=true;
									$scope.showContainer();
								}
								else{
									$rootScope.blockPage.start();
									var count = 0;
									var emptyBooks=0;
									$scope.selectedBooks.forEach(function(book){
										ContainerService.getQuestionTypeContainers(book.guid,$scope.selectedQuestionTypes.toString(),function(containers){
											if(containers.length==0){
												emptyBooks = emptyBooks+1;
											}
											containers.forEach(function(container){
												container.isCollapsed=true;
												container.nodeType = "chapter";
												container.bookid = book.guid;
											});
											book.isCollapsed=false;
											book.nodes=containers;
											if(count == 0){
												$scope.disciplines=[];
											}
											$scope.bookAddToDiscipline(book);
											count=count+1;
											if(count == $scope.selectedBooks.length){
												$rootScope.blockPage.stop();
											}
											if(emptyBooks == $scope.selectedBooks.length){
												$rootScope.blockPage.stop();
												$scope.IsConfirmation = false;
												$scope.message = "No search results match your criteria, broaden your criteria, or select more question banks to search";
												$modal.open(confirmObject);
											}
										});
									});	
								}
							}
							
							$scope.bookAddToDiscipline=function(book){
								$scope.isAdvancedSearchMode = true;
								var isDesciplineExists=false;  
								var searchedDiscipline={};
								if($scope.disciplines.length==0){
									searchedDiscipline["item"] = book.discipline;
									searchedDiscipline["isCollapsed"]=false;
									searchedDiscipline["nodes"] = [book];
									$scope.disciplines.push(searchedDiscipline);
								}else{
									$scope.disciplines.forEach(function(discipline) {
										if(discipline.item===book.discipline){
											isDesciplineExists=true;
											discipline.nodes.push(book);
										}
									});
									if(!isDesciplineExists){
										searchedDiscipline["item"] = book.discipline;
										searchedDiscipline["isCollapsed"]=false;
										searchedDiscipline["nodes"] = [book];
										$scope.disciplines.push(searchedDiscipline);
									}
								}
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
							
							$scope.clearAdvancedSearch = function(){
								$scope.selectedContainer="";
								$scope.selectedQuestionTypes=[];
								$scope.selectedBookIDs=[];
								$scope.isAdvancedSearchMode = false;
								$scope.isSearchMode = false;
								$scope.selectedQuestionTypesToShow=[];
								$scope.selectedBooks=[];
								selectedQuestionTypesToShow=[];
								$scope.loadTree();
							}
							
							$scope.$on('handleBroadcast_AddNewTest', function (handler, newTest, containerFolder, isEditMode, oldGuid) {							    
							    if (isEditMode) {
							        return false;
							    }
							    for (var i = 0; i < $scope.selectedNodes.length; i++) {
							        if (oldGuid === $scope.selectedNodes[i].guid) {
							            $scope.selectedNodes[i].showEditIcon = true;
							        }
							    }
							    TestService.getMetadata(newTest.guid, function (test) {
							        test.nodeType = "test";
							        SharedTabService.tests[SharedTabService.currentTabIndex].metadata = TestService.getTestMetadata(test);
							        SharedTabService.tests[SharedTabService.currentTabIndex].treeNode = null;
							    });
							});
						} ]);