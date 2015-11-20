//New comment from second system

'use strict';

angular
		.module('e8QuestionBanks')
		.directive("typeaheadWatchChanges", function() {
		  return {
		    require: ["ngModel"],
		    link: function(scope, element, attr, ctrls) {
		      scope.$watch('selectedContainer', function(value) {		    	
	    		  ctrls[0].$setViewValue(value);
		      });
		    }
		  };
		})
		.controller(
				'QuestionBanksController',
				[
						'$scope',
						'$rootScope',
						'$location',
						'$cookieStore',
						'$timeout',
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
                        'CommonService',
                        'BookService','HttpService','UserService','questionService',
						function($scope, $rootScope, $location, $cookieStore, $timeout,
								$http, $sce, DisciplineService, TestService,
								SharedTabService, UserQuestionsService,
								EnumService, $modal, blockUI, ContainerService, CommonService,BookService,HttpService,UserService,questionService) {
						    SharedTabService.selectedMenu = SharedTabService.menu.questionBanks;
						    $rootScope.blockPage = blockUI.instances.get('BlockPage');
						    
							$scope.controller = EnumService.CONTROLLERS.questionBanks;
							$scope.selectedNodes = [];		
							
							//to set the status of the question node,if the question node present in test frame.
							var setTestQuestionNodeStatus=function(item){
								item.nodeType = "question";			
								item.existInTestframe=true;
								item.isNodeSelected = true;
								item.showEditQuestionIcon = false;
								item.showTestWizardIcon = false;													
							}
															
							//To check the question node is present in selectedNodes array.
							$scope.isNodeInSelectedNodesArray = function(node) {
								var isNodeUsed=false;
								$scope.selectedNodes.forEach(function(usedNode) {
									if(usedNode.guid === node.guid){
										isNodeUsed=true;
										return;
									}
								});
								return isNodeUsed;								
							}

							//To add a node to selectedNodes array.
							$scope.addingNodeInSelectedNodesArray = function(node) {								
								if(!$scope.isNodeInSelectedNodesArray(node)){
									$scope.selectedNodes.push(node);
								}			
							}
							
						    //no teb switch, restore selectedNodes items
							for (var i = 0; i < SharedTabService.tests.length; i++) {
							    if (SharedTabService.tests[i].treeNode) {
							        $scope.selectedNodes.push(SharedTabService.tests[i].treeNode);
							    }
							}
							
							if (SharedTabService.tests[SharedTabService.currentTabIndex].questions.length) {
							    var test = SharedTabService.tests[SharedTabService.currentTabIndex];
							    for (var j = 0; j < test.questionFolderNode.length; j++) {
							    	var questionFolderNode = angular.copy(test.questionFolderNode[j]);							    	
							    	$scope.addingNodeInSelectedNodesArray(questionFolderNode);
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
									
/*	Code commented to revert drag and drop of questions within your questions folder
 * 								var mouseOverNode = null;		
									
						            if($rootScope.tree)
						            	mouseOverNode = $rootScope.tree.mouseOverNode;

						            if (mouseOverNode) {
						                $rootScope.tree = { mouseOverNode: null };
						                mouseOverNode.hover = false;
						            }

						            if (mouseOverNode && (mouseOverNode != source)) {
						            	
										$rootScope.blockLeftPanel.start();
						            	source.remove(); 
						            	
						            	var questionFolder = {
						            			"questionId" : source.node.guid,
						            			"sourceFolderId" : source.node.parentId,
						            			"destFolderId" : mouseOverNode.node.guid
						            	}
						            	
						            	UserQuestionsService.moveQuestion(questionFolder, function(response) {
						            		if(!response){
						            			CommonService.showErrorMessage(e8msg.error.cantMoveQuestion);
						            		}
						            		$rootScope.blockLeftPanel.stop();
						            	});
						            	
						            	
						            	return false;
						            	
						            }else {
						            	
						            	if(sourceParent == destParent){
											return false;
										}
						            	if(destParent.node && destParent.node.type == EnumService.NODE_TYPE.yourQuestionRoot){
							            	
											$rootScope.blockLeftPanel.start();
						            		source.remove();
						            		
							            	var questionFolder = {
							            			"questionId" : source.node.guid,
							            			"sourceFolderId" : source.node.parentId,
							            			"destFolderId" : null
							            	}
							            	
							            	UserQuestionsService.moveQuestion(questionFolder, function(response) {
								            	if(!response){
							            			CommonService.showErrorMessage(e8msg.error.cantMoveQuestion);
							            		}
							            		$rootScope.blockLeftPanel.stop();
							            	});
							            	
							            	return false;
										}else if(destParent.node && destParent.node.nodeType == EnumService.NODE_TYPE.userQuestionFolder){
											$rootScope.blockLeftPanel.start();
						            		source.remove(); 
							            	
							            	var questionFolder = {
							            			"questionId" : source.node.guid,
							            			"sourceFolderId" : source.node.parentId,
							            			"destFolderId" : destParent.node.guid
							            	}
							            	
							            	UserQuestionsService.moveQuestion(questionFolder, function(response) {
								            	if(!response){
							            			CommonService.showErrorMessage(e8msg.error.cantMoveQuestion);
							            		}
							            		$rootScope.blockLeftPanel.stop();
							            	});
							            	
							            	if(destParent.node.nodes) {
							                   	var nodeIndex = 0;
							                   	var emptyNodeIndex;
							                    destParent.node.nodes.forEach(function(node) {

							                   	if(node.nodeType == "empty") {
							                   	emptyNodeIndex = nodeIndex;
							                   	}
							                   	nodeIndex++;
							                   	})
							                    destParent.node.nodes.splice(emptyNodeIndex, 1);
							        }
							            	return false;
										}
						            }*/
						            
						            if(source.node.nodeType==='test' && destParent.controller === EnumService.CONTROLLERS.testCreationFrame){        
						                source.node.showEditIcon=false;
						                source.node.showArchiveIcon=false;
						                $rootScope.$broadcast("dropTest", source, destIndex);
						                return false;
						            }
						            
						            /*on mousedown of plus icon or node we are calling selectNode() function and even in dragEnd event also we are calling this method,
						            we need to cross check this use case,because of this call multi queston node drag and drop is working.
						            */
									if (!source.node.isNodeSelected) {
										$scope.selectNode(source);
									}
									
									if (SharedTabService.tests[SharedTabService.currentTabIndex].isTestWizard) {
										 $scope.createTestWizardCriteria(source, "dragEvnt");
									} else {
									    $scope.editQuestion(source.node, destIndex, "dragEvnt");
									}

								}
							});
							
/*	Code commented to revert drag and drop of questions within your questions folder
 * 				        $scope.treeNodeMouseEnter = function (node) {
					            if ($scope.dragStarted && node.collapsed 
					            		&& node.node.nodeType != EnumService.NODE_TYPE.UserQuestionsFolder) {
					                $rootScope.tree = { mouseOverNode: node };
					                node.hover = true;
					            }
					        };

					        $scope.treeNodeMouseLeave = function (node) {

					            $rootScope.tree = { mouseOverNode: null };
					            node.hover = false;
					        }*/

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
							$scope.yourQuestionsFolder = null;
							$scope.loadTree = function() {
								DisciplineService.userDisciplines(function(userDisciplines) {
									if(userDisciplines==null){
										CommonService.showErrorMessage(e8msg.error.cantFetchDisciplines)
										return;
									}

									userDisciplines.sort(function(a, b) {
										return a.item.localeCompare(b.item)
									});
									var userDisciplineLength=0;
									userDisciplines.forEach(function(discipline) {
										discipline["isCollapsed"]=false;
										discipline.isHttpReqCompleted = true;
										discipline.nodeType = "discipline";
										BookService.userDisciplineBooks(discipline,function(userbooks){
											if(userbooks==null){
												CommonService.showErrorMessage(e8msg.error.cantFetchBooks)
						            			return;
											}
											userbooks.forEach(function(books) {
												books.isCollapsed=true;
												books.nodeType = "book";
											});
											discipline["nodes"] = userbooks;
											if(userDisciplineLength==userDisciplines.length){
												$scope.disciplines = userDisciplines;
											}
										});
										userDisciplineLength = userDisciplineLength + 1;

										$scope.disciplines = userDisciplines;
									});
									UserQuestionsService.userQuestionsCount(function(userQuestionsCount) {
										if (userQuestionsCount > 0) {
											$scope.disciplines.unshift({
												"item" : "Your Questions (user created)",
												"type" : "YourQuestionRoot",
												"isCollapsed" : true,
												"nodeType" : EnumService.NODE_TYPE.yourQuestionRoot
											});	
											$scope.disciplines[0].isHttpReqCompleted = true;
											$scope.yourQuestionsFolder = $scope.disciplines[0];
										}	
									})

								});	
							}
							
							$scope.loadTree();
							
							$scope.$on('SaveSettings', function() {
								$scope.selectedContainer="";
								$scope.selectedQuestionTypes=[];
								$scope.isAdvancedSearchMode = false;
								$scope.isSearchMode = false;
								$scope.selectedBooks=[];
								selectedQuestionTypesToShow=[];
								selectedMetadataTypesToShow=[];
								searchedQuestionTypes=[];
								bookContainersArray=[];
								$scope.allContainers=[];
								$scope.selectedBookid="";
								$scope.expandedNodes=[];
								$scope.selectedNodes=[];
								$scope.loadTree();	
								$scope.closeAdvancedSearch();
								$scope.userMetadata=[];
								searchedMetadataValues={
										"Difficulty":[]
									};
								$scope.getUserMetadata();
							})

							$scope.testTitle = "New Test";

							$scope.addFolderClick = function(node) {
                                
                                document.getElementById("txtFolderName").value = "";                                
                                $scope.YourQuestionRoot = node;
                                
                                $scope.showAddFolderPanel= !$scope.showAddFolderPanel;                               
                            }
							
							$scope.folderNameTextBoxBlur = function() {
								
								if($scope.enterKey == true) {
                                    $scope.enterKey = false;
                                    return;
                                }
					                
								if(document.getElementById("txtFolderName").value.trim().length==0) {
                                    $scope.showAddFolderPanel = false;
                                    return; 
                                } else {
                                    $scope.IsConfirmation = true;
                                    $scope.message = "Do you want to save this folder?"; 
                            		$modal.open(confirmObject).result.then(function(ok) {
                        	    		if(ok) {
                        	    			$scope.addNewFolder(false);
                        	    		} else {
                                            $scope.showAddFolderPanel = false;
                                            document.getElementById("txtFolderName").value = "";
                                            return; 
                        	    		}
                            		});
                                }
                            }
                           
							
							$scope.addNewFolder = function (enterKey) {
                                
								$scope.enterKey = enterKey;
								
                                if(document.getElementById("txtFolderName").value.trim().length==0) { return; }
                                var folderName = document.getElementById("txtFolderName").value.trim();
                                document.getElementById("txtFolderName").value = "";
                                var sequence = 1;

                                if($scope.YourQuestionRoot.node && $scope.YourQuestionRoot.node.nodes[0]) {
                                    
                                    var duplicateTitle = false;
                                    $scope.YourQuestionRoot.node.nodes.forEach(function(rootFolder) {
                                        if(rootFolder.title == folderName) {
                                            duplicateTitle = true;    
                                            
                                            $scope.isAddFolderClicked=true;
                                            $scope.IsConfirmation = false;
                                            $scope.message = "A folder already exists with this name. Please save with another name."; 
                                    		$modal.open(confirmObject).result.then(function(ok) {
                                	    		if(ok) {
                                	    			document.getElementById("txtFolderName").value = folderName;
                                	    			$("#txtFolderName").focus();
                                	    		}
                                    		});
                                        }
                                    });
                                    
                                    if(duplicateTitle) return;
                                    
                                    if($scope.YourQuestionRoot.node.nodes[0].sequence) {
                                    	sequence = (0 + $scope.YourQuestionRoot.node.nodes[0].sequence) / 2;	
                                    } else {
                                    	sequence = 1;
                                    }
                                    
                                }                                
                                
                                UserQuestionsService.userQuestionsFolderRoot(function(userQuestionsFolderRoot) {
                                	if(userQuestionsFolderRoot==null){
                                		CommonService.showErrorMessage(e8msg.error.cantFetchRootFolder);
                                		return;
                                	}                                    
                                    var UserQuestionsFolder = {
                                        "parentId": userQuestionsFolderRoot.guid,                
                                        "sequence": sequence,
                                        "title": folderName
                                    };
                                        
                                    UserQuestionsService.saveQuestionFolder(UserQuestionsFolder, function (userFolder) {
                                    	if(userFolder==null){
                                    		CommonService.showErrorMessage(e8msg.error.cantSaveQuestionFolder);
    						         		return;
                                    	}
                                        $scope.YourQuestionRoot.node.nodes.unshift(UserQuestionsFolder);
                                        $scope.YourQuestionRoot.node.nodes[0].nodeType = EnumService.NODE_TYPE.userQuestionFolder;
                                        $scope.YourQuestionRoot.node.nodes[0].isCollapsed = true;
                                        $scope.YourQuestionRoot.node.nodes[0].guid = userFolder.guid;
                                        $scope.YourQuestionRoot.node.nodes[0].droppable = true;
                                        $scope.showAddFolderPanel = false;
                                    });
                                    
                                    $("#tree-root")[0].scrollTop = 0;
                                    $("#txtFolderName").blur(); 
                                });
                            }

							$scope.getBooks = function(discipline, callback) {

								if (!discipline.collapsed) {
									$scope.showAddFolderLink = false;
									$scope.showAddFolderPanel = false;
									discipline.collapse();
								} else {
									discipline.expand();
									
									if($scope.isSearchMode){
										return;
									}
									var ep;

									if (discipline.node.item == 'Your Questions (user created)') {

										$scope.yourQuestionsFolder = discipline;
										
										discipline.node.nodes = [];

										// qti player initialisation
										QTI.initialize();

										var yourQuestions = [];
										
										UserQuestionsService.userQuestionsFolderRoot(function(userQuestionsFolderRoot) {
											if(userQuestionsFolderRoot==null){
		                                		CommonService.showErrorMessage(e8msg.error.cantFetchRootFolder);
		                                		return;
		                                	}
											$scope.userQuestionsFolderRoot = userQuestionsFolderRoot;
										});
										discipline.node.isHttpReqCompleted = false;
										
										UserQuestionsService.userQuestionsFolders(function(userQuestionsFolders) {
                                            var folderCount = 0;
											userQuestionsFolders.forEach(function(userQuestionsFolder) {
												var yourQuestionFolder = {};
												yourQuestionFolder.guid = userQuestionsFolder.guid;												
												yourQuestionFolder.title = userQuestionsFolder.title;
												yourQuestionFolder.isCollapsed = true;
												yourQuestionFolder.parentId = userQuestionsFolder.parentId;
												yourQuestionFolder.sequence = userQuestionsFolder.sequence;
												yourQuestionFolder.nodeType = "UserQuestionsFolder";
												yourQuestions.push(yourQuestionFolder);
												folderCount = folderCount + 1;
											});
											
											UserQuestionsService.userQuestions(function(userQuestions) {
												$scope.userQuestions = userQuestions;													
												$scope.userQuestions.forEach(function(userQuestion) {
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
	
													yourQuestion.parentId = $scope.userQuestionsFolderRoot.guid;
													yourQuestion.nodeType = "question";
													yourQuestion.questionType = "userCreatedQuestion";
													yourQuestion.guid = userQuestion.guid;
													yourQuestion.showEditQuestionIcon = false;
													yourQuestion.isNodeSelected = false;
													
													yourQuestion.questnNumber=folderCount;
													addToQuestionsArray(yourQuestion);
	
													yourQuestion.data = userQuestion.qtixml;
													yourQuestion.quizType = userQuestion.metadata.quizType;
													yourQuestion.extendedMetadata = userQuestion.metadata.extendedMetadata;
													yourQuestion.textHTML = displayNode
															.html();
	
													yourQuestion.template = 'qb_questions_renderer.html';
	
													yourQuestions.push(yourQuestion);
												})
												yourQuestions.userFolderCount = folderCount;
												discipline.node.nodes = yourQuestions;
												
												discipline.node.isHttpReqCompleted = true;												
												
												$scope.showAddFolderLink = false;
											});
										});
										

									} else {
										ep = evalu8config.apiUrl
												+ "/books?discipline="
												+ discipline.node.item
												+ "&userBooks=true";

										HttpService.get(ep)
												.success(
														function(response) {
															response.forEach(function(book) {
																book["isCollapsed"]=true;
																book.nodeType = "book";
															});
															
                                                            if(response.length == 0) {

                                                                var emptyNode = [{ "nodeType": "empty", "draggable": false, "title": "There are no books selected under this Discipline", "sequence": 0 }];
                                                                discipline.node.nodes = emptyNode;
                                                            } else {
                                                                discipline.node.nodes = response;    
                                                            }

														});
									}
								}
								
							}

							// To get the Chapters for the given book
							// This method will call the api
							// mytest/books/{bookid}/nodes.
							// Output collection will be append to input book
							// angularjs node.
							$scope.expandedNodes=[];
							$scope.getNodes = function(book) {

								$scope.bookID = book.node.guid;

								if (!book.collapsed) {
									book.collapse();
								} else {
									book.expand();
									
									if(book.node.nodeType == 'UserQuestionsFolder') {
										
										QTI.initialize();
										
										var yourQuestions = [];
										book.node.nodes = [];
										$rootScope.blockLeftPanel.start();
										UserQuestionsService.userBookQuestions(book.node.guid, function(userQuestions) {
											if(userQuestions.length == 0){
												var emptyNode = CommonService.getEmptyFolder()
												$scope.isTopicsLoaded=true;
												emptyNode.isHttpReqCompleted = true;
												book.node.nodes.push(emptyNode);
												$rootScope.blockLeftPanel.stop();
											}else{
											
											try {
												userQuestions
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
															yourQuestion.parentId = book.node.guid;
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

															yourQuestion.isHttpReqCompleted = true;

															yourQuestions
																	.push(yourQuestion);
														})

												book.node.nodes = yourQuestions;
											} catch (e) {
												console.log(e);
											}finally{
												$rootScope.blockLeftPanel.stop();
											}
										}
										})
									} else {
										if(book.node.nodes){
											return false;
										}
										
										if($scope.isSearchMode && $scope.searchedContainerId!=book.node.guid){
											return;
										}
										
										 ContainerService.bookNodes(book.node.guid, getSearchCriteria(false),
	                                    		function(bookNodes) {
	                                    	if(bookNodes==null){
	                                    		CommonService.showErrorMessage(e8msg.error.cantFetchNodes)
	                                    		return;
	                                    	}
	                                        book.node.nodes = bookNodes;
	                                        $scope.expandedNodes=$scope.expandedNodes.concat(book.node.nodes);
	                                        angular.forEach(
	                                            book.node.nodes,
	                                            function(item) {
	                                                item.showTestWizardIcon = false;
	                                                item.showEditQuestionIcon = false;
	                                                item.isNodeSelected = false;
	                                                item.isHttpReqCompleted = true;
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
	                                                publisherTestsNode.isHttpReqCompleted = true;
	                                                publisherTestsNode.bookId = book.node.guid;                                                    
	                                            }                                                
	                                    });	
									}
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
                                        }, evalu8config.messageTipTimeMilliSeconds);
                                    }

                                    SharedTabService.showSelectedTestTab(test.node);
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
									currentNode, eventType) {
								$scope.createTestWizardMode=true;
								
								if(eventType ==null || eventType =='' || eventType == undefined){
									eventType = "clickEvnt";
								}
								if (!SharedTabService.isTestWizardTabPresent) {
									$rootScope
											.$broadcast('handleBroadcast_AddTestWizard');
								}
								var tab = SharedTabService.tests[SharedTabService.currentTabIndex];
								if (!tab.isTestWizard) {
									$scope.createTestWizardMode=false;
									return false;
								}

								if (!currentNode.node.isNodeSelected) {
									$scope.selectedNodes.push(currentNode.node);
									currentNode.node.isNodeSelected = !currentNode.node.isNodeSelected;
								}
								if(SharedTabService.isErrorExist(
                                        currentNode.node, $scope.selectedNodes)) {
									$scope.createTestWizardMode=false;
                                    SharedTabService
                                            .TestWizardErrorPopup_Open();
                                    return false;
                                }
								isChildNodeUsed=false;
                                $scope.selectedNodes.forEach(function(selectedNode){
                                	if(!isChildNodeUsed){
                                        $scope.isChildNodeUsed(selectedNode, tab)
                                    }
                                });
                                
                                if(isChildNodeUsed){
                                    SharedTabService.addErrorMessage(childNodesUsedForTestCreation,SharedTabService.errorMessageEnum.TopicInChapterIsAlreadyAdded);
                                    SharedTabService.TestWizardErrorPopup_Open();
                                    return false;    
                                }
                                if( eventType == "clickEvnt"){
									$scope.addWizardToTestFrameTab(currentNode.node);
								}else{
								var httpReqCount = 0,
                                    httpReqCompletedCount = 0;
								for (var i = 0; i < $scope.selectedNodes.length; i++) {
									currentNode = $scope.selectedNodes[i];
									if (currentNode.showTestWizardIcon) {
									    httpReqCount++;
									    currentNode.showTestWizardIcon = false;
									    $rootScope.blockPage.start();
										getQuestions(
												currentNode,
												function (response, currentNode) {
												    try {
												    	
												        if (response.length) {
												            $rootScope.$broadcast(
																	        "handleBroadcast_createTestWizardCriteria",
																	        response,
																	        currentNode);
												        } else {
												            SharedTabService.addErrorMessage(currentNode.title, e8msg.warning.emptyFolder);
												            currentNode.showTestWizardIcon = true;
												            for (var j = 0; j < tab.questionFolderNode.length; j++) {
												                if (tab.questionFolderNode[j].guid == currentNode.guid) {
												                    tab.questionFolderNode.splice(j, 1);
												                }
												            }                                                        
												        }

												        httpReqCompletedCount++;
												        if (httpReqCount == httpReqCompletedCount && SharedTabService.errorMessages.length > 0) {
												            SharedTabService.TestWizardErrorPopup_Open();
												        }
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
						}
							function getQuestions(currentNode, callBack) {
								var node;
								var questions=[];
								if($scope.isSearchMode){
									var isParentContainer=false; 
									parentContainers.forEach(function(parentContainer){
										if(parentContainer.guid==currentNode.guid){
											isParentContainer=true;
										}
									});
									if(currentNode.guid==$scope.searchedContainerId || isParentContainer){
										node=$scope.searchedContainerId; 
									}else{
										node=currentNode.guid;
									}
								}else{
									node=currentNode.guid;
								}
								if (currentNode.nodeType === EnumService.NODE_TYPE.userQuestionFolder) {
								    UserQuestionsService.userBookQuestions(currentNode.guid, function (userQuestions) {
								        var responceMetadatas = [];
								        for (var i = 0; i < userQuestions.length; i++) {
								            responceMetadatas.push(userQuestions[i].metadata);
								        }
								        callBack(responceMetadatas, currentNode)
								    })
								} else {
									questionService.getAllQuestionsOfContainer(currentNode.bookid,node,getSearchCriteria(false), function(response){
										if(response==null){
											SharedTabService.addErrorMessage(currentNode.title, SharedTabService.errorMessageEnum.NoQuestionsAvailable);
                                            currentNode.showTestWizardIcon = true;
                                            currentNode.showEditQuestionIcon = true;
                                            $scope.selectNode(currentNode);
                                            $rootScope.blockPage.stop();
                                            return;
										}
										
										callBack(response, currentNode)
									});
								}
							}

							$scope.addWizardToTestFrameTab = function(currentNode){
								var httpReqCount = 0,
                                httpReqCompletedCount = 0;
								currentNode.showTestWizardIcon = false;
								if(currentNode.nodes){
									currentNode.nodes.forEach(function(node) {	
									node.showTestWizardIcon = false;
								})
							}
							    $rootScope.blockPage.start();
								getQuestions(
										currentNode,
										function (response, currentNode) {
										    try {
										    	
										        if (response.length) {
										            $rootScope.$broadcast(
															        "handleBroadcast_createTestWizardCriteria",
															        response,
															        currentNode);
										        } else {
										            SharedTabService.addErrorMessage(currentNode.title, e8msg.warning.emptyFolder);
										            currentNode.showTestWizardIcon = true;
										            for (var j = 0; j < tab.questionFolderNode.length; j++) {
										                if (tab.questionFolderNode[j].guid == currentNode.guid) {
										                    tab.questionFolderNode.splice(j, 1);
										                }
										            }                                                        
										        }

										        httpReqCompletedCount++;
										        if (httpReqCount == httpReqCompletedCount && SharedTabService.errorMessages.length > 0) {
										            SharedTabService.TestWizardErrorPopup_Open();
										        }
                                            } catch (e) {
                                                console.log(e);
                                            } finally {
                                            	$scope.createTestWizardMode=false;
                                                $rootScope.blockPage.stop();
                                            }
										});
								
							}

							$scope.getNodesWithQuestion = function(currentNode) {
								
								$scope.bookID=currentNode.node.bookid;
								
								if (!currentNode.collapsed) {
									currentNode.collapse();
									$(currentNode.$element).find(".captiondiv").removeClass('iconsChapterVisible');
									
									// Dont delete the below commented line, will delete after few days.
									/*currentNode.$element.children(1).removeClass('expandChapter');*/
								} else {
								    
									currentNode.expand();
									if(currentNode.node.nodes){
										return false;
									}
									currentNode.node.isHttpReqCompleted = false;
									
                                    if(currentNode.node.nodeType == 'publisherTests') {
                                        
                                    	currentNode.node.nodes = [];
                                    	                                   		
                                        TestService.getPublisherTestsByBookId(currentNode.node.bookId, function(tests){
                                        	if(tests==null){
                                        		currentNode.node.isHttpReqCompleted = true;
                                        		CommonService.showErrorMessage(e8msg.error.cantFetchPublisherTests);
                                        		return;
                                        	}

                                        	tests.forEach(function(test) {
                                                test.nodeType = EnumService.NODE_TYPE.test;
                                                test.testType = "PublisherTest";
                                                test.showEditIcon=true;
                                                test.selectTestNode = false;//to show the edit icon
                                                                                        	
                                                currentNode.node.nodes.push(test);
                                                                                                
                                                test.template = 'tests_renderer.html';
                                                updateTreeNode(test);                                        		
                                        	})
                                        	
                                        	currentNode.node.isHttpReqCompleted = true;
                                        });
                                        
                                        return;
                                    }
						                                        
									currentNode.node.nodes = [];
									currentNode.node.IsContainerReqCompleted = false;
									currentNode.node.IsQuestionsReqCompleted = false;
									ContainerService.containerNodes($scope.bookID, 
										currentNode.node.guid,
										getSearchCriteria(false),
										false,
										function(response) {
										if(response == null){
											//currentNode.node.isHttpReqCompleted = true;
											$scope.isTopicsLoaded=true;
											stopIndicator(currentNode);
											CommonService.showErrorMessage(e8msg.error.cantFetchNodes)
					            			return;
										}
										    currentNode.node.IsContainerReqCompleted = true;
											if(response.length>0){
												currentNode.node.nodes = currentNode.node.nodes.concat(response);
												$scope.expandedNodes=$scope.expandedNodes.concat(currentNode.node.nodes);
												var topicCount=0;
												angular.forEach(currentNode.node.nodes, function(item) {
													item.template = 'nodes_renderer.html';
													item.showTestWizardIcon = false;
													item.showEditQuestionIcon = false;
													item.isNodeSelected = currentNode.node.isNodeSelected;
													
													//change the status of node, if parent node is selected.
													if(currentNode.node.isNodeSelected){														
														item.showEditQuestionIcon = true;
														item.showTestWizardIcon = true;
													}	
																										
													//add the node to $scope.selectedNodes array, if node is in selected status.
													if(item.isNodeSelected){													
														$scope.addingNodeInSelectedNodesArray(item);	
													}
													
													
	                                                item.nodeType = "topic";
	                                                item.isCollapsed = true;
	                                                item.isHttpReqCompleted = true;
	                                                item.parentId = currentNode.node.guid;
													updateTreeNode(item);
													topicCount = topicCount+1;
													if(topicCount == currentNode.node.nodes.length){
														$scope.isTopicsLoaded=true;
														stopIndicator(currentNode);
													}
												})
												
											} else if (!response.length && !currentNode.node.nodes.length) {
											    var emptyNode = CommonService.getEmptyFolder()
											    $scope.isTopicsLoaded=true;
											    emptyNode.isHttpReqCompleted = false;
											    if (currentNode.node.IsContainerReqCompleted && currentNode.node.IsQuestionsReqCompleted) {
											        emptyNode.isHttpReqCompleted = true;
											    }
											    currentNode.node.nodes.push(emptyNode);
											}
										
										})

										questionService.getQuestionsOfContainer($scope.bookID,currentNode.node.guid, getSearchCriteria(false), function(response){
											if(response==null){
												$scope.isQuestionsLoaded=true;
												stopIndicator(currentNode);
												CommonService.showErrorMessage(e8msg.error.cantFetchQuestions)
												return;
											}
											
										   currentNode.node.IsQuestionsReqCompleted = true;
											var responseQuestions = response;
											if(responseQuestions.length==0){
												$scope.isQuestionsLoaded=true;
												stopIndicator(currentNode);
											}
											
											if (responseQuestions.length && currentNode.node.nodes.length && currentNode.node.nodes[0].nodeType === EnumService.NODE_TYPE.emptyFolder) {
												currentNode.node.nodes = [];
											} else if (!responseQuestions.length && currentNode.node.nodes.length && currentNode.node.nodes[0].nodeType === EnumService.NODE_TYPE.emptyFolder
											   && currentNode.node.IsContainerReqCompleted && currentNode.node.IsQuestionsReqCompleted) {
												currentNode.node.nodes[0].isHttpReqCompleted = true;
											}
											$(currentNode.$element).find(".captiondiv").addClass('iconsChapterVisible');
											
											// Dont delete the below commented line, will delete after few days.
											//currentNode.$element.children(0).addClass('expandChapter');
	
											var sortedNodes = sortNodes(response, currentNode,"questionBindings");
	
											currentNode.node.nodes = currentNode.node.nodes.concat(sortedNodes);
											var questionCount=0;
											angular.forEach(responseQuestions, function(item) {
												setQuestionNodeStatus(item,currentNode);												
												updateTreeNode(item);
												addToQuestionsArray(item);
												$scope.renderQuestion(item);
												questionCount=questionCount+1;
												if(questionCount == responseQuestions.length){
													$scope.isQuestionsLoaded=true;
													stopIndicator(currentNode);
												}
											});
										});
									
									}
								
								
							}
							
							//to change the status of the topic's node, when we expand a topic.
							var setQuestionNodeStatus=function(item,currentNode){
								item.nodeType = "question";			
								
								//change the status of node, if parent node is selected.
								if(currentNode.node.isNodeSelected){
									item.isNodeSelected = currentNode.node.isNodeSelected;
									item.showEditQuestionIcon = true;
									item.showTestWizardIcon = true;
								}
								
								item.parentId = currentNode.node.guid;
								
								//change the status of node, if node is present in test frame.
								if($scope.isNodeInTestFrame(item)){
									setTestQuestionNodeStatus(item);												
								}
								
								//add the node to $scope.selectedNodes array, if node is in selected status.
								if(item.isNodeSelected){													
									$scope.addingNodeInSelectedNodesArray(item);	
								}
							}
							
							var stopIndicator=function(selectedNode){
								if($scope.isQuestionsLoaded & $scope.isTopicsLoaded){
									selectedNode.node.isHttpReqCompleted=true;
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
								
								if (!currentNode.collapsed) {
									currentNode.collapse();
								} else {
									currentNode.expand();
									currentNode.node.nodes = [];

									HttpService.get(evalu8config.apiUrl
															+ "/books/"
															+ $scope.bookID
															+ "/nodes/"
															+ currentNode.node.guid
															+ "/questions")
										.success(function(response) {

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

										})
										.error(function() {
										});									
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

								HttpService.get(evalu8config.apiUrl
														+ "/questions/"
														+ item.guid)
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
							var sortNodes = function (response, currentNode, binding) {
								var sequenceBindings = currentNode.node[binding];
								var sortedNodes = [];
								for (var i = 0; i < sequenceBindings.length; i++) {
									 var node= $.grep(response, function(item) {
										return item.guid == sequenceBindings[i]
									})[0]
									if(node!=undefined){
										 sortedNodes.push(node);	 
									}
								}
								return sortedNodes;
							}

						    //TODO : need to revisit and look for better way instead of using JQuery.
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
							
							
							//To check the question node is present in current test frame.
							$scope.isNodeInTestFrame = function(node) {
								var isNodeUsed=false;
								var activeTest = SharedTabService.tests[SharedTabService.currentTabIndex];
								activeTest.questions.forEach(function(usedNode) {
									if(usedNode.guid === node.guid){
										isNodeUsed=true;
										return;
									}
								});
								return isNodeUsed;									
							}							

							//To remove a node from selectedNodes array.
							$scope.removeNodeFromSelectedNodes = function(node) {
								for (var j = 0; j < $scope.selectedNodes.length; j++) {
									if (node.guid === $scope.selectedNodes[j].guid) {
										$scope.selectedNodes.splice(j, 1);
										break;
									}
								}						
							}
							//To change the selection status of the parent node of a node.
							$scope.checkSiblingSelection = function(scope){
								if(scope.node.isNodeSelected){									
									if($scope.isAllSiblingsSelected(scope.$parentNodeScope.node.nodes)) {
										scope.$parentNodeScope.node.isNodeSelected = true;
										scope.$parentNodeScope.node.showEditQuestionIcon = true;
										scope.$parentNodeScope.node.showTestWizardIcon = true; 
										$scope.addingNodeInSelectedNodesArray(scope.$parentNodeScope.node);
										if(scope.$parentNodeScope.node.nodeType!='book'){
											$scope.checkSiblingSelection(scope.$parentNodeScope);
										}
									}
								}else{
									scope.$parentNodeScope.node.showEditQuestionIcon = false;
									scope.$parentNodeScope.node.showTestWizardIcon = false; 
									scope.$parentNodeScope.node.isNodeSelected = false;
									$scope.removeNodeFromSelectedNodes(scope.$parentNodeScope.node);
									if(scope.$parentNodeScope.node.nodeType!='book'){
										$scope.checkSiblingSelection(scope.$parentNodeScope);
									}									
								}
							};							
							//To change the selection status of the children nodes when parent node has been selected/deselcted.
							$scope.checkChildSelection = function(node){   
								if(typeof(node.nodes) == 'undefined'){
									return;
								}
								if(node.isNodeSelected){								
									node.nodes.forEach(function(node) {	
										node.isNodeSelected = true;
										if(!$scope.isNodeInTestFrame(node)){
											node.showEditQuestionIcon = true;
											node.showTestWizardIcon = true; 	
											node.existInTestframe = false;
											$scope.addingNodeInSelectedNodesArray(node);	
											if(node.nodes){
												$scope.checkChildSelection(node);
											}					
										}
									});								
								}else{									
									node.nodes.forEach(function(node) {	
										node.isNodeSelected = false;
										node.showEditQuestionIcon = false;
										node.showTestWizardIcon = false; 	
										node.existInTestframe = false; 											
										if($scope.isNodeInTestFrame(node)){
											node.isNodeSelected = true;		
											node.existInTestframe = true;		
										}else{										
											$scope.removeNodeFromSelectedNodes(node);											
										} 
										
										if(node.nodes){
											$scope.checkChildSelection(node);
										}										

									});									
								}								
							};
							
							//to skip the selection of a node if node is present in test frame.
							var skipNodeSelection=function(node){
								if(node.isNodeSelected && node.showEditQuestionIcon == false && node.existInTestframe == true ){
									return true;
								}								
							}


							var isParentNodeUsed=false;
							$scope.selectNode = function (scope) {

								var node = scope.node;

								if(skipNodeSelection(node)){
									return;
								}

								if($scope.showAddFolderPanel) {
									$scope.showAddFolderPanel = false; 
								}

								var test = SharedTabService.tests[SharedTabService.currentTabIndex];
								if (node.isNodeSelected == false
										&& $rootScope.globals.loginCount <= evalu8config.messageTipLoginCount 
										&& node.nodeType != EnumService.NODE_TYPE.question
										&& node.nodeType != EnumService.NODE_TYPE.publisherTests) {
									$('.questionMessagetip').show()
									setTimeout(function() {
										$('.questionMessagetip').hide();
									}, evalu8config.messageTipTimeMilliSeconds);
								}

								if (!node.isNodeSelected) {
									isParentNodeUsed=false;
									$scope.isParentNodeUsed(node,test);
									if(isParentNodeUsed){
										$scope.IsConfirmation = false;
										$scope.message = "Parent chapter is already selected for test creation.Please open new tab to perform any other operation on it.";
										$modal.open(confirmObject)
									}else{
										$scope.selectedNodes.push(node);
										node.isNodeSelected = true;
										if($scope.isNodeUsedForEdit(node,test)){
											node.showEditQuestionIcon = false;
										}else{
											node.showEditQuestionIcon = true;	
										}

										if($scope.isNodeUsedForWizard(node,test)){
											node.showTestWizardIcon = false;
										}else{
											node.showTestWizardIcon = true;	
										}
										for (var j = 0; j < test.questions.length; j++) {
											if (node.guid === test.questions[j].guid) {
												node.showEditQuestionIcon = false;
											}
										}
										if($scope.selectedNodes.length > 0){
											$scope.deselectParentNode(node);
											$scope.deselectChildNode(node);	
										}
									}
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


								$scope.checkChildSelection(scope.node);
								$scope.checkSiblingSelection(scope);

							};		
							
							//#To check whether the any parent/child node of selected node is used for test creation(edit question/wizard)  
							$scope.isParentNodeUsed = function(selectedNode, test){
								for (var i = 0; i < $scope.expandedNodes.length; i++) {
									if ($scope.expandedNodes[i].guid == selectedNode.parentId) {
										isParentNodeUsed = $scope.isNodeUsed($scope.expandedNodes[i],test);
										if(isParentNodeUsed){
											break;
										}else if ($scope.expandedNodes[i].parentId != null && $scope.expandedNodes[i].parentId != "") {
											$scope.isParentNodeUsed($scope.expandedNodes[i], test)
										}
									}
								}
							}
							
							var childNodesUsedForTestCreation="";
							$scope.isChildNodeUsed = function(selectedNode, test) {
								for (var i = 0; i < $scope.expandedNodes.length; i++) {
									if ($scope.expandedNodes[i].parentId==selectedNode.guid) {
										isChildNodeUsed=$scope.isNodeUsed($scope.expandedNodes[i],test);
										if(isChildNodeUsed){
											 childNodesUsedForTestCreation = selectedNode.title;
											 break;
										}
										else
											$scope.isChildNodeUsed($scope.expandedNodes[i], test);	
									}
								}
							}
							
							
							
							$scope.isNodeUsed = function(node, test){
								return ($scope.isNodeUsedForEdit(node, test) || $scope.isNodeUsedForWizard(node, test));
							}
							
							$scope.isNodeUsedForEdit = function(node, test){
								var isNodeUsed=false;
								test.questionFolderNode.forEach(function(usedNode) {
									if(usedNode.guid === node.guid){
										isNodeUsed=true;
									}
								});
								return isNodeUsed;
							}
							
							$scope.isNodeUsedForWizard = function(node, test){
								var isNodeUsed=false;
								test.criterias.forEach(function(usedNode) {
									if(usedNode.folderId === node.guid){
										isNodeUsed=true;
									}
								});
								return isNodeUsed;
							}
							//#Ends
							
							$scope.deselectParentNode = function(selectedNode) {
								$scope.expandedNodes.forEach(function(container) {
									if (container.guid == selectedNode.parentId) {
										$scope.deselectNode(container);
										if (container.parentId != null&& container.parentId != "") {
											$scope.deselectParentNode(container)
										}
									}
								});
							}
							
							$scope.deselectChildNode = function(selectedNode) {
								$scope.expandedNodes.forEach(function(container) {
									if (container.parentId==selectedNode.guid) {
										$scope.deselectNode(container);
										$scope.deselectChildNode(container)
									}
								});
							}
							
							$scope.deselectNode = function(node){
								var i=0;
								$scope.selectedNodes.forEach(function(selectedContainer){
									if(selectedContainer.guid==node.guid){
										$scope.selectedNodes.splice(i, 1);
										node.isNodeSelected = false;
										node.showEditQuestionIcon = false;
										node.showTestWizardIcon = false;
									}
									i++;
								});
							}

							var isChildNodeUsed=false;
							
							$scope.editQuestion = function (scope, destIndex, eventType) {		
								$scope.editQuestionMode=true;
								
								if(eventType ==null || eventType =='' || eventType == undefined){
									eventType = "clickEvnt";
								}
								if (SharedTabService.tests[SharedTabService.currentTabIndex].isTestWizard) {
									$rootScope.$broadcast('handleBroadcast_AddNewTab');
								}
								var test = SharedTabService.tests[SharedTabService.currentTabIndex];
								isChildNodeUsed=false;
																

								for (var i = 0; i < $scope.selectedNodes.length; i++) {
									var isNodeUsed=false
									test.questionFolderNode.forEach(function(usedNode) {
										if(usedNode.guid === $scope.selectedNodes[i].guid){
											isNodeUsed=true;
										}
									});
									if(!isNodeUsed){
										$scope.isChildNodeUsed($scope.selectedNodes[i],test)	
									}
								}
								
								if(isChildNodeUsed){
									$scope.IsConfirmation = true;
									$scope.message = "This chapter includes the topic(s) that you have already added to the test. If you want to add the entire chapter, please click OK";
									$modal.open(confirmObject).result.then(function(ok) {
										if(ok) {
											$scope.addSelectedQuestionsToTestTab(test, destIndex, eventType,scope);
										}
									});
								}else{
								    SharedTabService.errorMessages = [];
								    $scope.addSelectedQuestionsToTestTab(test, destIndex, eventType,scope);								     
								}
								$scope.editQuestionMode=false;
							}
							
							$scope.isAnyNodeAlreadyAdded = false;
							
							$scope.addSelectedQuestionsToTestTab = function(test, destIndex, eventType,scope) {
                            	var selectedScopeNode = typeof scope.node == "undefined" ? scope : scope.node;
                            	if(!selectedScopeNode.showEditQuestionIcon)
                        		{
                            		$scope.isAnyNodeAlreadyAdded = true

                        		}
                            	
                            	if(selectedScopeNode.nodeType == EnumService.NODE_TYPE.question && eventType == "clickEvnt"){
									$scope.addQuestionToTestFrameTab(test,destIndex,eventType,scope);
								}else if(selectedScopeNode.nodeType == EnumService.NODE_TYPE.topic && eventType == "clickEvnt"){
									$scope.addTopicQuestionsToTestFrameTab(test,destIndex,eventType,selectedScopeNode,$scope.isAnyNodeAlreadyAdded);
								}else{
									$scope.addQuestionsToTestTab(test, destIndex, eventType,$scope.isAnyNodeAlreadyAdded);
									$scope.isAnyNodeAlreadyAdded = false;
								}      

							}
							
							$scope.addQuestionToTestFrameTab = function (test,destIndex,eventType,nodeScope) {							 
								if (nodeScope.node.showEditQuestionIcon) {					
										if (SharedTabService.tests[SharedTabService.currentTabIndex].IsAnyQstnEditMode) {
											nodeScope.node.showEditQuestionIcon = true;
											$scope.IsConfirmation = false;
											$scope.message = "A question is already in Edit mode, save it before adding or reordering questions.";
											$modal.open(confirmObject);
											$scope.dragStarted = false;
										}else{      
											$rootScope.blockPage.start();
											nodeScope.node.showEditQuestionIcon = false;
											$rootScope.$broadcast("dropQuestion",nodeScope.node, destIndex,"QuestionBank", eventType);
											$scope.checkAllSibblingNodeInTestFrame(nodeScope,test);
										}    

								}
							};
							
							//To check all child nodes of the parent node are selected.
							$scope.isAllSiblingsSelected = function(siblingNodes) {								
								var allSiblingsNotSelected = false;
								siblingNodes.forEach(function(node) {				
									if (!node.isNodeSelected) {
										allSiblingsNotSelected = true;	
										return;
									}
								});

								return !allSiblingsNotSelected;																
							}

							//To check all child nodes of the parent node are selected.
							$scope.isAllSiblingsInTestFrame = function(scope,test) {
								var allSiblingsNotExistInTestFrame=false;
								scope.$parentNodeScope.node.nodes.forEach(function(node) {										
									if(!$scope.isNodeInTestFrame(node)){
										allSiblingsNotExistInTestFrame = true;
										return;
									} 																	
								});	

								return !allSiblingsNotExistInTestFrame;																
							}							


							//To add a node to questionFolderNode array.
							$scope.addingNodeInQuestionFolderNodeArray = function(node,test) {		
								var existInquestionFolderNode;
								for (var i = 0; i < test.questionFolderNode.length; i++) {
									if (test.questionFolderNode[i].guid == node.guid) {
										existInquestionFolderNode =true;
										break;
									}
								}
								if(!existInquestionFolderNode){
									test.questionFolderNode.push(node);	
								}		
							}



							$scope.checkAllSibblingNodeInTestFrame = function(scope, test) {								
								scope.node.existInTestframe = true;								
								if($scope.isAllSiblingsSelected(scope.$parentNodeScope.node.nodes)){
									scope.$parentNodeScope.node.showEditQuestionIcon = true;
									scope.$parentNodeScope.node.showTestWizardIcon = true; 
									scope.$parentNodeScope.node.isNodeSelected = true;	
									if($scope.isAllSiblingsInTestFrame(scope,test)){
										var existInquestionFolderNode;
										scope.$parentNodeScope.node.showEditQuestionIcon = false;
										$scope.addingNodeInQuestionFolderNodeArray(scope.$parentNodeScope.node,test);
									}
									$scope.addingNodeInSelectedNodesArray(scope.$parentNodeScope.node,test);
								}
							}
							
							$scope.addTopicQuestionsToTestFrameTab = function (test,destIndex,eventType,selectedScopeNode,isAnyNodeAlreadyAdded) {	

								test.questionFolderNode.push(selectedScopeNode);								
								$rootScope.blockPage.start();											
								selectedScopeNode.showEditQuestionIcon = false;
								var questionFolder = selectedScopeNode;

								getQuestions(
										questionFolder,
										function(response,
												questionFolder) {
											response.forEach(function(selectedQuestion){							
												selectedQuestion.parentId = questionFolder.guid;
											});
											if(!isAnyNodeAlreadyAdded){
												test.questions.forEach(function(testQuestion){												
													response.forEach(function(selectedQuestion){														
														if(testQuestion.guid == selectedQuestion.guid)
														{
															isAnyNodeAlreadyAdded = true;
															return;
														}														
													})
													if(isAnyNodeAlreadyAdded == true)
													{
														return;
													}
												})
											}

											$rootScope.$broadcast("handleBroadcast_AddQuestionsToTest",response,questionFolder,isAnyNodeAlreadyAdded);

											$scope.editQuestionMode = false;

											if (!response.length) {
												SharedTabService.addErrorMessage(questionFolder.title, e8msg.warning.emptyFolder);
												questionFolder.showEditQuestionIcon = true;
												for (var j = 0; j < test.questionFolderNode.length; j++) {
													if (test.questionFolderNode[j].guid == questionFolder.guid) {
														test.questionFolderNode.splice(j, 1);
													}
												}
											}		


										});

								$scope.updateTopicChildNodesStatus(selectedScopeNode);
							};
							
							$scope.updateTopicChildNodesStatus = function(selectedNode){								
								if(selectedNode.nodes){
									selectedNode.nodes.forEach(function(node) {		
											setTestQuestionNodeStatus(node);
											$scope.addingNodeInSelectedNodesArray(node);
										});						

									};	

							};				
							
							$scope.showDuplicateQuestionsAlert = function(){
	                            	if($scope.isAnyNodeAlreadyAdded){
	                            		$scope.IsConfirmation = false;
	                                    $scope.message = "Question(s) already added to the test, cannot be added again.";
	                                    $modal.open(confirmObject).result.then(function(ok) {
											if(ok) {
												$scope.isAnyNodeAlreadyAdded = false;
											}
										});
	                            	}
							}
							
							$scope.addQuestionsToTestTab = function (test, destIndex, eventType, isAnyNodeAlreadyAdded) {
							    var httpReqCount = 0,
                                    httpReqCompletedCount = 0,
                                    uniqueNodeCount = 0;
//							    if(scope.showEditQuestionIcon)
								for (var i = 0; i < $scope.selectedNodes.length; i++) {
									if($scope.selectedNodes[i].nodeType != EnumService.NODE_TYPE.question){
									test.questionFolderNode.push($scope.selectedNodes[i]);
									}
									$scope.getRemoveChildNodesFromQuestionFolderNodes($scope.selectedNodes[i], test);
									if ($scope.selectedNodes[i].showEditQuestionIcon) {
										uniqueNodeCount++;
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
                                                    $rootScope.$broadcast("dropQuestion",$scope.selectedNodes[i], destIndex,"QuestionBank", eventType);
                                                    $scope.selectedNodes[i].existInTestframe = true;
                                            }    

										} else if ($scope.selectedNodes[i].nodeType === EnumService.NODE_TYPE.chapter
												|| $scope.selectedNodes[i].nodeType === EnumService.NODE_TYPE.topic) {
											
									        httpReqCount++;
											$rootScope.blockPage.start();
											
											$scope.selectedNodes[i].showEditQuestionIcon = false;
											var questionFolder = $scope.selectedNodes[i];
											getQuestions(
													questionFolder,
													function(response,
															questionFolder) {
														if(!isAnyNodeAlreadyAdded)
														{
															test.questions.forEach(function(testQuestion){
																response.forEach(function(selectedQuestion){
																	if(testQuestion.guid == selectedQuestion.guid)
																	{
																		isAnyNodeAlreadyAdded = true;
																		return;
																	}
																})
																if(isAnyNodeAlreadyAdded == true)
																{
																	return;
																}
															})
														}
														$rootScope
																.$broadcast(
																		"handleBroadcast_AddQuestionsToTest",
																		response,
																		questionFolder,
																		isAnyNodeAlreadyAdded);
														$scope.editQuestionMode = false;
														httpReqCompletedCount++;
														if (!response.length) {
														    SharedTabService.addErrorMessage(questionFolder.title, e8msg.warning.emptyFolder);
														    questionFolder.showEditQuestionIcon = true;
														    for (var j = 0; j < test.questionFolderNode.length; j++) {
														        if (test.questionFolderNode[j].guid == questionFolder.guid) {
														            test.questionFolderNode.splice(j, 1);
														        }
														    }
														}

														if (httpReqCount == httpReqCompletedCount) {
															if(SharedTabService.errorMessages.length > 0)
																SharedTabService.TestWizardErrorPopup_Open();
															//$scope.showDuplicateQuestionsAlert();
														}
													});
										}

									}
								}
								if((uniqueNodeCount == 0 && $scope.selectedNodes.length !=0) || httpReqCount == 0){
									$scope.showDuplicateQuestionsAlert();
								}
							}
							

							$scope.getRemoveChildNodesFromQuestionFolderNodes = function(Node, test) {
								for (var i = 0; i < $scope.expandedNodes.length; i++) {
									if ($scope.expandedNodes[i].parentId==Node.guid) {
										for (var j = 0; j < test.questionFolderNode.length; j++) {
											if(test.questionFolderNode[j].guid == $scope.expandedNodes[i].guid){
												test.questionFolderNode.splice(j, 1);
											}
										}
										$scope.getRemoveChildNodesFromQuestionFolderNodes($scope.expandedNodes[i], test);
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
												if(tab.questionFolderNode.length > 0 || tab.criterias.length > 0){
													for (var i = 0; i < $scope.selectedNodes.length; i++) {
														$scope.selectedNodes[i].isNodeSelected = false;
														$scope.selectedNodes[i].showTestWizardIcon = false;
														$scope.selectedNodes[i].showEditQuestionIcon = false;
													}
													$scope.selectedNodes=[];
													for (var i = 0; i < $scope.expandedNodes.length; i++) {
														for (var j = 0; j < tab.questionFolderNode.length; j++) {
															if($scope.expandedNodes[i].guid == tab.questionFolderNode[j].guid){
																$scope.expandedNodes[i].isNodeSelected=true;
																$scope.expandedNodes[i].showTestWizardIcon=true;
																$scope.expandedNodes[i].showEditQuestionIcon=false;
																$scope.selectedNodes.push($scope.expandedNodes[i]);
															}
														}
														for (var k = 0; k < tab.criterias.length; k++) {
															if($scope.expandedNodes[i].guid == tab.criterias[k].folderId){
																$scope.expandedNodes[i].isNodeSelected=true;
																$scope.expandedNodes[i].showTestWizardIcon=false;
																$scope.expandedNodes[i].showEditQuestionIcon=true;
																$scope.selectedNodes.push($scope.expandedNodes[i]);
															}
														}
													}
												}else if (!$scope.createTestWizardMode && !$scope.editQuestionMode){
													for (var i = 0; i < $scope.selectedNodes.length; i++) {
														$scope.selectedNodes[i].isNodeSelected = false;
														$scope.selectedNodes[i].showTestWizardIcon = false;
														$scope.selectedNodes[i].showEditQuestionIcon = false;
													}
													 $scope.selectedNodes=[];
												}
												
												for (var i = 0; i < $scope.questions.length; i++) {
													$scope.questions[i].isNodeSelected = false;
													$scope.questions[i].showEditQuestionIcon = false;
													$scope.questions[i].existInTestframe = false;
													for (var j = 0; j < tab.questions.length; j++) {
														if ($scope.questions[i].guid === tab.questions[j].guid) {
															$scope.questions[i].isNodeSelected = true;
															$scope.questions[i].existInTestframe = true;
															$scope.selectedNodes.push($scope.questions[i]);
															break;
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
										if ($scope.selectedNodes[i].guid == node.guid) {	
											setDeletedTestQuestionNodeStatus(node);
												$scope.selectedNodes.splice(i, 1);													
												$scope.setDeselectedNodeState(node);												
												break;
											}									
								}
									
								$scope.updateParentNodeStatus(node);
							};			
							
							//to set the status of the question node in question bank tab,if the question node deleted in test frame.
							var setDeletedTestQuestionNodeStatus=function(node){										
								node.existInTestframe=false;
								node.isNodeSelected = false;
								node.showEditQuestionIcon = false;
								node.showTestWizardIcon = false;													
							}
							
							
							//to set the status of the hierarchical parent node in question bank tab,if the question node deleted in test frame.
							var updateHigherParentNodesStatus=function(parentId){		
								var parentExistInSelectNodes=false;
								var nodeIndex=0;
								for (var j = 0; j < $scope.selectedNodes.length; j++) {
									if ($scope.selectedNodes[j].guid == parentId) {
										$scope.selectedNodes[j].isNodeSelected = false ;
										$scope.selectedNodes[j].showEditQuestionIcon = false;
										$scope.selectedNodes[j].showTestWizardIcon = false;		
										parentExistInSelectNodes = true;
										break;
									}
									nodeIndex++;
								}								
								
								if(parentExistInSelectNodes){
									var parentNode = $scope.selectedNodes[nodeIndex];
									$scope.selectedNodes.splice(nodeIndex, 1);
									updateHigherParentNodesStatus(parentNode.parentId);	
								}
											
							}
							
							//#To check whether the any parent node of selected node is used for test creation(edit question/wizard)  
							$scope.updateParentNodeStatus = function(deselectedNode){	
								updateHigherParentNodesStatus(deselectedNode.parentId);
								var test = SharedTabService.tests[SharedTabService.currentTabIndex];
								for (var j = 0; j < test.questionFolderNode.length; j++) {
										if (test.questionFolderNode[j].guid == deselectedNode.parentId) {
											test.questionFolderNode.splice(j, 1);
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
		                                        $scope.questions[i].existInTestframe = false;
		                                        break;
	                                    	}
                                }
							}
						
							//Handling the Broadcast event when questions are selected to wizard to create a test
							// here deselect the question nodes which are present in test creation frame.
							$scope.$on('handleBroadcast_questionDeselect', function() {
								$scope.selectedNodes.forEach(function(node) {
									if(node.nodes){
										node.nodes.forEach(function(question) {
											if($scope.isNodeInTestFrame(question)){
												question.existInTestframe = true;
												question.isNodeSelected = true;
												question.showEditQuestionIcon = false;
												question.showTestWizardIcon = false;
											}
										})
									}
								})

							});
						
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
								$scope.isAddQstBankClicked=true;
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
												},
												parentScope : function() {
													return $scope;
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
							$scope.searchedContainerId="";
							var searchedQuestionTypes=[];
							var bookContainersArray=[];
							$scope.allContainers=[];
							$scope.showWaitingForAutoComplete=false;
							$scope.selectedBookid="";
							
							$scope.selectBook = function(node) {
								/*if(node.nodeType==EnumService.NODE_TYPE.userQuestionFolder){
                                    return false;
                                }*/
								var isBookSelected=false;
								var bookIndex=0
								var existingBookIndex=-1;

								$scope.selectedBooks.forEach(function(book){
									if(book.guid==node.guid){
										isBookSelected=true;
										existingBookIndex=bookIndex;
									}
									bookIndex++;
								});
								
								if(isBookSelected){
									node.isNodeSelected = false;
									$scope.selectedBooks.splice(existingBookIndex, 1);
									removeBookContainers(node.guid);
								}else{
									$scope.selectedBookid=node.guid;
									node.isNodeSelected = true;
									$scope.selectedBooks.push(node);
									ContainerService.getAllContainers(node.guid,
											function(response) {
										if(response==null){
											CommonService.showErrorMessage(e8msg.error.cantFetchNodes)
				                			return;
										}
												var bookContainers={};
												bookContainers["bookid"]=node.guid;
												bookContainers["containers"]=response;
												bookContainersArray.push(bookContainers);
												fillBookContainers();
											});
								}
							}
							
							String.prototype.capitalizeFirstLetter = function() {
							    return this.charAt(0).toUpperCase() + this.slice(1);
							}
							
							var fillBookContainers=function(){
								$scope.allContainers=[];
								bookContainersArray.forEach(function(book){
									book.containers.forEach(function(container){
										$scope.allContainers.push(container)	
									});
								});
								$scope.showWaitingForAutoComplete=false;
								if($scope.selectedContainer!=undefined){
									$scope.selectedContainer=$scope.selectedContainer.capitalizeFirstLetter();	
								}
							}
							
							var removeBookContainers=function(bookid){
								var i=0;
								bookContainersArray.forEach(function(book){
									if(book.bookid==bookid){
										bookContainersArray.splice(i,1)
									}
									i++;
								})
								fillBookContainers();
							}

							$scope.validateSearch = function(){
								if($scope.showAddFolderPanel) {
	                                   return;
	                               }
								if($scope.selectedBooks.length == 0){
									$scope.isSimpleSearchClicked=true;
									$scope.showWaitingForAutoComplete=false;
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
								if($scope.selectedContainer=="" || $scope.selectedContainer.guid == undefined ){
									return;
								}
								$scope.showContainer();
							}
							
							$scope.showContainerOnEnter = function(event) {
								$(".dropdown-menu")
								.addClass("autocompleteList");								
								
				                if(event.which === 40){
				                    $('ul.dropdown-menu').scrollTop ( ($('ul.dropdown-menu li.active').index() ) * 25);				                    										
				                }
				                if(event.which === 38){
				                    $('ul.dropdown-menu').scrollTop ( ($('ul.dropdown-menu li.active').index() ) * 25);
				                    										
				                }
								if (event.keyCode != 13 ){
									var isContainersLoaded=false;
									bookContainersArray.forEach(function(book){
										if(book.bookid == $scope.selectedBookid){
											isContainersLoaded=true;
										}
									});
									if(!isContainersLoaded){
										$scope.showWaitingForAutoComplete=true;	
									}
								}
								
								if($scope.selectedContainer=="" || $scope.selectedContainer.guid== undefined){
									return;
								}
								
								if (event.keyCode === 13) {
										$scope.showContainer();
								}
							}
							
							$scope.parentNode;
							var parentContainers=[];
							$scope.showContainer = function(){
								$scope.showAdvancedSearch = false;
								$scope.expandedNodes=[];
								$scope.selectedNodes=[];
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
																searchedDiscipline["isHttpReqCompleted"]=true;
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
									parentContainers=[];
									$scope.getParentContainers(parentContainerid,parentContainers)
									parentContainers.reverse();
									var containerNode = $scope.disciplines[0].nodes[0];
									parentContainers
											.forEach(function(container) {
												container.template = "nodes_renderer.html";
												container.showEditQuestionIcon=false;
												container.showTestWizardIcon=false;
												container.nodeType = "chapter";
												container.isCollapsed=false;
												container.isHttpReqCompleted = true;
												containerNode["nodes"] = [jQuery.extend(true,
														{}, container)];
												containerNode = containerNode.nodes[0];
												$scope.expandedNodes=$scope.expandedNodes.concat(containerNode);
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
									ContainerService.containerNodes($scope.bookID,searchedContainer.guid,getSearchCriteria(false), true, function(response){
										if(response == null){
											CommonService.showErrorMessage(e8msg.error.cantFetchNodes)
					            			return;
										}
										if(response.length > 0){
											searchedContainer.template = "nodes_renderer.html";
											searchedContainer.showEditQuestionIcon=false;
											searchedContainer.showTestWizardIcon=false;
											searchedContainer.nodeType = "topic";
											searchedContainer.isCollapsed=true;
											searchedContainer.isHttpReqCompleted = true;
											$scope.parentNode["nodes"] = [ jQuery.extend(true,
													{}, searchedContainer) ];
											$scope.expandedNodes=$scope.expandedNodes.concat($scope.parentNode.nodes);
											$rootScope.blockPage.stop();
										}else{
											$scope.parentNode["nodes"]=[];
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
									searchedContainer.isHttpReqCompleted = true;
									$scope.parentNode["nodes"] = [ jQuery.extend(true,
											{}, searchedContainer) ];
									$scope.expandedNodes=$scope.expandedNodes.concat($scope.parentNode.nodes);
								}
								
							}
							
							$scope.getParentContainers = function(containerid, parentContainers) {
								var parentContainerid = "";
								var hasParent = false;
								$scope.allContainers
										.forEach(function(container) {
											if (container.guid == containerid) {
												parentContainers.push(container)
												if (container.parentId != null&& container.parentId != "") {
													parentContainerid = container.parentId;
													hasParent = true;
												}
											}
										});

								if (hasParent) {
									$scope.getParentContainers(parentContainerid, parentContainers)
								}
							}
							
							$scope.showAdvancedSearch = false;
							$scope.selectedQuestionTypes = [];
							$scope.isSaveDisabled=true;
							$scope.isAdvancedSearchClicked=false;
							$scope.isSimpleSearchClicked=false;
							$scope.isAddQstBankClicked=false;
							
							$scope.openAdvancedSearch = function() {
								$scope.isAdvancedSearchClicked=true;
								if($scope.validateSearch()){
									if (!$scope.showAdvancedSearch) {
										$scope.showAdvancedSearch = true;
										$scope.isAdvancedSearchClicked=false;
									} else {
										$scope.isAdvancedSearchClicked=false;
										$scope.showAdvancedSearch = false;
									}
									$scope.enableDisableSearch();
								}
							}
							
							$scope.closeAdvancedSearch = function() {
								$scope.showAdvancedSearch = false;
								$scope.selectedQuestionTypes=[];
								searchedQuestionTypes.forEach(function(qt){
									$scope.selectedQuestionTypes.push(qt);
								});
								
								if($scope.isAdvancedSearchMode){
									angular.copy(searchedMetadataValues,$scope.metadataValues)
								}else{
									$scope.metadataValues = {
											"Difficulty":[]
									};
								}
								$scope.enableDisableSearch();
							}
							
							$scope.isThisQuizTypeSelected = function(questionType){
								var index = $scope.selectedQuestionTypes.indexOf(questionType);
								if (index > -1 ) {
									return true;
								}else{
									return false;
								}
							}
							
							$scope.toggleQuestiontypeSelection = function(
									questionType) {

								var index = $scope.selectedQuestionTypes
										.indexOf(questionType);
								if (index > -1) {
									$scope.selectedQuestionTypes.splice(index,1);
								} else {
									$scope.selectedQuestionTypes.push(questionType);
								}
								$scope.enableDisableSearch();
							}
							
							$scope.getSearchCriteriaSelections = function(){
								if(selectedQuestionTypesToShow.length!=0 && selectedMetadataTypesToShow.length==0){
									return selectedQuestionTypesToShow.toString();	
								}else if(selectedQuestionTypesToShow.length==0 && selectedMetadataTypesToShow.length!=0){
									return selectedMetadataTypesToShow.toString();	
								}else if(selectedQuestionTypesToShow.length!=0 && selectedMetadataTypesToShow.length!=0){
									return selectedQuestionTypesToShow.toString()+","+selectedMetadataTypesToShow.toString();
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
							
							var selectedQuestionTypesToShow=[];
							var selectedMetadataTypesToShow=[];
							var searchedMetadataValues={
									"Difficulty":[]
							};
							$scope.searchBooksForQuestionTypes = function(node) {
								$scope.showAdvancedSearch = false;
								selectedQuestionTypesToShow=[];
								selectedMetadataTypesToShow=[];
								searchedQuestionTypes=[];
								if($scope.selectedBooks.length == 0){
									$scope.isSimpleSearchClicked=true;
									$scope.showWaitingForAutoComplete=false;
									$scope.selectedContainer="";
									$scope.selectedQuestionTypes=[];
									$scope.IsConfirmation = false;
									$scope.message = "Please select a question bank to search";
									$modal.open(confirmObject);
									return false;
								}
								$scope.selectedQuestionTypes.forEach(function(questionType){
									$scope.addQuestionTypesToShow(questionType);	
									searchedQuestionTypes.push(questionType)
								});
								
								var searchCriteria=getSearchCriteria(true);
								
								if($scope.selectedContainer!=undefined && $scope.selectedContainer!="" && $scope.selectedContainer.guid != undefined){
									$scope.isAdvancedSearchMode=true;
									$scope.showContainer();
								}
								else{
									$rootScope.blockPage.start();
									$scope.expandedNodes=[];
									var count = 0;
									var emptyBooks=0;
									var isErrorExists=false;
									
									$scope.selectedBooks.forEach(function(book){
										ContainerService.getQuestionTypeContainers(book.guid,searchCriteria,function(containers){
											if(containers==null){
												isErrorExists=true;
											}
											
											if(containers.length==0){
												emptyBooks = emptyBooks+1;
											}
											containers.forEach(function(container){
												container.isCollapsed=true;
												container.nodeType = "chapter";
												container.bookid = book.guid;
												container.isHttpReqCompleted = true;
											});
											$scope.expandedNodes=$scope.expandedNodes.concat(containers);
											book.isCollapsed=false;
											book.nodes=containers;
											if(count == 0){
												$scope.disciplines=[];
											}
											$scope.bookAddToDiscipline(book);
											count=count+1;
											if(count == $scope.selectedBooks.length){
												$rootScope.blockPage.stop();
												if(isErrorExists){
													CommonService.showErrorMessage(e8msg.error.cantFetchSelectedQuestionType)
												}
											}
											if(emptyBooks == $scope.selectedBooks.length){
												$rootScope.blockPage.stop();
												$scope.IsConfirmation = false;
												$scope.message = "No search results match your criteria, broaden your criteria, or select more question banks to search";
												$modal.open(confirmObject);
											}
											$scope.selectedNodes=[];
										});
									});	
								}
							}
							
							var getSearchCriteria=function(isFromAdvancedSearch){
								
								var searchCriteria="";
								if($scope.selectedQuestionTypes.toString()!=""){
									if($scope.getMetadataSearchCriteria().length>0){
										searchCriteria="QTyp="+$scope.selectedQuestionTypes.toString()+"&";	
									}else{
										searchCriteria="QTyp="+$scope.selectedQuestionTypes.toString();
									}
								}
								$scope.getMetadataSearchCriteria().forEach(function(metadata){
										searchCriteria=searchCriteria+metadata;
										if(isFromAdvancedSearch){
											$scope.addMetadataTypesToShow(metadata)	
										}
								});
								return searchCriteria;
							}

							$scope.addQuestionTypesToShow = function(quizTypes)
							{
								if(quizTypes=='ES'){
									selectedQuestionTypesToShow.push(" Essay") 
								}else if(quizTypes=='MR'){
									selectedQuestionTypesToShow.push(" Multiple Response")
								}else if(quizTypes=='MT'){
									selectedQuestionTypesToShow.push(" Matching")
								}else if(quizTypes=='MC'){
									selectedQuestionTypesToShow.push(" Multiple Choice")
								}else if(quizTypes=='TF'){
									selectedQuestionTypesToShow.push(" True False")
								}else if(quizTypes=='FIB'){
									selectedQuestionTypesToShow.push(" Fill in the Blanks")
								}
							}
							
							$scope.addMetadataTypesToShow = function(metadata)
							{
								if(metadata.indexOf(ShortMetadataEnum.DIFFICULTY)>-1){
									selectedMetadataTypesToShow.push(' Difficulty');
								}else if(metadata.indexOf(ShortMetadataEnum.TOPIC)>-1){
									selectedMetadataTypesToShow.push(' Topic');
								}else if(metadata.indexOf(ShortMetadataEnum.OBJECTIVE)>-1){
									selectedMetadataTypesToShow.push(' Objective');
								}else if(metadata.indexOf(ShortMetadataEnum.PAGEREFERENCE)>-1){
									selectedMetadataTypesToShow.push(' Page Reference');
								}else if(metadata.indexOf(ShortMetadataEnum.SKILL)>-1){
									selectedMetadataTypesToShow.push(' Skill');
								}else if(metadata.indexOf(ShortMetadataEnum.QUESTIONID)>-1){
									selectedMetadataTypesToShow.push(' Question ID');
								}
							}
							
							$scope.bookAddToDiscipline=function(book){
								$scope.isAdvancedSearchMode = true;
								angular.copy($scope.metadataValues,searchedMetadataValues);
								var isDesciplineExists=false;  
								var searchedDiscipline={};
								if($scope.disciplines.length==0){
									searchedDiscipline["item"] = book.discipline;
									searchedDiscipline["isCollapsed"]=false;
									searchedDiscipline["nodes"] = [book];
									searchedDiscipline["isHttpReqCompleted"] = true;
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
										searchedDiscipline["isHttpReqCompleted"] = true;
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
								$scope.isAdvancedSearchMode = false;
								$scope.isSearchMode = false;
								$scope.showAddFolderLink = false;
								$scope.selectedBooks=[];
								selectedQuestionTypesToShow=[];
								selectedMetadataTypesToShow=[];
								searchedQuestionTypes=[];
								bookContainersArray=[];
								$scope.allContainers=[];
								$scope.selectedBookid="";
								$scope.expandedNodes=[];
								$scope.selectedNodes=[];
								$scope.loadTree();
								searchedMetadataValues={
									"Difficulty":[]
								};
								$scope.metadataValues={
									"Difficulty":[]
								};
							}							
							
							$scope.$on('handleBroadcast_AddNewTest', function (handler, newTest, containerFolder, isEditMode, oldGuid, editedQuestions, editedMigratedQuestions, createdTab, testCreationFrameScope) {
								
								editedQuestions.forEach(function(editedQuestion) {
									editedQuestion.isQuestion = true;
									editedQuestion.questionXML = true;

									editedQuestion.nodeType = "question";

									editedQuestion.extendedMetadata = editedQuestion.extendedMetadata;
									
									var displayNodes = $("<div></div>");    
                                    QTI.BLOCKQUOTE.id = 0;
                                    QTI.play(editedQuestion.data,displayNodes, false,false,editedQuestion.quizType);                                
                                    editedQuestion.textHTML = displayNodes.html();
                                    
									editedQuestion.showEditQuestionIcon = false;
									editedQuestion.isNodeSelected = false;
									addToQuestionsArray(editedQuestion);
									editedQuestion.template = 'qb_questions_renderer.html';
									if($scope.yourQuestionsFolder == null) {
										$scope.disciplines.unshift({
											"item" : "Your Questions (user created)",
											"isCollapsed" : true	
										});	
										$scope.yourQuestionsFolder = $scope.disciplines[0];
										$scope.yourQuestionsFolder.isHttpReqCompleted = true;
									} else {					
										if($scope.yourQuestionsFolder.node){
                                            var userCreatedFoldersCount = $scope.yourQuestionsFolder.node.nodes.userFolderCount;
                                            editedQuestion.questnNumber = userCreatedFoldersCount;
                                            editedQuestion.questionType = "userCreatedQuestion";                                            
                                            $scope.yourQuestionsFolder.node.nodes.push(editedQuestion);    
                                        }
									}
								})				
								
								//this loop is to deselect the edited existing question.
								$.each( editedMigratedQuestions, function( key, value ) {											
											 for (var i = 0; i < $scope.selectedNodes.length; i++) {												 
											        if (value === $scope.selectedNodes[i].guid) {											        	
											            $scope.selectedNodes[i].showEditQuestionIcon = false;
											            $scope.selectedNodes[i].isNodeSelected = false;			
											            return true;
											        }
											    }											
											
								});						
								
								
								if (isEditMode) {
								    if (createdTab.isSaveAndClose) {
								        SharedTabService.closeTab(createdTab, testCreationFrameScope);
								        SharedTabService.removeMasterTest(createdTab);
								    } else {
								        SharedTabService.removeMasterTest(createdTab);
								        SharedTabService.addMasterTest(createdTab);
								    }
							        return false;
							    }
							    for (var i = 0; i < $scope.selectedNodes.length; i++) {
							        if (oldGuid === $scope.selectedNodes[i].guid) {
							            $scope.selectedNodes[i].showEditIcon = true;
							        }
							    }
							    TestService.getMetadata(newTest.guid, function (test) {
							    	if(test==null){
						        		 CommonService.showErrorMessage(e8msg.error.cantFetchMetadata);
						         		return;
						        	 }
							        test.nodeType = "test";
							        createdTab.metadata = TestService.getTestMetadata(test);
							        createdTab.treeNode = null;

							        if (createdTab.isSaveAndClose) {
							            SharedTabService.closeTab(createdTab, testCreationFrameScope);
							            SharedTabService.removeMasterTest(createdTab);
							        } else {
							            SharedTabService.removeMasterTest(createdTab);
							            SharedTabService.addMasterTest(createdTab);
							        }
							    });
							});

							$scope.userMetadata=[];
							
							$scope.getUserMetadata=function(){
                                UserService.userQuestionMetadata(function(userQuestionMetadata){
                                    $scope.metadataValues = {
                                            "Difficulty":[]
                                    };
                                    userQuestionMetadata.forEach(function(metadata){
                                        var userMetadataKeyValue={};
                                        if(metadata==MetadataEnum.DIFFICULTY){
                                            userMetadataKeyValue.key=ShortMetadataEnum.DIFFICULTY;
                                            userMetadataKeyValue.name='Difficulty';
                                            $scope.userMetadata.splice(0, 0, userMetadataKeyValue);
                                        }else if(metadata==MetadataEnum.TOPIC){
                                            userMetadataKeyValue.key=ShortMetadataEnum.TOPIC;
                                            userMetadataKeyValue.name='Topic';
                                            $scope.userMetadata.splice(1, 0, userMetadataKeyValue);
                                        }else if(metadata==MetadataEnum.OBJECTIVE){
                                            userMetadataKeyValue.key=ShortMetadataEnum.OBJECTIVE;
                                            userMetadataKeyValue.name='Objective';
                                            $scope.userMetadata.splice(2, 0, userMetadataKeyValue);
                                        }else if(metadata==MetadataEnum.PAGEREFERENCE){
                                            userMetadataKeyValue.key=ShortMetadataEnum.PAGEREFERENCE;
                                            userMetadataKeyValue.name='Page Reference';
                                            $scope.userMetadata.splice(3, 0, userMetadataKeyValue);
                                        }else if(metadata==MetadataEnum.SKILL){
                                            userMetadataKeyValue.key=ShortMetadataEnum.SKILL;
                                            userMetadataKeyValue.name='Skill';
                                            $scope.userMetadata.splice(4, 0, userMetadataKeyValue);
                                        }else if(metadata==MetadataEnum.QUESTIONID){
                                            userMetadataKeyValue.key=ShortMetadataEnum.QUESTIONID;
                                            userMetadataKeyValue.name='Question ID';
                                            $scope.userMetadata.splice(5, 0, userMetadataKeyValue);
                                        }
                                    });
                                });
                            }
							
							$scope.getUserMetadata();
							
							$scope.isAnyMetadataSelected=function(){
								if($scope.userMetadata.length>0){
									return true;
								}else{
									return false;
								}
							}
							
							$scope.difficultyLevels = [{name:'Easy',value:'Esy'},
								                       {name:'Moderate',value:'Mod'},
								                       {name:'Difficult',value:'Dif'}
								                      ];
							
							$scope.getMetadataSearchCriteria=function(){
								var metadataSearchCriteria=[];
								if($scope.metadataValues.Difficulty.length>0){
									appendMetadataSearchCriteria(metadataSearchCriteria,ShortMetadataEnum.DIFFICULTY,$scope.metadataValues.Difficulty.toString());
								}
								if($scope.metadataValues.Topk!=undefined && $scope.metadataValues.Topk!=""){
									appendMetadataSearchCriteria(metadataSearchCriteria,ShortMetadataEnum.TOPIC,encodeURIComponent($scope.metadataValues.Topk));
								}
								if($scope.metadataValues.Objt!=undefined && $scope.metadataValues.Objt!=""){
									appendMetadataSearchCriteria(metadataSearchCriteria,ShortMetadataEnum.OBJECTIVE,encodeURIComponent($scope.metadataValues.Objt));
								}
								if($scope.metadataValues.PRef!=undefined && $scope.metadataValues.PRef!=""){
									appendMetadataSearchCriteria(metadataSearchCriteria,ShortMetadataEnum.PAGEREFERENCE,encodeURIComponent($scope.metadataValues.PRef));
								}
								if($scope.metadataValues.Skil!=undefined && $scope.metadataValues.Skil!=""){
									appendMetadataSearchCriteria(metadataSearchCriteria,ShortMetadataEnum.SKILL,encodeURIComponent($scope.metadataValues.Skil));
								}
								if($scope.metadataValues.QnId!=undefined && $scope.metadataValues.QnId!=""){
									appendMetadataSearchCriteria(metadataSearchCriteria,ShortMetadataEnum.QUESTIONID,encodeURIComponent($scope.metadataValues.QnId));
								}
								
								return metadataSearchCriteria;
							}
							
							var appendMetadataSearchCriteria = function(metadataSearchCriteria,key,Value){
								if(metadataSearchCriteria.length==0){
									metadataSearchCriteria.push(key+"="+Value);								
								}else{
									metadataSearchCriteria.push("&"+key+"="+Value);
								}
							}
							$scope.isGivenLevelSelected = function(level){
								if($scope.metadataValues.Difficulty.indexOf(level)>-1){
									return true;
								}else{
									return false;
								}
							}
							
							$scope.selectLevel = function(level){
								var itemIndex=$scope.metadataValues.Difficulty.indexOf(level);
								if(itemIndex>-1){
									$scope.metadataValues.Difficulty.splice(itemIndex,1);
								}else{
									$scope.metadataValues.Difficulty.push(level);	
								}
								$scope.enableDisableSearch();
							}
							
							$scope.enableDisableSearch = function(obj){
								if(searchedQuestionTypes.length>0 || $scope.selectedQuestionTypes.length > 0 || $scope.getMetadataSearchCriteria().length > 0){
									$scope.isSaveDisabled=false;
								}else{
									$scope.isSaveDisabled=true;
								}
							}
							
							var MetadataEnum={
									'DIFFICULTY':'Difficulty',
									'TOPIC':'Topic',
									'OBJECTIVE':'Objective',
									'PAGEREFERENCE':'PageReference',
									'SKILL':'Skill',
									'QUESTIONID':'QuestionId'
							}
							
							var ShortMetadataEnum={
									'DIFFICULTY':'Diff',
									'TOPIC':'Topk',
									'OBJECTIVE':'Objt',
									'PAGEREFERENCE':'PRef',
									'SKILL':'Skil',
									'QUESTIONID':'QnId'
							}
							
						} ]);