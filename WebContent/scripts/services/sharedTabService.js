'use strict';

angular.module('evalu8Demo')

.service('SharedTabService',
		['$rootScope', '$modal','blockUI',
		 function ($rootScope, $modal,blockUI) {

		     var sharedTabService = {};
		     sharedTabService.tests = [];
		     sharedTabService.masterTests = []; // is to track isDirty.
		     sharedTabService.currentTab;
		     sharedTabService.currentTabIndex = 0;		    
		     
		     sharedTabService.userQuestionSettings=[];

		     sharedTabService.menu = { "myTest": 1, "questionBanks": 2 };
		     sharedTabService.selectedMenu;
		     sharedTabService.isTestWizardTabPresent = false;

		     sharedTabService.Test = function (test) {
		         if (test) {
		             this.id = "tab" + (new Date).getTime();
		             this.testId = test.testId;
		             this.folderGuid = test.folderGuid;
		             this.title = test.title;
		             this.tabTitle = test.tabTitle;
		             this.course = test.course;
		             this.questions = test.questions;
		             this.criterias = test.criterias;
		             this.metadata = test.metadata;
		             this.IsAnyQstnEditMode = false;
		         } else {
		             this.id = "tab" + (new Date).getTime();
		             this.testId = null;
		             this.folderGuid = null;
		             this.title;
		             this.tabTitle = "Untitled test";
		             this.course;
		             this.metadata = [];
		             this.questions = [];
		             this.criterias = [];
		             this.scope;
		             this.IsAnyQstnEditMode = false;
		         }
		         this.masterQuestions = [];
		         this.isSaveAndClose = false;
		         this.isTestWizard = false;
		         this.treeNode = null;
		         this.questionFolderNode = [];
		     }

		     sharedTabService.Criteria = function () {
		         this.id = "criteria" + (new Date).getTime();
		         this.folderId = null;
		         this.folderTitle = null;
		         this.totalQuestions = null;
		         this.defaultNumberOfQuestions = [];
		         //this.numberOfQuestions = null;
		         this.numberOfQuestionsEntered = null;
		         this.numberOfQuestionsSelected = null;
		         this.questiontypes = [];
		         this.selectedQuestiontypes = [];
		         this.metadata = null;
		         this.treeNode = null;
		         this.scope;
		         this.isError = false;
		     }

		     sharedTabService.QuestionTypes = [
				                 		         { key: "Essay", value: "Essay" },
				                                  { key: "MultipleResponse", value: 'Multiple response' },
				                                  { key: "Matching", value: 'Matching' },
				                                  { key: "FillInBlanks", value: 'Fill in Blanks' },
				                                  { key: "MultipleChoice", value: 'Multiple Choice' },
				                                  { key: "TrueFalse", value: 'True False' },
		     ];

		     sharedTabService.createDefaultTest = function () {
		         var defaultTest = new sharedTabService.Test();
		         sharedTabService.tests.push(defaultTest);
		         var clonedTest = new sharedTabService.Test(defaultTest);
		         clonedTest.id = defaultTest.id;
		         sharedTabService.masterTests.push(clonedTest);
		     }
		     sharedTabService.createDefaultTest();

		     sharedTabService.clear = function () {
		         this.tests = [];
		         this.masterTests = [];
		         sharedTabService.createDefaultTest();
		         /*defaultTest = new sharedTabService.Test();
		         sharedTabService.tests.push(defaultTest);*/
		         sharedTabService.currentTab = null;
		         sharedTabService.currentTabIndex = 0;
		         this.broadcastTests();
		     };

		     sharedTabService.prepForBroadcastTest = function (test) {
		         //Dont delete below commented lines, its commented to fix below mentioned issed.
                 //will delete after few days, if there is no impacts.
		         //Bug 6311 - 'New Tab' button is not working if there is no Tests opened in right frame
                 /*
		         if (sharedTabService.tests.length == 1 && sharedTabService.isEmptyTab(sharedTabService.tests[0]) && !sharedTabService.tests[0].isTestWizard) {
		             sharedTabService.tests = [];
		             sharedTabService.masterTests = [];
		         }*/
		         this.tests.push(test);
		         var clonedTest = new sharedTabService.Test(test);
		         clonedTest.id = test.id;
		         this.masterTests.push(clonedTest); // is to track isDirty.
		         this.broadcastTests();
		     };
		     sharedTabService.broadcastTests = function () {
		         $rootScope.$broadcast('handleBroadcastTests');
		     };
		     sharedTabService.prepForBroadcastCurrentTabIndex = function (currentTabIndex) {
		         this.currentTabIndex = currentTabIndex;
		         this.broadcastCurrentTabIndex();
		     };
		     sharedTabService.broadcastCurrentTabIndex = function () {
		         $rootScope.$broadcast('handleBroadcastCurrentTabIndex');
		     };

		     sharedTabService.addNewTest = function (scope) {
		         var newTest = new sharedTabService.Test();
		         //newTest.title = newTest.title + " " + scope.tests.length;
		         sharedTabService.currentTab = newTest;
		         sharedTabService.prepForBroadcastTest(newTest);
		         sharedTabService.onClickTab(newTest, scope);
		         $('#testCaption').val('');
		         scope.newVersionBtnCss = "disabled";
		         scope.exportBtnCss = "disabled";
		     }
		     //TODO : need to do code optimization.
		     sharedTabService.addTestWizard = function (scope) {
		    	 var blockRightPanel = blockUI.instances.get('RightPanel');
					blockRightPanel.start();
		         var newTest = new sharedTabService.Test();
		         newTest.tabTitle = "Test Wizard";
		         newTest.isTestWizard = true;
		         sharedTabService.currentTab = newTest;
		         sharedTabService.prepForBroadcastTest(newTest);
		         sharedTabService.onClickTab(newTest, scope);
		         $('#testCaption').val('');
		         scope.newVersionBtnCss = "disabled";
		         scope.exportBtnCss = "disabled";
		         //scope.isTestWizardTabPresent = true;
		         sharedTabService.isTestWizardTabPresent = true;
		         blockRightPanel.stop();
		     }

		     var DefaultNumberOfQuestions = [10, 20, 30,""];
		     sharedTabService.addTestWizardCriteria = function (scope, test, response, currentNode) {
		         var newCriteria = new sharedTabService.Criteria();
		         newCriteria.folderId = currentNode.guid;
		         newCriteria.folderTitle = currentNode.title;
		         newCriteria.totalQuestions = response.length;
		         newCriteria.defaultNumberOfQuestions = DefaultNumberOfQuestions;
		         newCriteria.numberOfQuestionsSelected = sharedTabService.setDefault_numberOfQuestionsSelected(response.length);
		         newCriteria.questiontypes = getQuestionTypesPresent(response);
		         newCriteria.selectedQuestiontypes = [];
		         newCriteria.scope = scope;
		         newCriteria.metadata = response;
		         newCriteria.treeNode = currentNode;
		         test.criterias.push(newCriteria);
		     }
		     sharedTabService.setDefault_numberOfQuestionsSelected = function (QuestionCount) {
		         if (QuestionCount < 20) {
		             return DefaultNumberOfQuestions[0];
		         } else {
		             return DefaultNumberOfQuestions[1];
		         }
		     }
		     function getQuestionTypesPresent(questions) {
		         var questionsTypes = [];
		         $.each(questions, function (i) {
		             if (questionsTypes.indexOf(questions[i].quizType) == -1) {
		                 questionsTypes.push(questions[i].quizType);
		             }
		         });
		         return questionsTypes;
		     }

		     sharedTabService.errorMessages = [];
		     sharedTabService.errorMessageEnum = {
		         NotEnoughQuestionsAvailable: 'Please select additional question banks or reduce the number of questions in your test.',
		         NotEnoughQuestionsAvailableForType_prefix: 'Not enough questions available of ',
		         NotEnoughQuestionsAvailableForType_suffix: ' type, Please select additional question banks or reduce the number of questions in your test.',
		         NotEnoughQuestionsAvailableForTypes_suffix: ' types, Please select additional question banks or reduce the number of questions in your test.',
		         NoQuestionTypeSelected: 'No Question Type selected, please select question Type first and click on "Create Test" button',
		         ChapterIsAlreadyAdded: 'This topic is included in the chapter already added to Test Wizard. If you wish to add separate topics from a chapter, delete the chapter in the Test Wizard first.',
		         TopicInChapterIsAlreadyAdded: 'This chapter includes the topic(s) that you have already added to the Wizard. If you want to  add the entire chapter, please delete the topic(s) in the Wizard first.',
		         NoQuestionsAvailable: 'No questions available.',
		         AlreadyAdded: 'Chapter or topic is already added'
		     };
		     sharedTabService.isErrorExist = function (currentNode, selectedNodes) {
		         var isExist = false;
		         sharedTabService.errorMessages = [];
		         var deSelectNodes = [];
		         $.each(selectedNodes, function (i) {
		             $.each(selectedNodes, function (j) {
		                 if (selectedNodes[i].guid === selectedNodes[j].parentId) {
		                     deSelectNodes.push(selectedNodes[j]);
		                 }
		             });
		         });
		         $.each(deSelectNodes, function (i) {
		             sharedTabService.deSelectNode(selectedNodes, deSelectNodes[i]);
		         });

		         $.each(sharedTabService.tests[sharedTabService.currentTabIndex].criterias, function (i) {
		             if (sharedTabService.tests[sharedTabService.currentTabIndex].criterias[i].treeNode.guid === currentNode.guid) {
		                 isExist = true;
		                 sharedTabService.addErrorMessage(currentNode.title, sharedTabService.errorMessageEnum.AlreadyAdded);
		                 return false;
		             } else if (sharedTabService.tests[sharedTabService.currentTabIndex].criterias[i].treeNode.guid === currentNode.parentId) {
		                 isExist = true;
		                 sharedTabService.addErrorMessage(currentNode.title, sharedTabService.errorMessageEnum.ChapterIsAlreadyAdded);
		                 return false;
		             } else if (sharedTabService.tests[sharedTabService.currentTabIndex].criterias[i].treeNode.parentId === currentNode.guid) {
		                 isExist = true;
		                 sharedTabService.addErrorMessage(currentNode.title, sharedTabService.errorMessageEnum.TopicInChapterIsAlreadyAdded);
		                 return false;
		             }
		         });
		         return isExist;
		     }
		     sharedTabService.deSelectNode = function (selectedNodes, node) {
		         for (var i = 0; i < selectedNodes.length; i++) {
		             if (selectedNodes[i].guid == node.guid && node.showTestWizardIcon) {
		                 selectedNodes.splice(i, 1);
		                 node.isNodeSelected = !node.isNodeSelected;
		                 break;
		             }
		         }
		     };

		     sharedTabService.addErrorMessage = function (criteria, message) {
		         sharedTabService.errorMessages.push({ criteria: criteria, message: message });
		     }

		     sharedTabService.TestWizardErrorPopup_Open = function (errorMessages) {
		         $modal.open({
		             templateUrl: 'views/partials/testWizardErrorPopup.html',
		             controller: 'TestWizardErrorPopupController',
		             backdrop: 'static',
		             keyboard: false,
		             resolve: {
		                 errorMessages: function () {
		                     return sharedTabService.errorMessages;
		                 }
		             }
		         });
		     }

		     sharedTabService.editTest = function (scope) {
		         var isOpen = false;
		         $.each(scope.tests, function (i) {
		             if (scope.tests[i].id === scope.testGuid) {
		                 scope.tests[i].scope = scope;
		                 sharedTabService.tests[i].questions = [];
		                 sharedTabService.onClickTab(scope.tests[i], scope);
		                 isOpen = true;
		                 return false;
		             }
		         });
		         if (isOpen) {
		             return false;
		         }
		         var test = new sharedTabService.Test();
		         test.id = scope.testGuid;
		         test.testId = scope.testGuid;
		         test.folderGuid = scope.folderGuid;
		         test.title = scope.testTitle;
		         test.tabTitle = scope.testTitle;
		         test.course = scope.courseFolder;
		         if (scope.tree2 !== undefined) {
		             test.questions = scope.tree2;
		         }
		         test.metadata = scope.metadata;
		         test.treeNode = scope.selectedTestNode;

		         sharedTabService.currentTab = test;
		         //if (sharedTabService.tests.length == 1 && sharedTabService.isEmptyTab(sharedTabService.tests[0])) {
		         //    sharedTabService.tests = [];
		         //    sharedTabService.masterTests = [];
		         //}
		         //push test object to tests array.
		         sharedTabService.prepForBroadcastTest(test);

		         sharedTabService.onClickTab(test, scope);

		     }

		     sharedTabService.onClickTab = function (test, scope) {
		         sharedTabService.currentTab = test;
		         $.each(scope.tests, function (i) {
		             if (scope.tests[i].id === test.id) {
		                 sharedTabService.currentTabIndex = i;
		                 sharedTabService.prepForBroadcastCurrentTabIndex(i);
		                 $rootScope.$broadcast("handleBroadcast_onClickTab", test);
		                 return false;
		             }
		         });
		     }

		     sharedTabService.showSelectedTestTab = function (testId) {
		         $.each(sharedTabService.tests, function (i) {
		             if (sharedTabService.tests[i].id === testId) {
		                 sharedTabService.currentTab = sharedTabService.tests[i];
		                 sharedTabService.currentTabIndex = i;
		                 sharedTabService.prepForBroadcastCurrentTabIndex(i);
		                 return false;
		             }
		         });
		     }

		     sharedTabService.isActiveTab = function (tabUrl, scope) {
		         if (scope.tests.length == 1) {
		             return true;
		         }
		         return tabUrl == sharedTabService.currentTab.id;
		     }


		     //close tab
		     sharedTabService.closeTabWithConfirmation = function (tab, scope) {
		         //sharedTabService.onClickTab(tab, scope);
		         if (sharedTabService.tests.length == 1 && sharedTabService.isEmptyTab(tab) && !sharedTabService.tests[0].isTestWizard) {//if only one empty tab present. 
		             return false;
		         }
		         var isComeOutFreomLoop = false;
		         $.each(scope.tests, function (i) {
		             if (scope.tests[i].id === tab.id) {

		                 if (sharedTabService.isEmptyTab(tab) || sharedTabService.masterTests.length == 0) // if empty tab.
		                 {
		                     removeTest(i, scope, tab);
		                     sharedTabService.removeMasterTest(tab);
		                     //scope.tests.splice(i, 1);
		                     return false;
		                 }

		                 $.each(sharedTabService.masterTests, function (j) {
		                     if (sharedTabService.masterTests[j].id === tab.id) {
		                         if (sharedTabService.isDirty(sharedTabService.masterTests[j], scope.tests[i])) {
		                             removeTest(i, scope, tab);
		                             removeMasterTestByIndex(j);
		                             //scope.tests.splice(i, 1);
		                         } else {
		                             scope.open_CloseTabConfirmation();
		                         }
		                         isComeOutFreomLoop = true;
		                         return false;
		                     }
		                 });
		                 if (isComeOutFreomLoop) {
		                     return false;
		                 }
		                 sharedTabService.closeTab(tab, scope);
		                 return false;
		             }
		         });
		     }

		     //close tab Without Save.
		     sharedTabService.closeTab = function (tab, scope) {
		         //sharedTabService.onClickTab(tab, scope);
		         $.each(scope.tests, function (i) {
		             if (scope.tests[i].id === tab.id) {
		                 removeTest(i, scope, tab);
		                 sharedTabService.removeMasterTest(tab);
		                 return false;
		             }
		         });
		         if (sharedTabService.tests.length == 0) {
		             sharedTabService.addNewTest(scope);
		         }
		     }

		     sharedTabService.closeQuestions = function(tab, scope ,index){
		    	 var node = scope.tests[scope.currentIndex].questions[index];
		    	 scope.tests[scope.currentIndex].questions.splice(index,1);
		    	 scope.tests[scope.currentIndex].IsAnyQstnEditMode = false;
		    	 $rootScope.$broadcast("handleBroadcast_deselectQuestionNode", node);
		     }
		     
		     sharedTabService.removeMasterTest = function (test) {
		         $.each(sharedTabService.masterTests, function (i) {
		             if (sharedTabService.masterTests[i].id === test.id) {
		                 removeMasterTestByIndex(i);
		                 return false;
		             }
		         });
		     }
		     sharedTabService.addMasterTest = function (test) {
		         var clonedTest = new sharedTabService.Test(test);
		         clonedTest.id = test.id;
		         $.each(test.questions, function (i) {
		             clonedTest.masterQuestions.push(test.questions[i]);
		         });
		         sharedTabService.masterTests.push(clonedTest);
		     }
		     var removeTest = function (index, scope, test) {
		         if (test.isTestWizard) {
		             //scope.isTestWizardTabPresent = false;
		             sharedTabService.isTestWizardTabPresent = false;
		             showTestWizardIcons(test);
		         }
		         scope.tests.splice(index, 1);
		         if (test.treeNode) {
		             test.treeNode.showEditIcon = true;
		             test.treeNode.showArchiveIcon = true;
		         }else{
		        	 showQuestionEditIcons(test);
		         }

		         if (index == scope.tests.length) {
		             scope.currentIndex--;
		         }
		         sharedTabService.onClickTab(sharedTabService.tests[scope.currentIndex], scope);

		         if (sharedTabService.tests.length == 0) {
		             sharedTabService.addNewTest(scope);
		         }
		         $rootScope.$broadcast("handleBroadcast_closeTab", test);
		     }

		     var removeMasterTestByIndex = function (index) {
		         sharedTabService.masterTests.splice(index, 1);
		     }
		     
		     var showQuestionEditIcons=function (test){
		    	 for (var i = 0; i < test.questionFolderNode.length; i++) {
		             test.questionFolderNode[i].showEditQuestionIcon = true;
		         }
		     }
		     
		     var showTestWizardIcons = function (test) {
		         for (var i = 0; i < test.criterias.length; i++) {
		             test.criterias[i].treeNode.showTestWizardIcon = true;
		             //test.criterias[i].treeNode.isNodeSelected=false;
		             $rootScope.$broadcast("handleBroadcast_deselectedNode", test.criterias[i].treeNode);
		         }
		     }

		     sharedTabService.isDirty = function (masterTest, test) {

		         var isDirty = false;
		         if (test.testId == null && (test.title != "" || test.questions.length > 0)) { //empty node without save.
		             isDirty = true;
		         }
		         else if (masterTest.title != test.title) {
		             isDirty = true;
		         } else if (masterTest.questions.length != test.questions.length || masterTest.questions.length != masterTest.masterQuestions.length) {
		             isDirty = true;
		         } else {
		             for (var i = 0; i < masterTest.questions.length; i++) {
		                 if (masterTest.questions[i].guid != masterTest.masterQuestions[i].guid) {
		                     isDirty = true;
		                     return false;
		                 }
		             }
		         }
		         return !isDirty;
		     }

		     sharedTabService.isEmptyTab = function (test) {
		         if (test.testId == null && test.title == undefined && test.questions.length == 0) {
		             return true;
		         }
		         return false;
		     }

		     //Test wizard
		     sharedTabService.closeCriteria = function (criteria, scope) {
		         $.each(sharedTabService.tests[scope.currentIndex].criterias, function (i) {
		             if (sharedTabService.tests[scope.currentIndex].criterias[i].id === criteria.id) {
		            	 sharedTabService.tests[scope.currentIndex].criterias[i].treeNode.showTestWizardIcon=true;
		            	 //sharedTabService.tests[scope.currentIndex].criterias[i].treeNode.isNodeSelected=false;
		            	 $rootScope.$broadcast("handleBroadcast_deselectedNode", sharedTabService.tests[scope.currentIndex].criterias[i].treeNode);
		                 sharedTabService.tests[scope.currentIndex].criterias.splice(i, 1);
		                 return false;
		             }
		         });
		     }
		     
		     sharedTabService.closeAllCriteria = function (criteria, scope) {
		    	 var criterias = sharedTabService.tests[scope.currentIndex].criterias;
		    	 while(criterias.length > 0){
		    		 sharedTabService.tests[scope.currentIndex].criterias[0].treeNode.showTestWizardIcon = true;
	                 //sharedTabService.tests[scope.currentIndex].criterias[i].treeNode.isNodeSelected=false;
	                 $rootScope.$broadcast("handleBroadcast_deselectedNode", sharedTabService.tests[scope.currentIndex].criterias[0].treeNode);
	                 sharedTabService.tests[scope.currentIndex].criterias.splice(0, 1);
		    	 }
		     }
		     
		     sharedTabService.propagateCriteria = function(scope){
		    	 var criterias = sharedTabService.tests[scope.currentIndex].criterias;
		    	 for (var i = 1; i < criterias.length; i++) {
		    		 criterias[i].numberOfQuestionsSelected = criterias[0].numberOfQuestionsSelected;
		    		 criterias[i].numberOfQuestionsEntered = criterias[0].numberOfQuestionsEntered;
		    		 criterias[i].selectedQuestiontypes.splice(0,criterias[i].selectedQuestiontypes.length);// = criterias[0].selectedQuestiontypes;
		    		 for ( var questionType in criterias[0].selectedQuestiontypes) {
		    			 if(criterias[i].questiontypes.indexOf(criterias[0].selectedQuestiontypes[questionType]) != -1)
		    				 criterias[i].selectedQuestiontypes.push(criterias[0].selectedQuestiontypes[questionType])
					}
		    		 
				}
		     }

		     sharedTabService.propagateSelectedQuestionTypes = function(scope,idx,questiontype,isNew){
		    	 var criterias = sharedTabService.tests[scope.currentIndex].criterias;
		    	 if(isNew){
		    		 for (var i = 1; i < criterias.length; i++) {
		    			 criterias[i].selectedQuestiontypes.push(questiontype);
		    		 }
		    	 }
		    	 else{
			    	 for (var i = 1; i < criterias.length; i++) {
			    		 criterias[i].selectedQuestiontypes.splice(idx,1);
			    	 }
		    	 }

		     }
		     
		     sharedTabService.resetCriteriaToDefault = function(scope){
		    	 var criterias = sharedTabService.tests[scope.currentIndex].criterias;
		    	 for (var i = 1; i < criterias.length; i++) {
		    		 criterias[i].numberOfQuestionsEntered = null;
		    		 criterias[i].numberOfQuestionsSelected = sharedTabService.setDefault_numberOfQuestionsSelected(criterias[i].totalQuestions);
		    		 criterias[i].selectedQuestiontypes.splice(0,criterias[i].selectedQuestiontypes.length);// = criterias[0].selectedQuestiontypes;
				}
		     }
		     
		     sharedTabService.versions = [
		         { number: 1, text: '1 Version' },
                 { number: 2, text: '2 Versions' },
                 { number: 3, text: '3 Versions' },
                 { number: 4, text: '4 Versions' },
                 { number: 5, text: '5 Versions' },
                 { number: 6, text: '6 Versions' },
                 { number: 7, text: '7 Versions' },
                 { number: 8, text: '8 Versions' },
                 { number: 9, text: '9 Versions' },
                 { number: 10, text: '10 Versions' },
		     ];
		       
		     return sharedTabService;
		 }]);
