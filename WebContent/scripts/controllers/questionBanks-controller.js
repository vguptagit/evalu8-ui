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
							
							//To remove a node from questionFolderNode array.
							var removeNodeInquestionFolderNodeArray = function(questionFolder) {		
								var activeTest = SharedTabService.tests[SharedTabService.currentTabIndex];
								for (var j = 0; j < activeTest.questionFolderNode.length; j++) {
									if (activeTest.questionFolderNode[j].guid == questionFolder.parentId) {										
										$scope.removeNodeFromSelectedNodes(activeTest.questionFolderNode[j]);											
										removeNodeByIndex(activeTest.questionFolderNode,j);
										break;
									}
								}
							}
							
							//remove a node from array by index.
							var removeNodeByIndex = function(nodes,index) {
								nodes.splice(index, 1);
							}
							
							//remove a node from array by ID.
							var removeNodeByID = function(nodes,nodeID) {
								for (var j = 0; j < nodes.length; j++) {
									if (nodes[j].guid == nodeID) {		
										removeNodeByIndex(nodes,j);
									}
								}
							}
							
							//remove a node from array by ID.
							var addNodeIdToArray = function(nodes,nodeID) {
								if(!isNodeInArray(nodes,nodeID)){
									nodes.push(nodeID);
								}
							}
							
							//To add a node to an array.
							var addingNodeToArray = function(nodes,node) {								
								if(!isNodeInArray(nodes,node.guid)){
									nodes.push(node);
								}			
							}
							
							//To check the question node is present in  array.
							var isNodeInArray = function(nodes,nodeID) {
								var isNodeUsed=false;
								for (var j = 0; j < nodes.length; j++) {
									if (nodes[j].guid == nodeID) {		
										isNodeUsed=true;
										break;
									}
								}
								return isNodeUsed;								
							}
							
							
							
							//To remove a node from selectedNodes array.
							var removeNodeFromSelectedNodesByID = function(nodeID) {
								for (var j = 0; j < $scope.selectedNodes.length; j++) {
									if (nodeID === $scope.selectedNodes[j].guid) {
										$scope.selectedNodes[j].showEditQuestionIcon = false;
										$scope.selectedNodes[j].showTestWizardIcon = false; 
							            $scope.selectedNodes[j].isNodeSelected = false;													          
							            $scope.selectedNodes[j].existInTestframe = false;
							            removeNodeByIndex($scope.selectedNodes,j);										
										break;
									}
								}						
							}
							
							//To check all questions of topic are avialable in test frame.
							var isAllTopicQuestionsInTestFrame = function(node) {
								var isNodeUsed=false;
								var activeTest = SharedTabService.tests[SharedTabService.currentTabIndex];
								for (var i = 0; i < node.questionBindings.length; i++) {
									isNodeUsed=false;
									for (var j = 0; j < activeTest.questions.length; j++) {
										if(activeTest.questions[j].guid == node.questionBindings[i]){
											isNodeUsed=true;
											break;
										}
									}
									if(!isNodeUsed){
										isNodeUsed=false;
										break;																			
									}	
								}
								
								return isNodeUsed;	
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

							$scope.getBooks = function(discipline, callback) {

								if (!discipline.collapsed) {
									discipline.collapse();
								} else {
									discipline.expand();
									
									if($scope.isSearchMode){
										return;
									}

									var ep = evalu8config.apiUrl
											+ "/books?discipline="
											+ discipline.node.item
											+ "&userBooks=true";

									HttpService.get(ep).success(function(response) {
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
                                                var test = SharedTabService.tests[SharedTabService.currentTabIndex];     
                                                if(test.criterias.length > 0){
                                                	for (var j = 0; j < test.criterias.length; j++) {
                                                		if (test.criterias[j].treeNode.guid == item.guid) {
                                                			item.isNodeSelected = true;
                                                			item.showTestWizardIcon = false;
                                                			item.showEditQuestionIcon = true;
                                                			item.existInTestframe= true;
                                                			$scope.selectedNodes.push(item);
                                                		}
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
								// commented code would be deleted or used while implementing tab switch use case for wizard.
								/*isChildNodeUsed=false;
                                $scope.selectedNodes.forEach(function(selectedNode){
                                	if(!isChildNodeUsed){
                                        $scope.isChildNodeUsed(selectedNode, tab)
                                    }
                                });
                                
                                if(isChildNodeUsed){
                                    SharedTabService.addErrorMessage(childNodesUsedForTestCreation,SharedTabService.errorMessageEnum.TopicInChapterIsAlreadyAdded);
                                    SharedTabService.TestWizardErrorPopup_Open();
                                    return false;    
                                }*/
                                if( eventType == "clickEvnt"){
									$scope.addWizardToTestFrameTab(currentNode, currentNode.node, tab);
								}else{
								var httpReqCount = 0,
                                    httpReqCompletedCount = 0;
								if (currentNode.node.nodes && currentNode.node.isCollapsed) {
								    angular.forEach(currentNode.node.nodes, function (item) {
								        item.showTestWizardIcon = false;
								        item.showEditQuestionIcon = false;
								        item.isNodeSelected = false;
								        for (var i = 0; i < $scope.selectedNodes.length; i++) {
								            if (item.guid === $scope.selectedNodes[i].guid) {
								                $scope.selectedNodes.splice(i, 1);
								                break;
								            }
								        }
								    })
								}

								for (var i = 0; i < $scope.selectedNodes.length; i++) {
								    currentNode = $scope.selectedNodes[i];
								    if (currentNode.nodes && !currentNode.isCollapsed) {
								        var newCriteria = new SharedTabService.Criteria();
								        newCriteria.totalQuestions = 0;
								        newCriteria.folderId = currentNode.guid;
								        newCriteria.treeNode = currentNode;
								        $scope.expandedNodes.push(currentNode);
								        SharedTabService.tests[SharedTabService.currentTabIndex].criterias.push(newCriteria);
								        currentNode.showTestWizardIcon = false;
								        continue;
								    }
									if (currentNode.showTestWizardIcon) {
									    httpReqCount++;
									    currentNode.showTestWizardIcon = false;
									    $rootScope.blockPage.start();
										getQuestions(
												currentNode,
												function (response, currentNode) {
												    try {
												        if (response.length) {
												        	httpReqCompletedCount++;
												            $rootScope.$broadcast(
																	        "handleBroadcast_createTestWizardCriteria",
																	        response,
																	        currentNode);
												        } else {
												            SharedTabService.addErrorMessage(currentNode.title, e8msg.warning.emptyFolder);
												            currentNode.showTestWizardIcon = true;
												            if(currentNode.nodes){
												            	$scope.updateEmptyNodeStatus(currentNode);
												            }
												        }

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
							
							function ShowIconsForChildren(currentNode){
								currentNode.nodes.forEach(function(node) {
									node.isNodeSelected = true;
									node.showTestWizardIcon = false;
									node.showEditQuestionIcon = true;
									if(node.nodeType != "question"){
										node.existInTestframe = true;
									}
									if(node.nodes){
										ShowIconsForChildren(node);
									}
								})
							}
							
							$scope.addWizardToTestFrameTab = function(scope, currentNode, test){
								var httpReqCount = 0,
                                httpReqCompletedCount = 0;
								currentNode.showTestWizardIcon = false;
								currentNode.existInTestframe = true;
							//to enable the question edit icon in the next tab on clicking wizard icon if all the questions of the current node is already added to the test creation frame.	
								if(!currentNode.showEditQuestionIcon){
									currentNode.showEditQuestionIcon = true;
								}
								if(currentNode.nodes){
									ShowIconsForChildren(currentNode);
							}
							    $rootScope.blockPage.start();
								getQuestions(
										currentNode,
										function (response, currentNode) {
										    try {
										    	
										        if (response.length) {
										        	httpReqCompletedCount++;	
										            $rootScope.$broadcast(
															        "handleBroadcast_createTestWizardCriteria",
															        response,
															        currentNode);
										            $scope.checkSiblingTopicSelectionForWizard(scope,test);
										        } else {
										            SharedTabService.addErrorMessage(currentNode.title, e8msg.warning.emptyFolder);
										            currentNode.showTestWizardIcon = true;
										            if(currentNode.nodes){
										            	$scope.updateEmptyNodeStatus(currentNode);
										            }
										                                                                   
										        }

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
							
							//to set the status of the empty chapter/topic node,if the chapter/topic node does't contains questions.
							$scope.updateEmptyNodeStatus = function(node){
								node.nodes.forEach(function(node) {
									if (node.questionBindings == 0) {
										node.showTestWizardIcon = true;
									}
									if(node.nodes){
										$scope.updateEmptyNodeStatus(node);
									}
								})
							}
							
							//to set the status of the chapter/topic node,if the chapter/topic node present in test frame.
							var setTestNodeStatus=function(item){								
								item.existInTestframe=true;
								item.isNodeSelected = true;
								item.showEditQuestionIcon = false;
								item.showTestWizardIcon = true;													
							}
							
							//to change the status of the topic/chapter question node, when we expand a chapter/topic.
							var setNodeStatus=function(item,currentNode){								
								
								//change the status of node, if parent node is selected.
								if(currentNode.node.isNodeSelected){
									item.isNodeSelected = currentNode.node.isNodeSelected;
									item.showEditQuestionIcon = currentNode.node.showEditQuestionIcon;
									item.showTestWizardIcon = currentNode.node.showTestWizardIcon;
									item.existInTestframe = currentNode.node.existInTestframe;
								}
								
								item.parentId = currentNode.node.guid;
								var test = SharedTabService.tests[SharedTabService.currentTabIndex];
								//change the status of node, if node is present in test frame.
								if($scope.isNodeInTestFrame(item)){
									setTestNodeStatus(item);												
								}else if(isAllTopicQuestionsInTestFrame(item)){
									setTestNodeStatus(item);	
									$scope.addingNodeInQuestionFolderNodeArray(item,test);
								}
								
								 
								//change the status of node, if node is present in wizard frame.
								if($scope.isNodeUsedForWizard(item, test)){
									item.isNodeSelected = true;
									item.showEditQuestionIcon = true;
									item.showTestWizardIcon = false;
									
								}
								
							
								//add the node to $scope.selectedNodes array, if node is in selected status.
								if(item.isNodeSelected){													
									$scope.addingNodeInSelectedNodesArray(item);				
								}
							}
							
							//to change the status of the topic/chapter node, when we expand a chapter.
							var setFolderNodeStatus=function(item,currentNode){								
								
								//change the status of node, if parent node is selected.
								if(currentNode.node.isNodeSelected){
									item.isNodeSelected = currentNode.node.isNodeSelected;
									item.showEditQuestionIcon = currentNode.node.showEditQuestionIcon;
									item.showTestWizardIcon = currentNode.node.showTestWizardIcon;
									item.existInTestframe = currentNode.node.existInTestframe;
								}
								
								item.parentId = currentNode.node.guid;
								
								//change the status of node, if node is present in test frame.
								if($scope.isNodeInTestFrame(item)){
									setTestNodeStatus(item);												
								}
								
								var test = SharedTabService.tests[SharedTabService.currentTabIndex]; 
								//change the status of node, if node is present in wizard frame.
								if($scope.isNodeUsedForWizard(item, test)){
									item.isNodeSelected = true;
									item.showEditQuestionIcon = true;
									item.showTestWizardIcon = false;
									
								}
								
							
								//add the node to $scope.selectedNodes array, if node is in selected status.
								if(item.isNodeSelected){													
									$scope.addingNodeInSelectedNodesArray(item);	
								}
							}
							

							$scope.getNodesWithQuestion = function(currentNode) {
							    currentNode.node.isCollapsed = !currentNode.node.isCollapsed;
								$scope.bookID=currentNode.node.bookid;
								 
								if (!currentNode.collapsed) {
									currentNode.collapse();
									$(currentNode.$element).find(".captiondiv").removeClass('iconsChapterVisible');
									
									// Dont delete the below commented line, will delete after few days.
									/*currentNode.$element.children(1).removeClass('expandChapter');*/
								} else {
								    
									currentNode.expand();
									if (currentNode.node.nodes) {
									    for (var i = 0; i < currentNode.node.nodes.length; i++) {
									        if (!currentNode.node.nodes[i].isNodeSelected) {
									            currentNode.node.nodes[i].isNodeSelected = true;
									            currentNode.node.nodes[i].showTestWizardIcon = currentNode.node.showTestWizardIcon;
									            currentNode.node.nodes[i].showEditQuestionIcon = currentNode.node.showEditQuestionIcon;
									            $scope.selectedNodes.push(currentNode.node.nodes[i]);
									        }
									    }
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
													setNodeStatus(item,currentNode);													
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
								if(node.nodeType == EnumService.NODE_TYPE.question){
									activeTest.questions.forEach(function(usedNode) {
										if(usedNode.guid === node.guid){
											isNodeUsed=true;
											return;
										}
									});
								}else{
									activeTest.questionFolderNode.forEach(function(usedNode) {
										if(usedNode.guid === node.guid){
											isNodeUsed=true;
											return;
										}
									});
								}
								
								
								
								return isNodeUsed;									
							}							

							//To remove a node from selectedNodes array.
							$scope.removeNodeFromSelectedNodes = function(node) {
								for (var j = 0; j < $scope.selectedNodes.length; j++) {
									if (node.guid === $scope.selectedNodes[j].guid) {
										$scope.selectedNodes[j].showEditQuestionIcon = false;
										$scope.selectedNodes[j].showTestWizardIcon = false; 
							            $scope.selectedNodes[j].isNodeSelected = false;													          
							            $scope.selectedNodes[j].existInTestframe = false;
							            removeNodeByIndex($scope.selectedNodes,j);										
										break;
									}
								}						
							}
							//To change the selection status of the parent node of a node.
							$scope.checkSiblingSelection = function(scope){
								var activeTest = SharedTabService.tests[SharedTabService.currentTabIndex];
								if(scope.node.isNodeSelected){									
									if($scope.isAllSiblingsSelected(scope.$parentNodeScope.node.nodes)) {
										scope.$parentNodeScope.node.isNodeSelected = true;
										scope.$parentNodeScope.node.showEditQuestionIcon = true;
										if($scope.isNodeUsedForWizard(scope.$parentNodeScope.node, activeTest)){
											scope.$parentNodeScope.node.showTestWizardIcon = false;
										}else{
											scope.$parentNodeScope.node.showTestWizardIcon = true; 
										}
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
									  var test = SharedTabService.tests[SharedTabService.currentTabIndex];
								    node.nodes.forEach(function (node) {
								      
								        if ($scope.isNodeUsedForWizard(node, test)) {
								            node.showTestWizardIcon = false;
								        } else {
								            node.showTestWizardIcon = true;
								        }
										node.isNodeSelected = true;
										if(!$scope.isNodeInTestFrame(node)){
											node.showEditQuestionIcon = true;
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
											node.showTestWizardIcon = true; 
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
								if(node.isNodeSelected && (node.showEditQuestionIcon == false || node.showTestWizardIcon == false) && node.existInTestframe == true ){
									return true;
								}								
							}


							var isParentNodeUsed=false;
							$scope.selectNode = function (scope) {

								var node = scope.node;

								if(skipNodeSelection(node)){
									return;
								}
								
								if(node.nodeType == "question" && (scope.$parentNodeScope.node.isNodeSelected && scope.$parentNodeScope.node.showTestWizardIcon == false)){
									return;
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
										}else
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
									$scope.editQuestionMode=false;
									$rootScope.$broadcast('handleBroadcast_AddNewTab');
								}
								var test = SharedTabService.tests[SharedTabService.currentTabIndex];
								isChildNodeUsed=false;
																
							
								if(scope.nodeType == EnumService.NODE_TYPE.chapter && eventType != "clickEvnt"){								
									for (var i = 0; i < test.questionFolderNode.length; i++) {																	
										if(test.questionFolderNode[i].guid === scope.guid){
											isChildNodeUsed=true;
											break;
										}
									}
								}			
								
								var isNodeUsed=false;
								if(scope.nodeType == EnumService.NODE_TYPE.topic && eventType != "clickEvnt"){								
									for (var i = 0; i < test.questionFolderNode.length; i++) {																	
										if(test.questionFolderNode[i].guid === scope.guid){
											isNodeUsed=true;											
											break;
										}
									}
								}			
								
								
								if(isNodeUsed || isChildNodeUsed){
									if(isChildNodeUsed){
										  $scope.message = "This chapter includes the topic(s) that you have already added to the test. If you want to add the entire chapter, please click OK";
										  $scope.IsConfirmation = true;
										$modal.open(confirmObject).result.then(function(ok) {
											if(ok) {
												$scope.addSelectedQuestionsToTestTab(test, destIndex, eventType,scope);
											}
										});		
									}else{									
										$scope.IsConfirmation = false;
										$scope.message = "Topic(s)  already added to the test, cannot be added again.";
										$modal.open(confirmObject);
									}									
															
								}else{
								    SharedTabService.errorMessages = [];
								    $scope.addSelectedQuestionsToTestTab(test, destIndex, eventType,scope);								     
								}
								$scope.editQuestionMode=false;
								
							}
							
							$scope.isAnyNodeAlreadyAdded = false;
							
							$scope.addSelectedQuestionsToTestTab = function(activeTest, destIndex, eventType,scope) {
                            	var selectedScopeNode = typeof scope.node == "undefined" ? scope : scope.node;
                            	if(!selectedScopeNode.showEditQuestionIcon)
                        		{
                            		$scope.isAnyNodeAlreadyAdded = true

                        		}
                            	
                            	if(selectedScopeNode.nodeType == EnumService.NODE_TYPE.question && eventType == "clickEvnt"){
									$scope.addQuestionToTestFrameTab(activeTest,destIndex,eventType,scope);
								}else if((selectedScopeNode.nodeType == EnumService.NODE_TYPE.chapter || selectedScopeNode.nodeType == EnumService.NODE_TYPE.topic) && eventType == "clickEvnt"){
									addFoldersToTestTab(activeTest, destIndex,scope,eventType)
								}else{
                                    $scope.addQuestionsToTestTab(activeTest, destIndex, eventType,selectedScopeNode,$scope.isAnyNodeAlreadyAdded);
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
							
							$scope.isAllSiblingsInWizardFrame = function(scope,test) {
								var allSiblingsNotExistInWizardFrame=false;
								scope.$parentNodeScope.node.nodes.forEach(function(node) {										
									if(!$scope.isNodeUsedForWizard(node, test)){
										allSiblingsNotExistInWizardFrame = true;
										return;
									} 																	
								});	

								return !allSiblingsNotExistInWizardFrame;																
							}


							//To add a node to questionFolderNode array.
							$scope.addingNodeInQuestionFolderNodeArray = function(node,test) {		
								var existInquestionFolderNode;
								if(typeof(test.questionFolderNode) != "undefined" ){
									for (var i = 0; i < test.questionFolderNode.length; i++) {
										if (test.questionFolderNode[i].guid == node.guid) {
											existInquestionFolderNode =true;
											break;
										}
									}
								}
								
								if(!existInquestionFolderNode){
									test.questionFolderNode.push(node);	
								}		
							}

							//To add a node to questionFolderNode array.
							$scope.checkAllSibblingNodeInTestFrame = function(scope, activeTest) {								
								scope.node.existInTestframe = true;								
								if($scope.isAllSiblingsSelected(scope.$parentNodeScope.node.nodes)){
									scope.$parentNodeScope.node.showEditQuestionIcon = true;
									scope.$parentNodeScope.node.showTestWizardIcon = true; 
									scope.$parentNodeScope.node.isNodeSelected = true;	
									if($scope.isAllSiblingsInTestFrame(scope,activeTest)){
										var existInquestionFolderNode;
										scope.$parentNodeScope.node.showEditQuestionIcon = false;
										$scope.addingNodeInQuestionFolderNodeArray(scope.$parentNodeScope.node,activeTest);
									}
									$scope.addingNodeInSelectedNodesArray(scope.$parentNodeScope.node,activeTest);
									if(scope.$parentNodeScope.node.nodeType != 'book'){
										$scope.checkAllSibblingNodeInTestFrame(scope.$parentNodeScope,activeTest);
									}
								}
							}
							
							$scope.addTopicQuestionsToTestFrameTab = function (test,destIndex,eventType,scope,isAnyNodeAlreadyAdded) {	
								var selectedScopeNode = typeof scope.node == "undefined" ? scope : scope.node;
								test.questionFolderNode.push(selectedScopeNode);								
								$rootScope.blockPage.start();											
								selectedScopeNode.showEditQuestionIcon = false;
								selectedScopeNode.existInTestframe = true;
								
								//to enable the testwizard icon in the next tab if the current node is already added to wizard frame.
								if(!selectedScopeNode.showTestWizardIcon){
									selectedScopeNode.showTestWizardIcon = true;
								}
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
											
											if(SharedTabService.errorMessages.length > 0)
													SharedTabService.TestWizardErrorPopup_Open();
												//$scope.showDuplicateQuestionsAlert();
											

										});

								$scope.updateTopicChildNodesStatus(selectedScopeNode);
								$scope.checkSiblingTopicSelection(scope,test);
							};
							
							//To change the selection status of the parent node of a node.
							$scope.checkSiblingTopicSelection = function(scope,activeTest){														
									if($scope.isAllSiblingsInTestFrame(scope,activeTest)) {
										scope.$parentNodeScope.node.isNodeSelected = true;
										scope.$parentNodeScope.node.showEditQuestionIcon = false;
										scope.$parentNodeScope.node.showTestWizardIcon = true; 	
										updateDraggedNodeStatus(scope.$parentNodeScope.node);
										addingNodeToArray(activeTest.questionFolderNode,scope.$parentNodeScope.node);
										if(scope.$parentNodeScope.node.nodeType!='book'){
											$scope.checkSiblingTopicSelection(scope.$parentNodeScope,activeTest);
										}
									}								
							};
							
							$scope.checkSiblingTopicSelectionForWizard = function(scope,activeTest){
								if($scope.isAllSiblingsInWizardFrame(scope,activeTest)){
									scope.$parentNodeScope.node.showTestWizardIcon = false;
								}
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
							
							var getDragNodes = function(selectedNodesArray,activeTest){								
								var dragNodes = [];
								var selectedNodes = [];
								if(selectedNodesArray.length==undefined){
									selectedNodes.push(selectedNodesArray);
								}else{
									for (var i = 0; i < selectedNodesArray.length; i++) {		
										selectedNodes.push(selectedNodesArray[i]);
									}
								}


								var dragNodeIndex=0;
								var parentExist=false;
								for (var i = 0; i < selectedNodes.length; i++) {																	

									if (selectedNodes[i].nodeType === EnumService.NODE_TYPE.chapter){	
										if (selectedNodes[i].nodes){
											for (var j = 0; j < selectedNodes[i].nodes.length; j++) {
												if (selectedNodes[i].nodes[j].nodeType === EnumService.NODE_TYPE.chapter){	
													getDragNodes(selectedNodes[i].nodes[j]);
												}else{
													updateDraggedNodeStatus(selectedNodes[i]);
													addingNodeToArray(dragNodes,selectedNodes[i].nodes[j]);	
													addingNodeToArray(activeTest.questionFolderNode,selectedNodes[i]);
												}								
											}
										}else{
											updateDraggedNodeStatus(selectedNodes[i]);
											addingNodeToArray(dragNodes,selectedNodes[i]);
										}

									}else if (selectedNodes[i].nodeType === EnumService.NODE_TYPE.topic){	
										if (selectedNodes[i].nodes){
											for (var j = 0; j < selectedNodes[i].nodes.length; j++) {
												updateDraggedNodeStatus(selectedNodes[i]);														
												addingNodeToArray(dragNodes,selectedNodes[i].nodes[j]);
												addingNodeToArray(activeTest.questionFolderNode,selectedNodes[i]);														
											}	
										}else{											
											addingNodeToArray(dragNodes,selectedNodes[i]);												
										}

									}else{										
										addingNodeToArray(dragNodes,selectedNodes[i]);	
									}

								}

								return dragNodes;
							}

							var updateDraggedNodeStatus = function(dragNode){		
								for (var i = 0; i < $scope.selectedNodes.length; i++) {
									if($scope.selectedNodes[i].guid==  dragNode.guid){
										$scope.selectedNodes[i].showEditQuestionIcon = false;
										$scope.selectedNodes[i].showTestWizardIcon = true ;
										$scope.selectedNodes[i].existInTestframe = true;
										break;
									}
								}
							}
							
							
							var processingNodes = [];							
							var getProcessingNodes = function (nodeScope) {	
								if(nodeScope.nodes){
									nodeScope.nodes.forEach(function(node) {
										if(node.nodes){											
											getProcessingNodes(node);
										}else{
											processingNodes.push(node);
										}
									})
								}else{
									processingNodes.push(nodeScope);
								}
								
								return processingNodes;
							}
							
							var immediateChildren = [];
							var getImmediateChildren = function (nodeScope) {	
								if(nodeScope.nodes){
									nodeScope.nodes.forEach(function(node) {
										if(node.nodes){		
											immediateChildren.push(node);
											getImmediateChildren(node);
										}
									})
								}								
								return immediateChildren;
							}
							
							//skipping the nodes which are already presented in the current test frame.
							var getFilteredProcessNodes = function (processingNodes) {
								var filteredProcessNodes=[];
								processingNodes.forEach(function(node) {	
									if(!$scope.isNodeInTestFrame(node)){
										filteredProcessNodes.push(node);
									}							
								});	
								
								return filteredProcessNodes;
							}
							
							
							var addFoldersToTestTab = function (activeTest, destIndex,scope,eventType) {									
								addProcessNodeToTestFrame(activeTest, destIndex,scope,eventType);									
							}							
								
							var addProcessNodeToTestFrame = function (activeTest, destIndex,scope,eventType) {	
								var clickedFolder = typeof scope.node == "undefined" ? scope : scope.node;
								
								var httpReqCount = 0,httpReqCompletedCount = 0,processedNodeCount = 0;
								var isAllNodesNotAdded=false;
							
								var emptyResponseNodes = [];		
								
								
								setAddedFolderNodeStatus(clickedFolder);
								addingNodeToArray(activeTest.questionFolderNode,clickedFolder);		
								
								processingNodes=[];
								processingNodes.push(clickedFolder);								
								
								for (var i = 0; i < processingNodes.length; i++) {
									processedNodeCount++;
									if (processingNodes[i].nodeType === EnumService.NODE_TYPE.question) {
										if (SharedTabService.tests[SharedTabService.currentTabIndex].IsAnyQstnEditMode) {
											processingNodes[i].showEditQuestionIcon = true;
											$scope.IsConfirmation = false;
											$scope.message = "A question is already in Edit mode, save it before adding or reordering questions.";
											$modal.open(confirmObject);
											$scope.dragStarted = false;
											break;
										}else{     
											$rootScope.blockPage.start();
											processingNodes[i].showEditQuestionIcon = false;
											$rootScope.$broadcast("dropQuestion",processingNodes[i], destIndex,"QuestionBank", eventType);
											processingNodes[i].existInTestframe = true;
										}    

									} else if (processingNodes[i].nodeType === EnumService.NODE_TYPE.chapter
											|| processingNodes[i].nodeType === EnumService.NODE_TYPE.topic) {
										
										$rootScope.blockPage.start();
										
										httpReqCount++;									

										var questionFolder = processingNodes[i];

										getQuestions(questionFolder,
												function(response,questionFolder) {
											response.forEach(function(item){							
												item.parentId = questionFolder.guid;
												item.existInTestframe = true;
											});

											$rootScope.$broadcast("handleBroadcast_AddQuestionsToTest",
													response,questionFolder);
											
											httpReqCompletedCount++;
											
											if (!response.length) {
												SharedTabService.addErrorMessage(questionFolder.title, e8msg.warning.emptyFolder);
												questionFolder.showEditQuestionIcon = true;
												addNodeIdToArray(emptyResponseNodes,questionFolder.guid);	
												addNodeIdToArray(emptyResponseNodes,questionFolder.parentId);	
												isAllNodesNotAdded=true;
												removeNodeByID(activeTest.questionFolderNode,questionFolder.guid);												
											}
											
											processHierarchyNodeStatus(processedNodeCount,processingNodes,httpReqCount,
													httpReqCompletedCount,isAllNodesNotAdded,clickedFolder,scope,activeTest,emptyResponseNodes);
											
											
										});
										
										
									}

								}							
								
								processHierarchyNodeStatus(processedNodeCount,processingNodes,httpReqCount,
										httpReqCompletedCount,isAllNodesNotAdded,clickedFolder,scope,activeTest,emptyResponseNodes);
								
							}
							
							
							var processHierarchyNodeStatus = function(processedNodeCount,processingNodes,httpReqCount,
									httpReqCompletedCount,isAllNodesNotAdded,clickedFolder,scope,activeTest,emptyResponseNodes){
								
								if (processedNodeCount == processingNodes.length && httpReqCount == httpReqCompletedCount) {
									
									if(scope.node.nodes){
										updateNodeHierarchyStatus(scope.node,activeTest);
									}
										
									
									if(isAllNodesNotAdded){
										clickedFolder.showEditQuestionIcon = true;									
										removeNodeByID(activeTest.questionFolderNode,clickedFolder.guid);	
									}
									if(SharedTabService.errorMessages.length > 0)
										SharedTabService.TestWizardErrorPopup_Open();	
									
									emptyResponseNodes.forEach(function(nodeId) {	
										removeNodeByID(immediateChildren,nodeId);								
									});		
									
									emptyResponseNodes.forEach(function(nodeId) {	
										removeNodeByID(processingNodes,nodeId);								
									});	
									
								
									updateFolderHierarchyNodesStatus(scope,activeTest);	
								
									
								}
								
							}
							
							//To change the selection status of the parent node of a node.
							var updateNodeHierarchyStatus = function(node,activeTest){														
								node.nodes.forEach(function(node) {	
									setAddedFolderNodeStatus(node);
									if(node.nodeType != EnumService.NODE_TYPE.question){
										addingNodeToArray(activeTest.questionFolderNode,node);													
									}
									addingNodeToArray($scope.selectedNodes,node);		
									if(node.nodes){
										updateNodeHierarchyStatus(node,activeTest);
									}
									
								});	
								
							};	
							
							//To change the selection status of the parent node of a node.
							var updateFolderHierarchyNodesStatus = function(scope,activeTest){														
									if($scope.isAllSiblingsInTestFrame(scope,activeTest)) {
										scope.$parentNodeScope.node.isNodeSelected = true;
										scope.$parentNodeScope.node.showEditQuestionIcon = false;
										scope.$parentNodeScope.node.showTestWizardIcon = true; 	
										setAddedFolderNodeStatus(scope.$parentNodeScope.node);
										addingNodeToArray(activeTest.questionFolderNode,scope.$parentNodeScope.node);
										if(scope.$parentNodeScope.node.nodeType!='book'){
											updateFolderHierarchyNodesStatus(scope.$parentNodeScope,activeTest);
										}
									}								
							};	
							
							
							//to set the status of the question node,if the question node present in test frame.
							var updateAddedFolderNodeStatus=function(immediateChildren,processingNodes,activeTest){
							
								immediateChildren.forEach(function(node) {		
									setAddedFolderNodeStatus(node);
									addingNodeToArray(activeTest.questionFolderNode,node);									
								});		
								
								processingNodes.forEach(function(node) {	
									setAddedFolderNodeStatus(node);
									if(node.nodeType != EnumService.NODE_TYPE.question){
										addingNodeToArray(activeTest.questionFolderNode,node);	
									}									
								});		
								
							}
							
							//to set the status of the question node,if the question node present in test frame.
							var setAddedFolderNodeStatus=function(item){
								item.existInTestframe=true;
								item.isNodeSelected = true;
								item.showEditQuestionIcon = false;
								item.showTestWizardIcon = true;													
							}
							
							//to get the parent of the dragged node.
							var getParentDraggedNode = function(activeTest){								
								var dragNodes = [];								
								var parentExist=false;
								for (var i = 0; i < $scope.selectedNodes.length; i++) {	
									if($scope.selectedNodes[i].nodeType != EnumService.NODE_TYPE.question){
										addingNodeToArray(activeTest.questionFolderNode,$scope.selectedNodes[i]);	
									}
									setAddedFolderNodeStatus($scope.selectedNodes[i]);
									if($scope.selectedNodes[i].parentId != ""){
										for (var j = 0; j < $scope.selectedNodes.length; j++) {		
											parentExist=false;
											if($scope.selectedNodes[i].parentId == $scope.selectedNodes[j].guid){
												parentExist=true;
												break;
											}										
										}
										if(!parentExist){
											dragNodes.push($scope.selectedNodes[i]);
										}
									}else{
										dragNodes.push($scope.selectedNodes[i]);
									}

								}								
								return dragNodes;
							}

							
							
							$scope.addQuestionsToTestTab = function (activeTest, destIndex, eventType,nodeScope, isAnyNodeAlreadyAdded) {
							    var httpReqCount = 0,
                                    httpReqCompletedCount = 0,
                                    uniqueNodeCount = 0;
							  
							    var dragNodes = getParentDraggedNode(activeTest);
							
								for (var i = 0; i < dragNodes.length; i++) {
									if(dragNodes[i].nodeType != EnumService.NODE_TYPE.question){
										addingNodeToArray(activeTest.questionFolderNode,dragNodes[i]);	
									}
									$scope.getRemoveChildNodesFromQuestionFolderNodes(dragNodes[i], activeTest);
									dragNodes[i].showEditQuestionIcon = true;
									if (dragNodes[i].showEditQuestionIcon) {
										uniqueNodeCount++;
										if (dragNodes[i].nodeType === EnumService.NODE_TYPE.question) {
                                            if (SharedTabService.tests[SharedTabService.currentTabIndex].IsAnyQstnEditMode) {
                                            	dragNodes[i].showEditQuestionIcon = true;
                                                $scope.IsConfirmation = false;
                                                $scope.message = "A question is already in Edit mode, save it before adding or reordering questions.";
                                                $modal.open(confirmObject);
                                                $scope.dragStarted = false;
                                                break;
                                            }else{      

                                                    $rootScope.blockPage.start();
                                                    dragNodes[i].showEditQuestionIcon = false;
                                                    $rootScope.$broadcast("dropQuestion",dragNodes[i], destIndex,"QuestionBank", eventType);
                                                    dragNodes[i].existInTestframe = true;
                                            }    

										} else if (dragNodes[i].nodeType === EnumService.NODE_TYPE.chapter
												|| dragNodes[i].nodeType === EnumService.NODE_TYPE.topic) {
											
									        httpReqCount++;
											$rootScope.blockPage.start();
											
											dragNodes[i].showEditQuestionIcon = false;
											//to enable the testwizard icon in the next tab if the current node is already added to wizard frame.
											if(!dragNodes[i].showTestWizardIcon){
												dragNodes[i].showTestWizardIcon = true;
											}											
											updateDraggedNodeStatus(dragNodes[i]);
											var questionFolder = dragNodes[i];
											getQuestions(
													questionFolder,
													function(response,
															questionFolder) {
														response.forEach(function(selectedQuestion){							
															selectedQuestion.parentId = questionFolder.guid;
															selectedQuestion.existInTestframe = true;
														});
														if(!isAnyNodeAlreadyAdded)
														{
															activeTest.questions.forEach(function(testQuestion){
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
														    for (var j = 0; j < activeTest.questionFolderNode.length; j++) {
														        if (activeTest.questionFolderNode[j].guid == questionFolder.guid) {
														        	activeTest.questionFolderNode.splice(j, 1);
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
								if((uniqueNodeCount == 0 && dragNodes.length !=0) || httpReqCount == 0){
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
																if (tab.criterias[k].treeNode.nodes) {
																$scope.updateStatusForWizardChildNodes(tab.criterias[k].treeNode.nodes);	
																}
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
					
							$scope.updateStatusForWizardChildNodes = function(childNodes){
								for (var i = 0; i < childNodes.length; i++) {
									childNodes[i].isNodeSelected = true;
							        childNodes[i].showTestWizardIcon = false;
							        childNodes[i].showEditQuestionIcon = true;
							        $scope.selectedNodes.push(childNodes[i]);
							        if(childNodes[i].nodes){
							        	$scope.updateStatusForWizardChildNodes(childNodes[i].nodes);
							        }
								}
								
							}
							$scope.deselectWizarChildNode = function (node) {
								for (var i = 0; i < $scope.selectedNodes.length; i++) {
									if ($scope.selectedNodes[i].guid == node.guid) {
										$scope.selectedNodes[i].isNodeSelected = false ;
										$scope.selectedNodes[i].showEditQuestionIcon = false;
										$scope.selectedNodes[i].showTestWizardIcon = false;
										if($scope.selectedNodes[i].nodes){
											$scope.selectedNodes[i].nodes.forEach(function(usedNode) {
												$scope.deselectWizarChildNode(usedNode);
											})
										}
									}
								}
							}
							
							
							$scope.deselectWizarParentNode = function (node) {
								var parentExistInSelectNodes=false;
								var nodeIndex=0;
								for (var i = 0; i < $scope.selectedNodes.length; i++) {
								if ($scope.selectedNodes[i].guid == node.parentId) {
									$scope.selectedNodes[i].isNodeSelected = false ;
									$scope.selectedNodes[i].showEditQuestionIcon = false;
									$scope.selectedNodes[i].showTestWizardIcon = false;
									parentExistInSelectNodes = true;
									break;
								}
								nodeIndex++;
							}
								if(parentExistInSelectNodes){
									var parentNode = $scope.selectedNodes[nodeIndex];
									$scope.selectedNodes.splice(nodeIndex, 1);
									$scope.deselectWizarParentNode(parentNode);
								}
							}
							
							//to set the status of the question node in question bank tab,if the question node deleted in test frame.
							var setDeletedTestQuestionNodeStatus=function(node){										
								node.existInTestframe=false;
								node.isNodeSelected = false;
								node.showEditQuestionIcon = false;
								node.showTestWizardIcon = false;													
							}
							
							
							//to set the status of the hierarchical parent node in question bank tab,if the question node deleted in test frame.
							var updateHigherParentNodesStatusByID=function(parentId){		
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
									removeNodeByID(SharedTabService.tests[SharedTabService.currentTabIndex].questionFolderNode,parentId);
									updateHigherParentNodesStatus(parentNode.parentId);	
								}
											
							}
							
							//to set the status of the hierarchical parent node in question bank tab,if the question node deleted in test frame.
							var updateHigherParentNodesStatus=function(deselectedNode){		
								
								deselectedNode.questionHierarchy.forEach(function(parentId) {	
									for (var j = 0; j < $scope.selectedNodes.length; j++) {
										if ($scope.selectedNodes[j].guid == parentId) {
											$scope.selectedNodes[j].isNodeSelected = false ;
											$scope.selectedNodes[j].showEditQuestionIcon = false;
											$scope.selectedNodes[j].showTestWizardIcon = false;		
											$scope.selectedNodes.splice(j, 1);
											removeNodeByID(SharedTabService.tests[SharedTabService.currentTabIndex].questionFolderNode,parentId);										
											break;
										}
									}										
								});		
								
							}
							
							//#To check whether the any parent node of selected node is used for test creation(edit question/wizard)  
							$scope.updateParentNodeStatus = function(deselectedNode){	
								if(deselectedNode.questionHierarchy){
									updateHigherParentNodesStatus(deselectedNode);
								}else{
									updateHigherParentNodesStatusByID(deselectedNode.parentId);
								}
								
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
										node.nodes.forEach(function(usedNode) {
											if(usedNode.nodeType == "question" && $scope.isNodeInTestFrame(usedNode)){
												usedNode.existInTestframe = true;
												usedNode.isNodeSelected = true;
												usedNode.showEditQuestionIcon = false;
												usedNode.showTestWizardIcon = false;
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
							
							$scope.$on('handleBroadcast_deselectWizardNode',
									function(handler, node) {
								
								$scope.deselectWizarChildNode(node);
								$scope.deselectWizarParentNode(node);

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
									var testTab = SharedTabService.tests[SharedTabService.currentTabIndex];
									$scope.selectedNodes=[];
									$scope.selectedBooks.forEach(function(book){
										ContainerService.getQuestionTypeContainers(book.guid,searchCriteria,function(containers){
											if(containers==null){
												isErrorExists=true;
											}
											
											if(containers.length==0){
												emptyBooks = emptyBooks+1;
											}
											containers.forEach(function(container){
												checkIsContainerIsInTestFrame(container,testTab);
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
										});
									});	
								}
							}
							
							var checkIsContainerIsInTestFrame=function(container,testTab){
								if(testTab.criterias.length > 0){
                                	for (var j = 0; j < testTab.criterias.length; j++) {
                                		if (testTab.criterias[j].treeNode.guid == container.guid) {
                                			container.isNodeSelected = true;
                                			container.showTestWizardIcon = false;
                                			container.showEditQuestionIcon = true;
                                			container.existInTestframe= true;
                                			$scope.selectedNodes.push(container);
                                			break;
                                		}
                                	}
                                }else if(testTab.questionFolderNode.length > 0){
                                	for (var j = 0; j < testTab.questionFolderNode.length; j++) {
                                		if (testTab.questionFolderNode[j].guid == container.guid) {
                                			container.isNodeSelected = true;
                                			container.showTestWizardIcon = true;
                                			container.showEditQuestionIcon = false;
                                			container.existInTestframe= true;
                                			$scope.selectedNodes.push(container);
                                			break;
                                		}
                                	}
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
							
							
							var updateTestquestionFolderNode = function(qstnGuid,activeTest){
								var isExist = false;
								 for (var i = 0; i < activeTest.questionFolderNode.length; i++) {
									 isExist = false;
								    	for (var j = 0; j < activeTest.questionFolderNode[i].questionBindings.length; j++) {
								    		if(activeTest.questionFolderNode[i].questionBindings[j] == qstnGuid){									    			
								    			 updateHigherParentNodesStatus(activeTest.questionFolderNode[i].guid);									    			
								    			 activeTest.questionFolderNode.splice(i, 1);
								    			isExist = true;
												break;
								    		}									    	
									    }	
								    	
								    	if(isExist)
								    		break;
								    	
								    }	
							}
							
							$scope.$on('handleBroadcast_AddNewTest', function (handler, newTest, containerFolder, isEditMode, oldGuid, editedQuestions, editedMigratedQuestions, createdTab, testCreationFrameScope) {
																	
								//this loop is to deselect the edited existing question.
								var existInQB;
								var activeTest = SharedTabService.tests[SharedTabService.currentTabIndex];
								$.each( editedMigratedQuestions, function( key, value ) {	
									existInQB=false;
											 for (var i = 0; i < $scope.selectedNodes.length; i++) {												 
											        if (value === $scope.selectedNodes[i].guid) {	                                                   
                                                        var qstnCopy = angular.copy($scope.selectedNodes[i]);
											        	removeNodeInquestionFolderNodeArray(qstnCopy);
											        	$scope.removeNodeFromSelectedNodes(qstnCopy);	
											        	existInQB = true;
											            return true;
											        }
											    }	
											 
											 if(!existInQB){												
												 updateTestquestionFolderNode(value,activeTest);
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
	                        
							var ShortMetadataEnum={
									'DIFFICULTY':'Diff',
									'TOPIC':'Topk',
									'OBJECTIVE':'Objt',
									'PAGEREFERENCE':'PRef',
									'SKILL':'Skil',
									'QUESTIONID':'QnId'
							}
							 $scope.metadataValues = {
                                    "Difficulty":[]
                            };
							$scope.userMetadata=[];
							var metadataArray = function(){
                                 $scope.userMetadata.push(new metadataKeyValue(ShortMetadataEnum.DIFFICULTY,'Difficulty'));
                                 $scope.userMetadata.push(new metadataKeyValue(ShortMetadataEnum.TOPIC,'Topic'));
                                 $scope.userMetadata.push(new metadataKeyValue(ShortMetadataEnum.OBJECTIVE,'Objective'));
                                 $scope.userMetadata.push(new metadataKeyValue(ShortMetadataEnum.PAGEREFERENCE,'Page Reference'));
                                 $scope.userMetadata.push(new metadataKeyValue(ShortMetadataEnum.SKILL,'Skill'));
                                 $scope.userMetadata.push(new metadataKeyValue(ShortMetadataEnum.QUESTIONID,'Question ID'));
                             }
                             
                             function metadataKeyValue(keyValue,nameValue) {
                                 this.key = keyValue;
                                 this.name = nameValue;
                             }
                             
							$scope.getUserMetadata=function(){
								metadataArray();
                                UserService.userQuestionMetadata(function(userQuestionMetadata){
                                    var isDifficultyEnabled=false;
                                    var isTopicEnabled=false;
                                    var isObjectiveEnabled=false;
                                    var isPageReferenceEnabled=false;
                                    var isSkillEnabled=false;
                                    var isQuestionIDEnabled=false;
                                    userQuestionMetadata.forEach(function(metadata){
                                        userQuestionMetadata.forEach(function(metadata){
                                            var userMetadataKeyValue={};
                                            if(metadata==MetadataEnum.DIFFICULTY){
                                                isDifficultyEnabled=true;
                                            }else if(metadata==MetadataEnum.TOPIC){
                                                isTopicEnabled=true;
                                            }else if(metadata==MetadataEnum.OBJECTIVE){
                                                isObjectiveEnabled=true;
                                            }else if(metadata==MetadataEnum.PAGEREFERENCE){
                                                isPageReferenceEnabled=true;
                                            }else if(metadata==MetadataEnum.SKILL){
                                                isSkillEnabled=true
                                            }else if(metadata==MetadataEnum.QUESTIONID){
                                                isQuestionIDEnabled=true;
                                            }
                                        });
                                    });
                                    if(!isDifficultyEnabled){
                                    	removeUnselectedMetadata('Difficulty')
                                    }
                                    if(!isTopicEnabled){
                                    	removeUnselectedMetadata('Topic')
                                    }
                                    if(!isObjectiveEnabled){
                                    	removeUnselectedMetadata('Objective')
                                    }
                                    if(!isPageReferenceEnabled){
                                    	removeUnselectedMetadata('Page Reference')
                                    }
                                    if(!isSkillEnabled){
                                    	removeUnselectedMetadata('Skill')
                                    }
                                    if(!isQuestionIDEnabled){
                                    	removeUnselectedMetadata('Question ID')
                                    }
                                });
                            }
							
							var removeUnselectedMetadata=function(value){
								$scope.userMetadata.forEach(function(metadata,index){
									if(metadata.name==value){
										$scope.userMetadata.splice(index, 1);
									}
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
                           
						} ]);