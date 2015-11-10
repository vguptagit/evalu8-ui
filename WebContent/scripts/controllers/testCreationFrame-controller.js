'use strict';

angular
		.module('e8MyTests')

		.controller(
				'TestCreationFrameController',
				[
						'$scope',
						'$rootScope',
						'$location',
						'$cookieStore',
						'$http',
						'$sce',
						'TestService',
						'SharedTabService',
						'$modal',
						'notify',
						'EnumService', 'UserService', 'CommonService','blockUI','QtiService',
						function($scope, $rootScope, $location, $cookieStore,
								$http, $sce, TestService, SharedTabService,
								$modal, notify, EnumService, UserService, CommonService,blockUI,QtiService) {

							// $scope.tree2 =
							// SharedTabService.tests[SharedTabService.currentTabIndex].questions;
							$scope.isDeleteAnswerClicked=false;
							$scope.isBlockQuoteClicked=false;
							$scope.controller = EnumService.CONTROLLERS.testCreationFrame;
							$scope.tests = SharedTabService.tests;							
							
							$scope.currentIndex = SharedTabService.currentTabIndex;
							$scope.criterias = SharedTabService.tests[SharedTabService.currentTabIndex].criterias;
							$scope.captionFocus = true;
							
							if (SharedTabService.userQuestionSettings.length == 0){
								UserService.userQuestionMetadata(function(userQuestionMetadata){
									if(userQuestionMetadata==null){
										CommonService.showErrorMessage(e8msg.error.cantFetchMetadata)
				            			return;
									}
										$.each(userQuestionMetadata, function(index, item){	
												SharedTabService.userQuestionSettings.push(item);						

										});
							
								});
						}

							
							// $scope.isTestWizardTabPresent = false;
							$scope.sharedTabService = SharedTabService;
							$scope.enumService = EnumService;

							/**
							 * ***************************************Start
							 * Question edit
							 * ***************************************
							 */
							$scope.showQstnEditIcon = false;
							$scope.closeQstnBtn = false;
							
							/**************************** Begin Html Editor Changes **********************************/
							$scope.updateQstnEditState = function(qstnState) {								
								if(!qstnState && SharedTabService.tests[SharedTabService.currentTabIndex].IsAnyQstnEditMode){
									$scope.IsConfirmation = false;
									$scope.message = "A question is already in Edit mode, save it before editing another question.";

									$modal.open(confirmObject);

									return false;
									
								}else if(qstnState) { //switching from View to Edit mode
									SharedTabService.tests[SharedTabService.currentTabIndex].IsAnyQstnEditMode = false;
									return true;
								}else if(!qstnState) { //switching from Edit to View mode
									SharedTabService.tests[SharedTabService.currentTabIndex].IsAnyQstnEditMode = true;
									return true;
								}								
								
							}
							
							$scope.getTrustedHTML = function(html_code) {
							    return $sce.trustAsHtml(html_code);
							}
							
							/**************************** End of Html Editor Changes **********************************/

							$scope.hoverIn = function(selectedQstn) {
								this.showQstnEditIcon = true;
								this.closeQstnBtn = true;
							};
							$scope.hoverOut = function() {
								this.showQstnEditIcon = false;
								this.closeQstnBtn = false;
							};						

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
						
						
							/**
							 * ***************************************End
							 * Question edit
							 * ***************************************
							 */

							if (SharedTabService.currentTab
									&& SharedTabService.currentTab.testId) {
								$scope.newVersionBtnCss = "";
								$scope.exportBtnCss = "";
							} else {
								$scope.newVersionBtnCss = "disabled";
								$scope.exportBtnCss = "disabled";
							}

							$scope.addNewTest = function () {							   
								
								$scope.testType = 'Test';

								SharedTabService.addNewTest($scope);
							}

							$scope.addTestWizard = function() {
								$scope.isApplySameCriteriaToAll = false;
								SharedTabService.addTestWizard($scope);
							}
							$scope.addTestWizardCriteria = function(response,
									currentNode) {
							    
								SharedTabService
										.addTestWizardCriteria(
												$scope,
												SharedTabService.tests[SharedTabService.currentTabIndex],
												response, currentNode);
							}

							$scope.onClickTab = function(test) {							

								SharedTabService.onClickTab(test, $scope);
								if (SharedTabService.tests[SharedTabService.currentTabIndex].testId) {
									$scope.newVersionBtnCss = "";
									$scope.exportBtnCss = "";
									
									$scope.setTestType();									
								} else {
									$scope.newVersionBtnCss = "disabled";
									$scope.exportBtnCss = "disabled";
                                    $scope.testType = 'Test';
								}

								loadQuestionsToEmptyTab();
							}

							$scope.isActiveTab = function(tabUrl) {
								return SharedTabService.isActiveTab(tabUrl,
										$scope);
							}

							$scope.isActiveSelectedTest = function(testId) {
								if (SharedTabService.currentTab) {
									return testId == SharedTabService.currentTab.id;
								}
								return false;
							}

					        $scope.closeTab = function (tab) {
					            SharedTabService.closeTab(tab, $scope);
					            var scope = angular.element($("input[type=checkbox][id=applyCriteria]").eq(0)).scope();
					            $scope.isApplySameCriteriaToAll = false;
					        }
					        $scope.closeQuestions = function (tab,index) {
					        	
					        	$scope.IsConfirmation = true;
								$scope.message = "Are you sure you want to delete this Question?";
								$modal.open(confirmObject).result
								.then(function(ok) {
									if (ok) {
										 var p = $(
			                                        angular.element(document
			                                                .querySelector("#uploadImage")))
			                                        .detach();
			                                
			                                $('#qstnArea').after(p);
			                                $scope.imageClicked = false;
							            SharedTabService.closeQuestions(tab, $scope, index);	
									}
								});
					        					           
					        }
					        $scope.closeTabWithConfirmation = function ($event,tab) {
					        	checkTestQuestionsInEditModeWithChanges(tab);
								SharedTabService.closeTabWithConfirmation(tab, $scope);
								$scope.setTestType();
								loadQuestionsToEmptyTab();
								$event.stopPropagation();
					        }
					        
					        var checkTestQuestionsInEditModeWithChanges = function(tab){
					        	angular.forEach(tab.questions,function(question,index){
					        		if(question["IsEditView"] == true){
					        			question.IsEdited =  $scope.IsQuestionModified(question);
					        			return;
					        		}
					        	});
					        } 

					        var loadQuestionsToEmptyTab = function () {
					            var test = SharedTabService.tests[SharedTabService.currentTabIndex];
					            if (test.testId && !test.questions.length && !SharedTabService.isDirtyTab(test) && !test.isTabClicked) {
					                test.isTabClicked = true;
					                $rootScope.blockRightPanel.start();
					                TestService.getTestQuestions(test.testId, function (questions) {
					                    try {
					                        if (questions == null) {
					                            $rootScope.blockRightPanel.stop();
					                            CommonService.showErrorMessage(e8msg.error.cantFetchTestQuestions);
					                            return;
					                        }
					                        $scope.bindTestQuestions(questions, $scope.currentIndex);
					                    } catch (e) {
					                        console.log(e);
					                    } finally {
					                        $rootScope.blockRightPanel.stop();
					                    }
					                })
					            }
					        }

							$scope.setTestType = function() {
								if (SharedTabService.tests[SharedTabService.currentTabIndex].treeNode
								        && SharedTabService.tests[SharedTabService.currentTabIndex].treeNode.testType === EnumService.TEST_TYPE.PublisherTest) {
										
									$scope.newVersionBtnCss = "disabled";
									$scope.testType = EnumService.TEST_TYPE.PublisherTest;
								} else {
									$scope.testType = EnumService.TEST_TYPE.Test;
								}
							}
							
							$scope.closeCriteria = function(folder,
									isWizardCloseBtnClicked) {
								var scope = angular
										.element(
												$(
														"input[type=checkbox][id=applyCriteria]")
														.eq(0)).scope();
								isWizardCloseBtnClicked = isWizardCloseBtnClicked
										&& scope.isApplySameCriteriaToAll
								if (isWizardCloseBtnClicked){
									SharedTabService.closeAllCriteria(folder,
											$scope);
								}else{
									SharedTabService.closeCriteria(folder,
											$scope);
								}
								if (SharedTabService.tests[SharedTabService.currentTabIndex].criterias.length <= 1) {
									scope.isApplySameCriteriaToAll = false;
									$scope.isApplySameCriteriaToAll = false;
								}
							}

							
							$scope.testTitle = "New Test";

							function buildQstnMasterDetails(qstnNode) {
								
								var qstnXML = jQuery.parseXML(qstnNode.data);
							
								var qstnMasterData ;
								
									switch(qstnNode.quizType) {		
									
										 case "MultipleResponse","MultipleChoice","Essay","FillInBlanks","TrueFalse":
											 
											 qstnMasterData = getMultipleChoiceQstn_MasterDetails(qstnXML,qstnNode.quizType);										 
									         break;
									         
									      case "Matching":
									    	  qstnMasterData = getMatchingQstn_Details(qstnXML);
									         break;
									     
									      default:
									    	  
									    	  qstnMasterData = getMultipleChoiceQstn_MasterDetails(qstnXML);
								      
								     }
									var questionMetadata = angular.copy(qstnNode.questionMetadata);
									qstnMasterData.questionMetadata = questionMetadata;
									return qstnMasterData;																
							}
							
							function getMultipleChoiceQstn_MasterDetails(qstnXML,quizType) {								
								var optionList = [];
								var correctAnswerList = [];
								if(quizType=='MultipleResponse'){
									$(qstnXML)
									.find(
											'responseDeclaration mapEntry')
									.each(function(i, e) {
										if ($(this).attr("mappedValue") == "1") {
											correctAnswerList.push(i);
										}
									});
									
								}else{
								$(qstnXML)
										.find(
												'setOutcomeValue[identifier="SCORE"] baseValue')
										.each(function(i, e) {

											if ($(this).text() == "1") {
												correctAnswerList = i;
											}
										});
								}

								$(qstnXML).find('itemBody').find(
										'choiceInteraction').find(
										"simpleChoice").each(function(i, e) {

									optionList.push($(this).text().trim());
								});

								var xmlOrientation = $(qstnXML).find('itemBody')
										.find('choiceInteraction').attr(
												"orientation");
								var nodeOptionsView = (xmlOrientation == undefined)
										|| (xmlOrientation == 'Vertical') ? true
										: false;
								
									
								
								

								var qstnMasterData = {
									caption : $(qstnXML).find('itemBody').find('p').text(),
									options : optionList,
									optionCount : $(qstnXML).find('itemBody').find(
											'choiceInteraction').find(
											"simpleChoice").length,
									correctAnswer : correctAnswerList,
									optionsView : nodeOptionsView
								}
								
								if(quizType=='Essay'){
									var nodeEssayPageSize = '0';
									if($(qstnXML).find('itemBody').find("extendedTextInteraction").length > 0)
										nodeEssayPageSize = $(qstnXML).find('itemBody').find("extendedTextInteraction").eq(0).attr("expectedLines")
									
									qstnMasterData.EssayPageSize = nodeEssayPageSize;
								}
								
								if(quizType=='FillInBlanks'){
									var nodeBlankSize = '20';
									if($(qstnXML).find('itemBody').find("textEntryInteraction").length > 0)
										nodeBlankSize = $(qstnXML).find('itemBody').find("textEntryInteraction").eq(0).attr("expectedLength")
									
									qstnMasterData.BlankSize = nodeBlankSize
								}

								return qstnMasterData;
							}
							
							function getMatchingQstn_Details(qstnXML) {								
								var leftOptionList = [];
								var rightOptionList = [];
								
								$(qstnXML).find('itemBody').find(
								'blockquote').eq(0).find("inlineChoiceInteraction inlineChoice").each(function(i, e) {

									rightOptionList.push(QTI.getSerializedXML($(this)));
								});
								
								$(qstnXML).find('itemBody').find(
								'blockquote').each(function(i, e) {		
									$(this).find("p").find('inlineChoiceInteraction').remove();
									leftOptionList.push(QTI.getSerializedXML($(this).find("p").eq(0)));
								});

								var qstnMasterData = {
									caption : $(qstnXML).find('itemBody').find('p').eq(0).text(),
									leftOptions: leftOptionList ,
									rightOptions: rightOptionList		
								}

								return qstnMasterData;
							}
							
							  $scope.$on('beforeDrop', function (event) {
								  $scope.questionEditAlert();
							   });
							  
							  $scope.questionEditAlert = function(){
								  if (SharedTabService.tests[SharedTabService.currentTabIndex].IsAnyQstnEditMode) {
										$scope.IsConfirmation = false;
										$scope.message = "A question is already in Edit mode, save it before adding or reordering questions.";
										$modal.open(confirmObject);
										$scope.dragStarted = false;
									}
							  }

							$scope
									.$on(
											'beforeDropQuestion',
											function(event) {

												 $scope.questionEditAlert();

											});
							$scope.$on('dropTest', function (event, selectedTest, destIndex) {
						    				selectedTest.node.draggable = false;
											$scope.editTest(selectedTest);
									});

							  $scope.Difficulty = [{name:'Select Level',value:'0'},
							                       {name:'Easy',value:'Easy'},
							                       {name:'Moderate',value:'Moderate'},
							                       {name:'Difficult',value:'Difficult'}
							                      ];	
							 
							  $scope.difficultyChange = function(selectedQuestion,selectedDifficulty) {
								  selectedQuestion.node.selectedLevel = selectedDifficulty;
								  selectedQuestion.node.questionMetadata.Difficulty = selectedDifficulty.value;								
							  }
							  
							  $scope
									.$on(
											'dropQuestion',
											function(event, node, destIndex,
													sourceTabName, eventType) {
											    try {
											        var newNode = angular.copy(node);
											        newNode.isNodeSelected=false;
											        if (sourceTabName == "CustomQuestions") {
											            SharedTabService.tests[SharedTabService.currentTabIndex].IsAnyQstnEditMode = true;
											        }
											        newNode.IsUserMetdataAvailable = false;

											        newNode.questionMetadata = {};
											        if (SharedTabService.userQuestionSettings.length > 0) {
											            newNode.IsUserMetdataAvailable = true;
											        }


											        var tests = SharedTabService.tests[SharedTabService.currentTabIndex].questions;

											        if (sourceTabName == "CustomQuestions") {

											            $.each(SharedTabService.userQuestionSettings, function (index, value) {
											                if (value != 'QuestionId') {
											                    newNode['questionMetadata'][value] = '';
											                }
											            });
											         
											            newNode.IsEditView = true;
											            newNode.editMainText = CustomQuestionTemplate[newNode.quizType].editMainText;
											            newNode.IsEdited = true;
											            newNode.IsDefaultEditView = true;
											            newNode.selectedLevel = { name: 'Select Level', value: '0' };
											         
											        } else {

											            $.each(SharedTabService.userQuestionSettings, function (index, value) {
											            	      newNode['questionMetadata'][value] = '';
											                
											            });

											            newNode.IsEditView = false;
											            newNode.editMainText = CustomQuestionTemplate[newNode.quizType].editMainText;
											           

											            $.each(newNode.extendedMetadata, function (index, item) {
											                var name = item['name'].charAt(0).toUpperCase() + item['name'].slice(1);
											                if((typeof(newNode['questionMetadata'][name])!='undefined')||((typeof(newNode['questionMetadata']['Difficulty'])!='undefined') && (name=='QuestionLevelOfDifficulty'))) {
											                	if (item['name'] == "questionLevelOfDifficulty")
											                		newNode['questionMetadata']['Difficulty'] = item['value'];
											                	else{
											                		
											                		newNode['questionMetadata'][name] = item['value'].replace(/&ndash;/g, '-');
											                	}
											                }
											            });

											            newNode.selectedLevel = newNode.questionMetadata['Difficulty'] == undefined ? { name: 'Select Level', value:'0'}:{name:newNode.questionMetadata['Difficulty']==""?'Select Level':newNode.questionMetadata['Difficulty'],value:newNode.questionMetadata['Difficulty']==""?'0':newNode.questionMetadata['Difficulty']};
											           
											            newNode.qtiModel =  QtiService.getQtiModel(newNode.data, newNode.quizType);
											            newNode.qstnModelMasterData = getQuestionMasterDataModel(newNode)
											           
											        }
										       
											        var nodeAlreadyExist = false;
											        if (tests.length == 0) {
											            tests.push(newNode);
											        } else {
											            if (sourceTabName != "CustomQuestions") {
											                tests
                                                                    .forEach(function (
                                                                            item) {
                                                                        if (item.guid == newNode.guid) {
                                                                            nodeAlreadyExist = true;
                                                                        }
                                                                    });
											            }

											            if (!nodeAlreadyExist) {
											                tests.splice(destIndex,0, newNode);
											                if(eventType == "clickEvnt"){
											                $('div#qstnArea').scrollTop(0);
											                }
											                
											            }
											        }
											        $scope.tests[$scope.currentIndex].questions = tests;
											        } catch (e) {
											            console.log(e);
											        }
											        finally {
											            $rootScope.blockPage.stop();
											        }
												
												 });
												
												
							$scope.$on('editTest',
									function(event, selectedTest) {								
                                		
										$scope.editTest(selectedTest);
									});
                            //
							var resetTabs = function () {
							    if (SharedTabService.tests.length == 1 && SharedTabService.isEmptyTab(SharedTabService.tests[0]) && !SharedTabService.tests[0].isTestWizard) {
							        SharedTabService.tests = [];
							        SharedTabService.masterTests = [];
							    }
							}
							$scope.editTest = function (selectedTest) {
							    $rootScope.blockPage.start();
							    resetTabs();
								$scope.newVersionBtnCss = "";
								$scope.exportBtnCss = "";
								
                        		$scope.testType = 'Test';
                        		if(selectedTest.node.testType && selectedTest.node.testType == EnumService.TEST_TYPE.PublisherTest) {
                        			$scope.testType = EnumService.TEST_TYPE.PublisherTest;
                        			$scope.newVersionBtnCss = "disabled";
                        		}                        		

								$scope.testGuid = selectedTest.node.guid;
								$scope.selectedTestNode = selectedTest.node;
								// if Test is in root folder
								if (selectedTest.$parentNodeScope) {
									$scope.folderGuid = selectedTest.$parentNodeScope.node.guid;
									$scope.courseFolder = selectedTest.$parentNodeScope.node.title;
								} else {
									$scope.folderGuid = null;
								}

								$("#testCaption").val(selectedTest.node.title);
							
								TestService.getTestQuestions(selectedTest.node.guid,function(questions) {
												if (questions == null) {
						                            CommonService.showErrorMessage(e8msg.error.cantFetchTestQuestions);
						                            return;
						                        }
                                                $scope.bindTestQuestions(questions,$scope.currentIndex);
                                            })												
												
								$scope.testTitle = selectedTest.node.title;
								$scope.metadata = TestService
										.getTestMetadata(selectedTest.node);
								SharedTabService.editTest($scope);
							}

							 $scope.bindTestQuestions = function(questions,currentIndex) {
	                                if (questions.length == 0) {
	                                    $rootScope.blockPage.stop();
	                                    return false;
	                                }	                                     
	                                          
	                                     QTI.initialize();
	                                     $.each(questions,function(index,question){	                                        
	                                            
	                                            var displayNode = {};
	                                            
	                                            var userSettings= {};    
	   	                                     	userSettings.questionMetadata = {};
	   	                                     
	   	                                     	$.each(SharedTabService.userQuestionSettings, function( index, value ) {    
	   	                                     		userSettings['questionMetadata'][value]='';                                                                                                        
	   	                                        });       
	   	                                     
	                                            displayNode.guid = question.guid;    
	                                            displayNode.quizType = question.metadata.quizType;
	                                            displayNode.IsUserMetdataAvailable = false;
	                                             if (SharedTabService.userQuestionSettings.length>0){
	                                                 displayNode.IsUserMetdataAvailable = true;
	                                             }                                            
	                                         
	                                            
	                                            displayNode.IsEditView = false;	                                         
	                                            displayNode.extendedMetadata =  question.metadata.extendedMetadata;
	                                            displayNode.questionMetadata = userSettings.questionMetadata;    
	                                            

	                                            displayNode.editMainText = CustomQuestionTemplate[displayNode.quizType].editMainText;
	                                            
	                                            $.each(displayNode.extendedMetadata, function(index, item){                                                                    
	                                                var name = item['name'].charAt(0).toUpperCase() + item['name'].slice(1);
	                                                if((typeof(displayNode['questionMetadata'][name])!='undefined')||((typeof(displayNode['questionMetadata']['Difficulty'])!='undefined') && (name=='QuestionLevelOfDifficulty'))){
	                                                 if(item['name'] == "questionLevelOfDifficulty")
	                                                     displayNode['questionMetadata']['Difficulty'] = item['value'];
	                                                 else
	                                                     displayNode['questionMetadata'][name]=item['value'].replace(/&ndash;/g, '-');  
	                                                }
	                                            });
	                            
	                                
	                                            displayNode.selectedLevel = displayNode.questionMetadata['Difficulty']==undefined?{name:'Select Level',value:'0'}:{name:displayNode.questionMetadata['Difficulty']==""?'Select Level':displayNode.questionMetadata['Difficulty'],value:displayNode.questionMetadata['Difficulty']==""?'0':displayNode.questionMetadata['Difficulty']};
	                                	                                
	                                            displayNode.data=question.qtixml;	                                            
	       									 
	       									 	displayNode.qtiModel =  QtiService.getQtiModel(displayNode.data, displayNode.quizType);
	       									
	       									 	displayNode.qstnModelMasterData = getQuestionMasterDataModel(displayNode);
	       									 
	                                            // $scope.tree2.push(displayNode);
	                                            SharedTabService.tests[currentIndex].questions.push(displayNode);
	                                            for (var i = 0; i < SharedTabService.masterTests.length; i++) {
	                                                if (SharedTabService.masterTests[i].id === SharedTabService.tests[currentIndex].id) {
	                                                    SharedTabService.masterTests[i].masterQuestions.push(angular.copy(displayNode));// is to check for dirty.
	                                                }
	                                            }
	                                    
	                                });
	                                     $rootScope.blockPage.stop(); 
	                                
	                            };
	                            
		                        var renderCounter = 0;
								$scope.renderQuestions = function(qBindings,
										currentIndex,isAnyNodeAlreadyAdded) {
									isAnyNodeAlreadyAdded = typeof isAnyNodeAlreadyAdded == "undefined" ? false : isAnyNodeAlreadyAdded;
									if (qBindings.length == 0) {
										$rootScope.blockPage.stop();
										renderCounter--;
										if(renderCounter == 0 && isAnyNodeAlreadyAdded){
		                            		$scope.IsConfirmation = false;
	                                    	$scope.message = "Question(s) already added to the test, cannot be added again.";
	                                    	$modal.open(confirmObject).result.then(function(ok) {
	                                    		if(ok) {
	                                    			renderCounter = 0;
	                                    		}
	                                    	});
										}
										return false;
									}
									var question = qBindings.shift();
									 var userSettings= {};	
									 userSettings.questionMetadata = {};
									 
									 $.each(SharedTabService.userQuestionSettings, function( index, value ) {	
										 userSettings['questionMetadata'][value]='';																										
										});			
									 
									 
									 
									 TestService
										.getMetadata(
												question.guid,
												function(questionMetadataResponse) {		
													if(questionMetadataResponse==null){
														$scope.blockPage.stop();
										        		 CommonService.showErrorMessage(e8msg.error.cantFetchMetadata);
										         		return;
										        	 }
										TestService
												.getQuestionById(
														question.guid,
														function(response) {
															if(response == null){
																$scope.blockPage.stop();
											        			CommonService.showErrorMessage(e8msg.error.cantFetchQuestions)
											        			return;
															}														
															var displayNode = {};
															displayNode.guid = question.guid;	
															displayNode.parentId = question.parentId;
															displayNode.quizType = questionMetadataResponse.quizType;
															displayNode.IsUserMetdataAvailable = false;
															 if (SharedTabService.userQuestionSettings.length>0){
																 displayNode.IsUserMetdataAvailable = true;
															 }
															
															displayNode.IsEditView = false;
															
															displayNode.extendedMetadata =  questionMetadataResponse.extendedMetadata;
															displayNode.questionMetadata = userSettings.questionMetadata;	
															

                                                            displayNode.editMainText = CustomQuestionTemplate[displayNode.quizType].editMainText;
															
                                                            $.each(displayNode.extendedMetadata, function(index, item){                                                                    
                                                                var name = item['name'].charAt(0).toUpperCase() + item['name'].slice(1);
                                                                if((typeof(displayNode['questionMetadata'][name])!='undefined')||((typeof(displayNode['questionMetadata']['Difficulty'])!='undefined') && (name=='QuestionLevelOfDifficulty'))){
                                                                 if(item['name'] == "questionLevelOfDifficulty")
                                                                     displayNode['questionMetadata']['Difficulty'] = item['value'];
                                                                 else
                                                                     displayNode['questionMetadata'][name]=item['value'].replace(/&ndash;/g, '-');  
                                                                }
                                                            });
											
												
															displayNode.selectedLevel = displayNode.questionMetadata['Difficulty']==undefined?{name:'Select Level',value:'0'}:{name:displayNode.questionMetadata['Difficulty'],value:displayNode.questionMetadata['Difficulty']};
												
												
															displayNode.data=response;
															
															displayNode.qstnMasterData = buildQstnMasterDetails(displayNode);
															displayNode.optionsView = displayNode.qstnMasterData.optionsView;
															displayNode.EssayPageSize = displayNode.qstnMasterData.EssayPageSize;	
															displayNode.BlankSize = displayNode.qstnMasterData.BlankSize;
													
															// $scope.tree2.push(displayNode);
															SharedTabService.tests[currentIndex].questions.push(displayNode);
															for (var i = 0; i < SharedTabService.masterTests.length; i++) {
															    if (SharedTabService.masterTests[i].id === SharedTabService.tests[currentIndex].id) {
															        SharedTabService.masterTests[i].masterQuestions.push(angular.copy(displayNode));// is to check for dirty.
															    }
															}
															if (qBindings.length > 0) {
																$scope.renderQuestions(
																		qBindings,
																		currentIndex,
																		isAnyNodeAlreadyAdded);
															} else {
																$rootScope.blockPage.stop();
																renderCounter--;
																if(renderCounter == 0 && isAnyNodeAlreadyAdded===true){
								                            		$scope.IsConfirmation = false;
							                                    	$scope.message = "Question(s) already added to the test, cannot be added again.";
							                                    	$modal.open(confirmObject).result.then(function(ok) {
							                                    		if(ok) {
							                                    			renderCounter = 0;
							                                    		}
							                                    	});
																}
															}
														});
											});
									 
								
							};

							$scope.renderTest = function(questionBindings,
									title) {

								$scope.testTitle = title;

								// $scope.tree2 = [];

								QTI.initialize();
								renderCounter++;
								$scope.renderQuestions(questionBindings,
										$scope.currentIndex);
								/*$scope.BlockRightPanel.stop();*/
								
							}							
						
							$scope.saveAs_Test = function (title, containerFolder) {
							    var test = SharedTabService.tests[SharedTabService.currentTabIndex];
							    test.saveMode = EnumService.SAVE_MODE.SaveAs;
							    test.title = title;
							    test.tempFolderGuid = test.folderGuid;
							    test.folderGuid = containerFolder == null ? null : containerFolder.guid;
							    $scope.testTitle = title;
							    $scope.containerFolder = containerFolder;
							    $scope.saveTest();
							    $scope.testType = 'Test';
							}
							$scope.showMessage_EmptyTestTitle = function () {
							    $scope.IsConfirmation = false;
							    $scope.message = EnumService.ERROR_MESSAGES.EmptyTestTitle;
							    $modal.open(confirmObject);
							}
							// Function is to save the Test details with the
							// questions.
							
							$scope.showSaveErrorMessage = function(){
								var msg = e8msg.error.save;
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
							
							$scope.saveTest = function(callback) {
								$scope.editedQuestions = [];
								$scope.editedMigratedQuestions = [];
								
							    $rootScope.blockPage.start();
								var test = SharedTabService.tests[SharedTabService.currentTabIndex];
								if (test.title == null
										|| test.title.length <= 0) {
								    $scope.showMessage_EmptyTestTitle();
								    $rootScope.blockPage.stop();
									//$scope.IsConfirmation = false;
									//$scope.message = "Please Enter Test Title to save the test.";

									//$modal.open(confirmObject);
									return;
								}
								
								var exitSave = false ;								
								
								$.each(test.questions, function (index, qstn) {								
										if (qstn.IsEditView && (!$scope.IsAnswerSelected(qstn) || !$scope.IsFibBlankAdded(qstn))){
											exitSave = true;
											return;
										}												
								});
								
								if(exitSave){
									 $rootScope.blockPage.stop();
									 return ;
								}
								
                            	var duplicateTitle = false;
                            	
                                TestService.getTests(test.folderGuid, function(tests){
                                	if(tests==null){
            							$rootScope.blockPage.stop();
            							CommonService.showErrorMessage(e8msg.error.cantFetchTests)
                            			return;
            						}
                                    tests.forEach(function (folderTest) {
                                        if (test.saveMode === EnumService.SAVE_MODE.SaveAs && folderTest.title == test.title) {
                                            duplicateTitle = true;
                                        } else if (test.saveMode === EnumService.SAVE_MODE.Save && folderTest.guid !== test.testId && folderTest.title == test.title) {
                                            duplicateTitle = true;
                                        }
                                    });
                                    
                                    if (duplicateTitle ) {
                                        
                                    	$scope.IsConfirmation = false;
                                        $scope.message = "A test already exists with this name. Please save with another name.";
                                        $modal.open(confirmObject);
                                        if (test.saveMode === EnumService.SAVE_MODE.SaveAs) {
                                            test.folderGuid = test.tempFolderGuid;
                                            $scope.containerFolder = null;
                                        }
                                        if (callback) {
                                            callback();
                                        }
                                        test.saveMode = EnumService.SAVE_MODE.Save;
                                        $scope.setTestType();
                                        $rootScope.blockPage.stop();         							    
                                    	return;
                                    }

                                    if (test.saveMode === EnumService.SAVE_MODE.SaveAs) {
                                        test.testId = null;
                                        $scope.testGuid = null;
                                        test.saveMode = EnumService.SAVE_MODE.Save;
                                    }
                                                                        
    								$scope.testTitle = test.title;

    								// Building the json to create the test.
    								var testcreationdata = {
    									"metadata" : {
    										"crawlable" : "true"
    									},
    									"body" : {
    										"@context" : "http://purl.org/pearson/paf/v1/ctx/core/StructuredAssignment",
    										"@type" : "StructuredAssignment",
    										"assignmentContents" : {
    											"@contentType" : "application/vnd.pearson.paf.v1.assignment+json",
    											"binding" : []
    										}
    									}
    								};
    								testcreationdata.body.title = $scope.testTitle;
    								testcreationdata.body.guid = $scope.testGuid;

    								if (test.testId != null) {
    									testcreationdata.metadata = test.metadata;
    								}

    								testcreationdata.metadata.title = $scope.testTitle;

    								var index = 0;    								
    								var QuestionEnvelops = [];
    								var userSettings = {};
    								userSettings.questionMetadata = {};

    								$.each(SharedTabService.userQuestionSettings, function (index, value) {
    								    userSettings['questionMetadata'][value] = '';
    								});
    								
    								var editedQstns = $.grep(test.questions, function(qstn) {
    									 var QuestionEnvelop = buildQuestionEnvelop(qstn,userSettings);
    									QuestionEnvelops.push(QuestionEnvelop);    									
    								});
    								SharedTabService.tests[SharedTabService.currentTabIndex].IsAnyQstnEditMode=false;    
    								TestService.saveQuestions(QuestionEnvelops, function(questionsResult) {
    									
										if(questionsResult == null) {
											$rootScope.blockPage.stop();
											$scope.showSaveErrorMessage();
											return;
										}
										
    									var questionIndex = 0;
    									questionsResult.forEach(function(questionItem) {
    										var question = JSON.parse(questionItem);
    										var guid = question[0].guid;

    										
    										
    										if(test.questions[questionIndex].IsEdited) {
    											if(!test.questions[questionIndex].qstnTemplate){
    												$scope.editedMigratedQuestions.push(test.questions[questionIndex].guid);
    											}
    											test.questions[questionIndex].guid = guid;
    											test.questions[questionIndex].extendedMetadata = QuestionEnvelops[questionIndex].metadata.extendedMetadata; 
    											var createdQstnCopy = angular.copy(test.questions[questionIndex]);
    											$scope.editedQuestions.push(createdQstnCopy);
    										}else{
    											test.questions[questionIndex].guid = guid;
    										}
    										
    										test.questions[questionIndex].IsEdited = false; 
    										questionIndex = questionIndex + 1;
    										
    										testcreationdata.body.assignmentContents.binding
    												.push({
    													guid : guid,
    													activityFormat : "application/vnd.pearson.qti.v2p1.asi+xml",
    													bindingIndex : index
    												});
    										index = index + 1;
    									})									

    									TestService.saveTestData(testcreationdata, test.folderGuid, function(testResult) {
    										
    										if(testResult == null) {
    											$rootScope.blockPage.stop();
    											$scope.showSaveErrorMessage();
    											return;
    										}
    										
    									    var isEditMode = false,
                                                oldGuid = null,
                                                test = SharedTabService.tests[SharedTabService.currentTabIndex];

    									    if (test.testId) {
    									        isEditMode = true;
    									    }
    									    SharedTabService.currentTab = jQuery.extend(true, {}, test);
    									    oldGuid = test.id;
    									    test.testId = testResult.guid;
    									    test.id = testResult.guid;
    									    test.tabTitle = test.title;
    									    test.metadata = testcreationdata.metadata;

    									    if (test.treeNode && test.treeNode.testType === EnumService.TEST_TYPE.PublisherTest) {
    									        test.treeNode.testType = EnumService.NODE_TYPE.test;
    									        test.treeNode.showEditIcon = true;
    									    }
    										$scope.testGuid = testResult.guid;
    										$scope.newVersionBtnCss = "";
    										$scope.exportBtnCss = "";
    										
    										if (oldGuid !== test.id && test.treeNode) {//save as
    										    test.treeNode.showEditIcon = true;
    										    test.treeNode.showArchiveIcon= true;
    										    test.treeNode.draggable = true;
    										}
    										testResult.title = test.title;
    										testResult.modified = (new Date()).toJSON();
    										$rootScope.$broadcast('handleBroadcast_AddNewTest', testResult, $scope.containerFolder, isEditMode, oldGuid, $scope.editedQuestions, $scope.editedMigratedQuestions, test, $scope);
    										$scope.containerFolder = null; //clear selected folder in save as dialog popup.
                                             
    										

    										if (callback) {
    										    callback();
    										}
    										$rootScope.blockPage.stop();
    									});
    									        								
    								});                                                                
    								
								});

							}

							// Rendering the question as html
							$scope.getHTML = function(datanode) {
								if (datanode.node.length) {								
									return $sce
											.trustAsHtml(datanode.node[0].innerHTML);
								} else if (datanode.node) {								
									return $sce
									.trustAsHtml( datanode.node.textHTML);
								}
							}
							
							// Rendering the question as html while editing the question
							$scope.getEditedHTML = function(datanode) {
								if (datanode.node) {								
									return $sce
									.trustAsHtml( datanode.node.textHTML);
								}
							}
							
							

							// second tree model, place holder for the dragged
							// questions.
							// $scope.tree2 = [];

							// versioning
							/*
							 * $scope.versions = SharedTabService.versions;
							 * $scope.isQuestions = true; $scope.isAnswers =
							 * true;
							 * 
							 * $scope.isViewVersions = true;
							 * 
							 * $scope.selectedVersions =
							 * SharedTabService.versions[1]; $scope.noOfVersions =
							 * SharedTabService.versions[1].number;
							 * $scope.selectVersion = function (version) {
							 * $scope.noOfVersions = version.number; };
							 */
							$scope.createNewVersion = function(scope) {

								$scope.currentTab = SharedTabService.tests[SharedTabService.currentTabIndex];

								var scrambleType;
								if (scope.isQuestions && scope.isAnswers) {
									scrambleType = 2;
								} else if (scope.isQuestions) {
									scrambleType = 0;
								} else if (scope.isAnswers) {
									scrambleType = 1;
								}
								if (scrambleType == undefined) {
									$scope.IsConfirmation = false;
									$scope.message = "Please select scramble choice";
									$modal.open(confirmObject);
									/*
									 * this.alert("Please select scramble
									 * choice");
									 */
									return false;
								}

								$scope.versioningOptions = {
									"scrambleType" : scrambleType,
									"noOfVersions" : scope.noOfVersions
								};
								$scope.isViewVersions = scope.isViewVersions;

								$rootScope.blockPage.start();

								TestService.createVersions(this, function (scope, testResult) {
									if(testResult==null){
										$rootScope.blockPage.stop();
										CommonService.showErrorMessage(e8msg.error.cantCreateVersions);
			                    		return;
									}
								    try {
								        $scope.versionedTests = testResult;
								        $scope.currentTab = SharedTabService.tests[SharedTabService.currentTabIndex];
								        $scope.currentTab.modified = (new Date()).toJSON();
								        $scope.maping = {};
								        $scope.count = 0;

								        $scope.versionedTests.forEach(function (node) {
								            var testID = node.guid;
								            TestService.getMetadata(testID, function (result) {
								            	if(result==null){
								            		$rootScope.blockPage.stop();
									        		 CommonService.showErrorMessage(e8msg.error.cantFetchMetadata);
									         		return;
									        	 }
								            	result.draggable = false;
								            	result.showEditIcon = false;
							                    result.showArchiveIcon = false;
							                    
								                $scope.maping[node.guid] = result;
								                $scope.count = $scope.count + 1;
								                if ($scope.count == $scope.versionedTests.length) {
								                    $scope.bindTabs();
								                }
								            });
								        });

								        $scope.bindTabs = function () {
								            $scope.versionedTests.forEach(function (node) {
								                var treeNode = $scope.maping[node.guid];
								                if (treeNode.guid != node.guid) {
								                    return false;
								                }
								                treeNode.nodeType = EnumService.NODE_TYPE.test;
								                treeNode.folderGuid = $scope.currentTab.folderGuid;

								                if (SharedTabService.selectedMenu == SharedTabService.menu.myTest) {
								                    $rootScope.$broadcast('handleBroadcast_CreateVersion', SharedTabService.tests[SharedTabService.currentTabIndex], treeNode);
								                }
								                // create tabs
								                if ($scope.isViewVersions) {
								                    var newTestTab = new SharedTabService.Test(SharedTabService.tests[SharedTabService.currentTabIndex]);
								                    newTestTab.questions = [];
								                    newTestTab.id = treeNode.guid;
								                    newTestTab.testId = treeNode.guid;
								                    newTestTab.title = treeNode.title;
								                    newTestTab.tabTitle = treeNode.title;
								                    newTestTab.metadata = TestService.getTestMetadata(treeNode);
								                    newTestTab.treeNode = treeNode;
								                    newTestTab.folderGuid = (typeof (treeNode.folderId) == 'undefined') ? null : treeNode.folderId;
								                    if (!newTestTab.folderGuid) {
								                        newTestTab.folderGuid = (typeof (treeNode.folderGuid) == 'undefined') ? null : treeNode.folderGuid;
								                    }
								                    SharedTabService.prepForBroadcastTest(newTestTab);
								                }
								            });
								        };
								    } catch (e) {
								        console.log(e);
								    } finally {
								        $rootScope.blockPage.stop();
								    };
								});

								return true;
							}

							$scope.TestVersion_open = function() {
							    if (!SharedTabService.tests[SharedTabService.currentTabIndex].testId) {
							        return false;
							    }
							    SharedTabService.tests[SharedTabService.currentTabIndex].isBtnClicked=true;
								$modal.open({
											templateUrl : 'views/partials/testVersionPopup.html',
											controller : 'TestVersionCreationController',
											windowClass: 'testversion-Modal',
											backdrop : 'static',
											keyboard : false,
											resolve : {
												parentScope : function() {
													return $scope;
												}
											}
										});
							};

							$scope.open = function() {
							    if (!SharedTabService.tests[SharedTabService.currentTabIndex].testId) {
							        return false;
							    }
							    SharedTabService.tests[SharedTabService.currentTabIndex].isBtnClicked=true;
								$modal.open({
											templateUrl : 'views/partials/exportPopup.html',
											controller : 'ExportTestController',
											size : 'md',
											backdrop : 'static',
											keyboard : false,
											resolve : {
												parentScope : function() {
                                                    return $scope;
												}
											}
										});
							};
							
							$scope.print = function() {
							    if (!SharedTabService.tests[SharedTabService.currentTabIndex].testId) {
							        return false;
							    }
							    SharedTabService.tests[SharedTabService.currentTabIndex].isBtnClicked=true;
								$modal.open({
											templateUrl : 'views/partials/printPopup.html',
											controller : 'PrintTestController',
											size : 'lg',
											backdrop : 'static',
											keyboard : false,
											windowClass : 'print-Modal',
											resolve : {
												parentScope : function() {
                                                    return $scope;
												}
											}
										});
							};

						    // save confirmation on close button clicked..
						    //TODO: renamed 'Confirmation_Open' to 'open_CloseConfirmation'. need to remove this comment later, if there is no impact.
							$scope.open_CloseTabConfirmation = function (tab) {
							    $scope.closingTab = tab;
								$modal
										.open({
											templateUrl : 'views/partials/saveConfirmationPopup.html',
											controller : 'SaveConfirmationController',
											backdrop : 'static',
											keyboard : false,
											resolve : {
												parentScope : function() {
													return $scope;
												}
											}
										});
							}

							// #region Test wizard *************************

							$scope.SelecteNumberOnly = function(criteria) {
								criteria.numberOfQuestionsEntered = criteria.numberOfQuestionsEntered
										.replace(/[^\d]/g, '');
					        	if($scope.isApplySameCriteriaToAll)
								{
					        		$($scope.tests[$scope.sharedTabService.currentTabIndex].criterias).attr("numberOfQuestionsEntered",criteria.numberOfQuestionsEntered);
					    		}
								/*
								 * if (criteria.numberOfQuestionsEntered == 0) {
								 * criteria.numberOfQuestionsSelected =
								 * SharedTabService.setDefault_numberOfQuestionsSelected(criteria.totalQuestions); }
								 * else { criteria.numberOfQuestionsSelected =
								 * null; }
								 */
							}

							$scope.fillQuestionCount = function(criteria) {
								criteria.numberOfQuestionsEntered = null;
								if ($scope.isApplySameCriteriaToAll) {
									$(
											$scope.tests[$scope.sharedTabService.currentTabIndex].criterias)
											.attr("numberOfQuestionsEntered",
													null);
									$(
											$scope.tests[$scope.sharedTabService.currentTabIndex].criterias)
											.attr(
													"numberOfQuestionsSelected",
													criteria.numberOfQuestionsSelected);
								}
							}

							$scope.toggleQuestiontypeSelection = function(
									criteria, questiontype) {
								var idx = criteria.selectedQuestiontypes
										.indexOf(questiontype);
								if (idx > -1) {// is currently selected
									criteria.selectedQuestiontypes.splice(idx,
											1);
									if ($scope.isApplySameCriteriaToAll)
										$scope.sharedTabService
												.propagateSelectedQuestionTypes(
														$scope, idx,
														questiontype, false)
								} else { // is newly selected
									criteria.selectedQuestiontypes
											.push(questiontype);
									if ($scope.isApplySameCriteriaToAll)
										$scope.sharedTabService
												.propagateSelectedQuestionTypes(
														$scope, idx,
														questiontype, true)
								}

							};
							$scope.isApplySameCriteriaToAll = false;
							$scope.toggleApplySameCriteria = function(criteria) {
								$scope.isApplySameCriteriaToAll = !$scope.isApplySameCriteriaToAll
								if ($scope.isApplySameCriteriaToAll) {
									$scope.sharedTabService
											.propagateCriteria($scope);
								} else {
									$scope.sharedTabService
											.resetCriteriaToDefault($scope)
								}
							};

							$scope.previevTest = function() {
								var isError = false;
							    var metadatas = [];
								SharedTabService.errorMessages = [];
								$scope.sharedTabService.tests[$scope.sharedTabService.currentTabIndex].criterias
										.forEach(function(criteria) {
											if (criteria.selectedQuestiontypes.length) {
												var arr = [];
												criteria.metadata
														.forEach(function(item) {
															if (criteria.selectedQuestiontypes
																	.indexOf(item.quizType) != -1) {
																arr.push(item);
															}
														});
												arr = arr.sort(randomize);
												if (arr.length < criteria.numberOfQuestionsSelected) {
													var type = '';
													if (criteria.selectedQuestiontypes.length == 1) {
														type = criteria.selectedQuestiontypes[0];
														SharedTabService
																.addErrorMessage(
																		criteria.treeNode.title,
																		SharedTabService.errorMessageEnum.NotEnoughQuestionsAvailableForType_prefix
																				+ type
																				+ SharedTabService.errorMessageEnum.NotEnoughQuestionsAvailableForType_suffix);
													} else {

														for (var i = 0; i < criteria.selectedQuestiontypes.length; i++) {
															if (i == criteria.selectedQuestiontypes.length - 1) {
																type = type
																		.slice(
																				0,
																				-2);
																type += ' and '
																		+ criteria.selectedQuestiontypes[i];
															} else {
																type += criteria.selectedQuestiontypes[i]
																		+ ', ';
															}
														}
														SharedTabService
																.addErrorMessage(
																		criteria.treeNode.title,
																		SharedTabService.errorMessageEnum.NotEnoughQuestionsAvailableForType_prefix
																				+ type
																				+ SharedTabService.errorMessageEnum.NotEnoughQuestionsAvailableForTypes_suffix);
													}
													isError = true;

												}
											} else {
												var errorMessage=SharedTabService.errorMessageEnum.NoQuestionTypeSelected;
												if ($scope.isApplySameCriteriaToAll) {
													var errorMessage=SharedTabService.errorMessageEnum.NoQuestionTypeSelected_Subsection;
												}
												SharedTabService.addErrorMessage(criteria.treeNode.title, errorMessage);
												isError = true;
												arr = criteria.metadata
														.sort(randomize);
											}
											//assign the numberOfQuestionsEntered to numberOfQuestionsSelected only if there is 
											//no error while creating the test. 
											//ref : Bug 6582 - Radio button de-selected when alert message appears while creating Test using Test Wizard
										    /*
											if (criteria.numberOfQuestionsEntered > 0 && isError == false && !isTestTitleEmpty()) {
												criteria.numberOfQuestionsSelected = criteria.numberOfQuestionsEntered;
											}
                                            */
											var noOfQuestionsSelected = criteria.numberOfQuestionsEntered > 0 ? criteria.numberOfQuestionsEntered : criteria.numberOfQuestionsSelected; 
                                            if (!noOfQuestionsSelected || noOfQuestionsSelected > criteria.totalQuestions || noOfQuestionsSelected > arr.length) {
												criteria.isError = true;
												SharedTabService.addErrorMessage(criteria.treeNode.title, SharedTabService.errorMessageEnum.NotEnoughQuestionsAvailable);
												isError = true;
												return false;
											} else {
                                                metadatas = metadatas.concat(arr.slice(0, noOfQuestionsSelected));
											}
										});
								if (isError) {
									SharedTabService.TestWizardErrorPopup_Open(SharedTabService.errorMessages);
									return false;
								} else {
									var test = SharedTabService.tests[SharedTabService.currentTabIndex];
									if (isTestTitleEmpty(test)) {
										$scope.IsConfirmation = false;
										$scope.message = "Please enter test title to save the test.";

										$modal.open(confirmObject);
										return false;
									}
									test.criterias
											.forEach(function(criteria) {
												criteria.treeNode.isNodeSelected=false;
												criteria.treeNode.showEditQuestionIcon = false;
											})
								}
								$scope.tests[$scope.sharedTabService.currentTabIndex].tabTitle = "Untitled test";
								$scope.saveWizardTest(test, metadatas);
							}
							
							//validating and saving a test which is created using test wizard
							$scope.saveWizardTest = function(test, metadatas){
								var duplicateTitle = false;
								$rootScope.blockPage.start();
                                TestService.getTests(test.folderGuid, function(tests){
                                	if(tests==null){
            							$rootScope.blockLeftPanel.stop();
            							CommonService.showErrorMessage(e8msg.error.cantFetchTests)
                            			return;
            						}
                                    tests.forEach(function (folderTest) {
                                        if (test.saveMode === EnumService.SAVE_MODE.SaveAs && folderTest.title == test.title) {
                                            duplicateTitle = true;
                                        } else if (test.saveMode === EnumService.SAVE_MODE.Save && folderTest.guid !== test.testId && folderTest.title == test.title) {
                                            duplicateTitle = true;
                                        }
                                    });
                                    
                                    if (duplicateTitle ) {
                                        
                                    	$scope.IsConfirmation = false;
                                        $scope.message = "A test already exists with this name. Please save with another name.";
                                        $modal.open(confirmObject);
                                        test.saveMode = EnumService.SAVE_MODE.Save;
                                        $scope.setTestType();
                                        $rootScope.blockPage.stop();
                                    	return;
                                    }
                                    QTI.initialize();
                                    $scope.tests[$scope.sharedTabService.currentTabIndex].isTestWizard = false;
                                    $scope.sharedTabService.isTestWizardTabPresent = false;
                                    test.criterias=[];
                                    if (test.saveMode === EnumService.SAVE_MODE.SaveAs) {
                                        test.testId = null;
                                        $scope.testGuid = null;
                                        test.saveMode = EnumService.SAVE_MODE.Save;
                                    }
                                                                        
    								$scope.testTitle = test.title;

    								// Building the json to create the test.
    								var testcreationdata = {
    									"metadata" : {
    										"crawlable" : "true"
    									},
    									"body" : {
    										"@context" : "http://purl.org/pearson/paf/v1/ctx/core/StructuredAssignment",
    										"@type" : "StructuredAssignment",
    										"assignmentContents" : {
    											"@contentType" : "application/vnd.pearson.paf.v1.assignment+json",
    											"binding" : []
    										}
    									}
    								};
    								testcreationdata.body.title = $scope.testTitle;
    								testcreationdata.body.guid = $scope.testGuid;

    								if (test.testId != null) {
    									testcreationdata.metadata = test.metadata;
    								}

    								testcreationdata.metadata.title = $scope.testTitle;

    								var index = 0;    								
    								var userSettings = {};
    								userSettings.questionMetadata = {};

    								$.each(SharedTabService.userQuestionSettings, function (index, value) {
    								    userSettings['questionMetadata'][value] = '';
    								});
    								
    								
    								var questions = [];	
    								metadatas.forEach(function(questionItem){
    									questions.push(questionItem);
    								}); 
    								
    									var questionIndex = 0;
    									questions.forEach(function(individuaQuestionItem) {
    										var guid = individuaQuestionItem.guid;

    										testcreationdata.body.assignmentContents.binding
    												.push({
    													guid : guid,
    													activityFormat : "application/vnd.pearson.qti.v2p1.asi+xml",
    													bindingIndex : index
    												});
    										index = index + 1;
    									})									

    									TestService.saveTestData(testcreationdata, test.folderGuid, function(testResult) {
    										
    										if(testResult == null) {
    											$rootScope.blockPage.stop();
    											$scope.showSaveErrorMessage();
    											return;
    										}
    										
    									    var isEditMode = false,
                                                oldGuid = null,
                                                test = SharedTabService.tests[SharedTabService.currentTabIndex];

    									    if (test.testId) {
    									        isEditMode = true;
    									    }
    									    SharedTabService.currentTab = jQuery.extend(true, {}, test);
    									    oldGuid = test.id;
    									    test.testId = testResult.guid;
    									    test.id = testResult.guid;
    									    test.tabTitle = test.title;
    									    test.metadata = testcreationdata.metadata;

    									    if (test.treeNode && test.treeNode.testType === EnumService.TEST_TYPE.PublisherTest) {
    									        test.treeNode.testType = EnumService.NODE_TYPE.test;
    									        test.treeNode.showEditIcon = true;
    									    }
    										$scope.testGuid = testResult.guid;
    										$scope.newVersionBtnCss = "";
    										$scope.exportBtnCss = "";
    										
    										if (oldGuid !== test.id && test.treeNode) {
    										    test.treeNode.showEditIcon = true;
    										    test.treeNode.showArchiveIcon= true;
    										    test.treeNode.draggable = true;
    										}
    										testResult.title = test.title;
    										testResult.modified = (new Date()).toJSON();
    										
    										$scope.render(metadatas);
    								        $scope.isApplySameCriteriaToAll = false;
    									});
    									
								});
							}
							
							function randomize(a, b) {
								return Math.random() - 0.5;
							}
							var isTestTitleEmpty = function(test) {
								if(test == null)
									test = SharedTabService.tests[SharedTabService.currentTabIndex];
								if (test.title == null
										|| test.title.length <= 0)
									return true;
								else
									return false;
							}
							// TODO: code optimization is need.
							$scope.render = function(metadatas) {
								if (metadatas.length == 0) {
									return false;
								}

								var question = metadatas.shift();
								
								 var userSettings= {};	
								 userSettings.questionMetadata = {};
								 
								 $.each(SharedTabService.userQuestionSettings, function( index, value ) {	
									 userSettings['questionMetadata'][value]='';																										
									});			

								TestService
										.getQuestionById(
												question.guid,
												function(response) {
													if(response == null){
														$scope.blockPage.stop();
									        			CommonService.showErrorMessage(e8msg.error.cantFetchQuestions)
									        			return;
													}
													var displayNodes = $("<div></div>");	
													QTI.BLOCKQUOTE.id = 0;
													QTI.play(response,
													displayNodes, false,false,question.quizType);
													var displayNode = {};

													displayNode.guid = question.guid;
													displayNode.textHTML = displayNodes.html();
													
													displayNode.IsEditView = false;
													
													displayNode.data = 	response;
													displayNode.quizType = 	question.quizType;
													
													displayNode.questionMetadata = userSettings.questionMetadata;
													displayNode.extendedMetadata = question.extendedMetadata;
													
													 displayNode.IsUserMetdataAvailable = false;
													 if (SharedTabService.userQuestionSettings.length>0){
														 displayNode.IsUserMetdataAvailable = true;
													 }
													$.each(displayNode.extendedMetadata, function(index, item){																							
														var name = item['name'].charAt(0).toUpperCase() + item['name'].slice(1);
										                if((typeof(displayNode['questionMetadata'][name])!='undefined')||((typeof(displayNode['questionMetadata']['Difficulty'])!='undefined') && (name=='QuestionLevelOfDifficulty'))) {
										                	if (item['name'] == "questionLevelOfDifficulty")
										                		displayNode['questionMetadata']['Difficulty'] = item['value'];
										                	else{
										                		
										                		displayNode['questionMetadata'][name] = item['value'].replace(/&ndash;/g, '-');
										                	}
										                }
													});
													
													
													displayNode.selectedLevel = displayNode.questionMetadata['Difficulty']==undefined?{name:'Select Level',value:'0'}:{name:displayNode.questionMetadata['Difficulty'],value:displayNode.questionMetadata['Difficulty']};
													
													displayNode.qstnMasterData = buildQstnMasterDetails(displayNode);
													displayNode.optionsView = displayNode.qstnMasterData.optionsView;
													displayNode.EssayPageSize = displayNode.qstnMasterData.EssayPageSize;
																							
													// $scope.tree2.push(displayNode);
													SharedTabService.tests[SharedTabService.currentTabIndex].questions
															.push(displayNode);
													SharedTabService.masterTests[SharedTabService.currentTabIndex].masterQuestions
															.push(angular.copy(displayNode));// is
																				// to
																				// check
																				// for
																				// dirty.
													if (metadatas.length > 0) {
														$scope
																.render(
																		metadatas,
																		SharedTabService.currentTabIndex);
													} else {
													     $scope.blockPage.stop();
													}
												});
							};
						    // #endregion Test wizard *************************

						    //Open Save-As Test dialog model popup.
							$scope.openSaveAsTestDialog = function () {
							    $modal.open({
							        templateUrl: 'views/partials/save-test-dialog-popup.html',
							        controller: 'SaveTestDialogController',
							        size: 'md',
							        backdrop: 'static',
							        keyboard: false,
							        resolve: {
							            parentScope: function () {
							                return $scope;
							            }
							        }
							    });
							}

						    // #region Broadcast handles
							$scope.$on('handleBroadcast_ClickTab', function (event, test) {
							    $scope.onClickTab(test)
							});
							$scope.$on('handleBroadcastTests', function () {
							    $scope.tests = SharedTabService.tests;
							});
							$scope.$on('handleBroadcastCurrentTabIndex', function () {
							    $scope.currentIndex = SharedTabService.currentTabIndex;
							});
							$scope.$on('handleBroadcast_AddNewTab', function () {
							    $scope.addNewTest($scope);
							});
							$scope.$on('handleBroadcast_AddTestWizard', function () {
								$scope.isApplySameCriteriaToAll = false;
							    resetTabs();
							    SharedTabService.addTestWizard($scope);
							});
							$scope.$on('handleBroadcast_createTestWizardCriteria',
											function (event, response,currentNode) {
								
											    $scope.addTestWizardCriteria(
											    		response, currentNode);
											});
							$scope.$on('handleBroadcast_AddQuestionsToTest', function (event, response, currentNode,questionFolder, isAnyNodeAlreadyAdded) {
							    QTI.initialize();
							    renderCounter++;
							    response = $.grep(response,function(obj, index){							    	
							    	var find = false;
							    	SharedTabService.tests[SharedTabService.currentTabIndex].questions.forEach(function(item){
							    		if(item.guid == obj.guid)
							    			find = true;
							    	})
							    	return !find;
							    })
							    
							    $scope.renderQuestions(response,
                                        $scope.currentIndex,
                                        isAnyNodeAlreadyAdded);
							})
						    // #endregion Broadcast handles
							
							
							
							
							function filterEditorDefaultPtag(ModifiedOptions){
								var Options = [];
								$.each(ModifiedOptions,
										function(index,option) {
									if(option.startsWith('<p>')){
										option = option.substring(3, option.length-4);
									}			
									Options.push(option);
								});
								
								return Options;
								
							}
							
							function matchingOptions(matchingOptions){
								var Options = [];
								$.each(matchingOptions,
										function(index,option) {
									if(option.matchingOption.startsWith('<p>')){
										Options.push(option.matchingOption.substring(3, option.matchingOption.length-4));
									}else{
										Options.push(option.matchingOption);
									}			
								});
								
								return Options;
								
							}
							
							function leftOptions(matchingOptions){
								var Options = [];
								$.each(matchingOptions,
										function(index,Option) {
									if(Option.option.startsWith('<p>')){
										Options.push(Option.option.substring(3, Option.option.length-4));
									}else{
										Options.push(Option.option);
									}			
								});
								
								return Options;
								
							}
							
							function getQuestionMasterDataModel(node) {								

								var qstnMasterDataModel = {};            
								qstnMasterDataModel.Caption = node.qtiModel.Caption;

								if (typeof String.prototype.startsWith != 'function') {
									// see below for better implementation!
									String.prototype.startsWith = function (str){
										return this.indexOf(str) === 0;
									};
								}

								if(qstnMasterDataModel.Caption.startsWith('<p>')){
									qstnMasterDataModel.Caption = qstnMasterDataModel.Caption.substring(3, qstnMasterDataModel.Caption.length-4);
								}			

								var questionMetadata = angular.copy(node.questionMetadata);
								qstnMasterDataModel.questionMetadata = questionMetadata;										

								switch (node.quizType) {
								case 'MultipleChoice':
								case 'MultipleResponse':
								case 'TrueFalse':					
									qstnMasterDataModel.Options = filterEditorDefaultPtag(node.qtiModel.Options);											
									qstnMasterDataModel.CorrectAnswer =  node.qtiModel.CorrectAnswer;
									qstnMasterDataModel.Orientation = node.qtiModel.Orientation;						
									break;

								case 'Essay':						
									qstnMasterDataModel.EssayPageSize =node.qtiModel.EssayPageSize;			
									qstnMasterDataModel.RecommendedAnswer = node.qtiModel.RecommendedAnswer;						
									break;					

								case 'Matching':	
									qstnMasterDataModel.leftOptions = leftOptions(node.qtiModel.Options);	
									qstnMasterDataModel.rightOptions = matchingOptions(node.qtiModel.Options);
									break;

								case 'FillInBlanks':		
									qstnMasterDataModel.CorrectAnswerHtml = node.CorrectAnswerHtml;		
									break;
								}			

								return qstnMasterDataModel;

							}

							function getQuestionModifiedModel(node) {								

								var qstnModifiedData = {};            
								qstnModifiedData.Caption = node.qtiModel.Caption;

								if (typeof String.prototype.startsWith != 'function') {
									// see below for better implementation!
									String.prototype.startsWith = function (str){
										return this.indexOf(str) === 0;
									};
								}

								if(qstnModifiedData.Caption.startsWith('<p>')){
									qstnModifiedData.Caption = qstnModifiedData.Caption.substring(3, qstnModifiedData.Caption.length-4);
								}			
								qstnModifiedData.questionMetadata = node.questionMetadata;		

								switch (node.quizType) {
								case 'MultipleChoice':
								case 'MultipleResponse':
								case 'TrueFalse':		
									qstnModifiedData.Options = filterEditorDefaultPtag(node.qtiModel.Options);											
									qstnModifiedData.CorrectAnswer =  node.qtiModel.CorrectAnswer;
									qstnModifiedData.Orientation = node.qtiModel.Orientation;						
									break;

								case 'Essay':						
									qstnModifiedData.EssayPageSize =node.qtiModel.EssayPageSize;			
									qstnModifiedData.RecommendedAnswer = node.qtiModel.RecommendedAnswer;					
									break;					

								case 'Matching':	
									qstnModifiedData.leftOptions = leftOptions(node.qtiModel.Options);	
									qstnModifiedData.rightOptions = matchingOptions(node.qtiModel.Options);
									break;

								case 'FillInBlanks':										
									qstnModifiedData.CorrectAnswerHtml = node.CorrectAnswerHtml;	
									break;
								}			

								return qstnModifiedData;

							}


							$scope.IsQuestionModified = function(node){
								var qstnModifiedData = getQuestionModifiedModel(node);		
								if (typeof (node.qstnModelMasterData) == 'undefined'){
									node.qstnModelMasterData = getQuestionMasterDataModel(node)
								}

								return !angular.equals(node.qstnModelMasterData,qstnModifiedData);
							}

							var buildQuestionEnvelop = function(qstn,userSettings){
								
								if(qstn.IsEditView){    	
									
									if(qstn.quizType=='FillInBlanks'){
										updateFIBQuestionAnswers(qstn);		
									}    										
									
									if(!qstn.qstnTemplate){    										
										qstn.IsEdited =  $scope.IsQuestionModified(qstn);
									}
									
								}								
								
								if(qstn.IsEdited){
									qstn.data = QtiService.getQtiXML(qstn);
								}    
								
								qstn.IsEditView = false;								
								
								if(qstn.qstnTemplate){
                                    qstn.qstnTemplate = false;
                                }    								
								
								if (typeof (qstn.questionMetadata) == 'undefined') {

								    qstn.questionMetadata = userSettings.questionMetadata;

								    $.each(qstn.extendedMetadata, function (index, item) {

								        if (typeof (qstn['questionMetadata'][item['name']]) != 'undefined') {
								            qstn['questionMetadata'][item['name']] = item['value'].replace(/&ndash;/g, '-');
								        }

								    });
								    qstn.selectedLevel = qstn.questionMetadata['Difficulty'] == undefined ? { name: 'Select Level', value: '0' } : { name: qstn.questionMetadata['Difficulty'], value: qstn.questionMetadata['Difficulty'] };
								}
								var qstnExtMetadata=[];													
							
								$.each(qstn.questionMetadata, function(KeyName, KeyValue){		
									if(KeyName == "Difficulty"){
										KeyValue = qstn.selectedLevel.value;
									}
									qstnExtMetadata.push({name:KeyName,value:KeyValue}) ;
								});													
																				
								var QuestionEnvelop = {
									metadata : {
										guid : qstn.IsEdited ? null
												: qstn.guid,
                                        title : qstn.title,
										description : qstn.description,
										quizType : qstn.quizType,
										subject : qstn.subject,
										timeRequired : qstn.timeRequired,
										crawlable : qstn.crawlable,
										keywords : qstn.keywords,
										versionOf : qstn.versionOf,
										version : qstn.version,
										extendedMetadata : qstnExtMetadata
									},
									body : qstn.IsEdited ? qstn.data : null
								};
								
								return QuestionEnvelop;
							}
							
							var updateFIBQuestionAnswers = function(qstn){
								qstn.qtiModel.CorrectAnswerHtml = $('#fbAnswerContainer').html();										
							}
							
							$scope.IsAnswerSelected = function(node){				
								if(node.IsEditView && node.quizType=='MultipleResponse'){
									var answerSelected=false;
									$.each(node.qtiModel.CorrectAnswer,
											function(index,answer) {
										if(answer){
											answerSelected=true;						
										}
									});				
									if(!answerSelected){
										SharedTabService.tests[SharedTabService.currentTabIndex].IsAnyQstnEditMode = true;
										$scope.IsConfirmation = false;
										$scope.message = "Atleast one correct Answer should be defined."
										$modal.open(confirmObject);			
										return false;
									}									
									
								}
								return true;
							}
							
							$scope.IsFibBlankAdded = function(node){		
								if(node.IsEditView && node.quizType=='FillInBlanks'){
									var qstnCaption = $(node.qtiModel.Caption);
									var blankLen = $(qstnCaption).find('button').length;
																		
									if(blankLen<=0){			
										SharedTabService.tests[SharedTabService.currentTabIndex].IsAnyQstnEditMode = true;
										$scope.IsConfirmation = false;
										$scope.message = "Atleast One Blank should be defined."
										$modal.open(confirmObject);			
										return false;
										
									}
								}
								return true;
							}

							
							if (navigator.userAgent.indexOf('Mac OS X') != -1) {
							    $scope.wizardClass = "wizardWhiteMac"
							} else {
							    $scope.wizardClass = "wizardWhite";
							}

						} ]);