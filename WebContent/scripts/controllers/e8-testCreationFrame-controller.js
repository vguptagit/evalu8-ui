'use strict';

angular.module('e8MyTests')

.controller('TestCreationFrameController',
    ['$scope', '$rootScope', '$location', '$cookieStore', '$http', '$sce',
     'TestService', 'SharedTabService', '$modal', '$compile', 'directiveQtiService',
    function ($scope, $rootScope, $location, $cookieStore, $http, $sce,
    		TestService, SharedTabService, $modal, $compile, directiveQtiService) {

        //$scope.tree2 = SharedTabService.tests[SharedTabService.currentTabIndex].questions;


        $scope.tests = SharedTabService.tests;
        $scope.currentIndex = SharedTabService.currentTabIndex;
        $scope.criterias = SharedTabService.tests[SharedTabService.currentTabIndex].criterias;
        //$scope.isTestWizardTabPresent = false;
        $scope.sharedTabService = SharedTabService;


        /*****************************************Start Question edit ****************************************/
        $scope.showQstnEditIcon=false;        
        
        $scope.hoverIn = function(selectedQstn){        	
        		 this.showQstnEditIcon = true;            
        };

        $scope.hoverOut = function(){
            this.showQstnEditIcon = false;            
        };
                
        $scope.showQstnPrintOrEditMode = function (selectedQstnNode){ 
        	 if(SharedTabService.IsAnyQstnEditMode && !selectedQstnNode.node.IsEditView){
             	$scope.IsConfirmation=false;        	
        		 	$scope.alert("A question is already in Edit mode, save it before editing another question.");
        		 	return;
             }
        	var qstnHtml = selectedQstnNode.node.textHTML;            	
        	this.showQstnEditIcon=!this.showQstnEditIcon;      
        	selectedQstnNode.node.qstnLinkText=selectedQstnNode.node.IsEditView ? "Edit":"View";         		
        	if (selectedQstnNode.node.IsEditView){     
        		$scope.imageClicked = false;
        		var p = $(angular.element(document.querySelector("#uploadImage"))).detach();
            	$("#qstnArra").append(p);
        		convertHtmlToXmlNode(selectedQstnNode);         
        		SharedTabService.IsAnyQstnEditMode=false;
        	 }else{
        		 SharedTabService.IsAnyQstnEditMode=true;
        	 }
        	selectedQstnNode.node.IsEditView=!selectedQstnNode.node.IsEditView;             	
        }
        
                
        function convertHtmlToXmlNode(selectedQstnNode) {       
        	var xml = jQuery.parseXML(selectedQstnNode.node.data);
    		var qstnHTML=$(selectedQstnNode.$element);
    		var qstnCaption = replaceImage(qstnHTML.find('#qtiCaption'));  
    		
    		$(xml).find('itemBody').find('p').html(qstnCaption);    		
    		
    			$(xml).find('itemBody').find('choiceInteraction').find("simpleChoice").remove();    			
    			var htmlNewOptions = qstnHTML.find('.qti-simpleChoice');  
        		var optionText='';
        		var optionTag = '<simpleChoice identifier="@RESPONSE" fixed="false">@val</simpleChoice>';
        			
        					for (var i = 0; i < htmlNewOptions.length; i++) {
        						optionText = replaceImage(htmlNewOptions.eq(i).find("div.optionTextEditablediv"));
        						
        						var optionTagAppend = optionTag.replace('@RESPONSE', 'RESPONSE_' + (i+1));						
        						optionTagAppend = optionTagAppend.replace('@val', optionText);
        						var item = $.parseXML(optionTagAppend); //returns DOM element		
        						$(xml).find('itemBody').find('choiceInteraction').append($(item).children(0));
        					}
        			
        		$(xml).find('responseCondition').children().slice(3).remove();
        		
        		var $responseElseIf = '<responseElseIf><match><variable identifier=\"RESPONSE\"/><baseValue baseType=\"identifier\">RESPONSE_1</baseValue></match><setOutcomeValue identifier=\"SCORE\"><baseValue baseType=\"float\">0</baseValue></setOutcomeValue><setOutcomeValue identifier=\"FEEDBACK\"><baseValue baseType=\"identifier\">FEEDBACK_1</baseValue></setOutcomeValue></responseElseIf>';
        		for (var i = 3; i < htmlNewOptions.length; i++) {		
					$(xml).find("responseCondition").append($responseElseIf.replace("RESPONSE_1","RESPONSE_"+(i+1)));
    			}
        		
        		$(xml).find('setOutcomeValue[identifier="SCORE"] baseValue').text("0");
    			var controllerArray = qstnHTML.find("input[type='radio'][name='RESPONSE']")
    			for (var index = 0; index < controllerArray.length; index++) {    			
					if(controllerArray[index].checked == true){						
						$(xml).find('setOutcomeValue[identifier="SCORE"] baseValue').eq(index).text("1");
					}		
						
				}
    			if(selectedQstnNode.node.qstnTemplate){
    				selectedQstnNode.node.IsEdited=true;
    			}else{
    				var qstnModifiedData = buildQstnModifiedDetails($(xml));
    				selectedQstnNode.node.IsEdited=!angular.equals(selectedQstnNode.node.qstnMasterData, qstnModifiedData);
    			}
    			
    		
    			QTI.initialize();
    				QTI.Attribute.id = 1;		
    				 QTI.id=1;		
    	    		var displayNode = $("<div></div>")
    				QTI.play(xml,displayNode,true,true,selectedQstnNode.node.quizType);		    	    	
    	    		selectedQstnNode.node.textHTML=displayNode.html();    
    				var attrs = {};
                	attrs.bindQti = "getHTML(this)";
                	var Qtiscope = angular.element($(selectedQstnNode.$element).find("div[class*='questionList']")).scope();                	
                	var element = Qtiscope.$element.children();
                	directiveQtiService.bindNewQti(Qtiscope, element, attrs);
    				
    	}     
        
        var replaceImage = function(textBox){
        	var htmlText = textBox.html().replace(/&nbsp;/," ");
        	var images = textBox.find("u[contenteditable]");
			images.each(function(){
				var url = $(this).attr("url");
				htmlText = htmlText.replace($(this).get(0).outerHTML,"<img width='300px' src='"+ url +"' \/>")
			})
			return htmlText;
        }
        
        $scope.removOption = function (selectedNode,event){        	
        	var qstnOptionContainer=$(selectedNode.$element).find('form.qti-choiceInteraction');
    		var tagCnt = qstnOptionContainer.find('div.qti-simpleChoice').length;
    		if(tagCnt>3 && !$(event.currentTarget).parents(".qti-simpleChoice").eq(0).attr("checked")){
        		$scope.selectedNode=selectedNode;
        		$scope.event=event;
        		$scope.IsConfirmation=true;        		
        		$scope.alert("Are you sure you want to delete this answer?");
        	}else{
        		$scope.IsConfirmation=false;        	
        		 $scope.alert("Minimum answer required is 3.");
        	}       
    	}
        
        $scope.callbackAlert = function (){   
        	$(this.event.srcElement).parents(".qti-simpleChoice").eq(0).remove();
        }
        
       	    $scope.alert = function (message,size) {       	    	
        		$scope.message=message
    		        $modal.open({
    		            templateUrl: 'views/partials/alert.html',
    		            controller: 'AlertMessageController',
    		            size: size,
    		            backdrop: 'static',
    		            keyboard: false,
    		            resolve: {
    		            	parentScope: function () {
    		                    return $scope;
    		                }
    		            }
    		        });
    		    };        	
        	
      
        
        $scope.qstnOptionsView = function(selectedNode,qstnOptionView){        
        	selectedNode.node.optionsView=qstnOptionView;        	
        }        
        
        $scope.addOptions = function (selectedOption,event){            	
        	var htmlOptionCnt = selectedOption.$element.find('.qti-simpleChoice').find('div').find('div[contenteditable=true]').length;  
				var cloneOption = $(event.currentTarget).parents(".qti-simpleChoice").clone();
				cloneOption.find("input[type='radio']").attr("checked",false).attr("id","simpleChoice"+htmlOptionCnt);			
				cloneOption.find(".optionTextEditablediv").attr("data-placeholder","Enter Answer").attr("NewRow","1")
				.attr("id","simpleChoice"+htmlOptionCnt).text("");				
				$(event.currentTarget).parents(".qti-simpleChoice").eq(0).after(cloneOption)      		
	    	
		    	selectedOption.node.textHTML = selectedOption.$element.children().html();
		    	var attrs = {};
		    	attrs.bindQti = "getHTML1(this)";		    	
		    	var qstnHTML=$(selectedOption.$element);	    	
		    	var options = qstnHTML.find("input[type='radio'][name='RESPONSE']");
		    	var selectedIndex = options.index(options.filter(':checked'));		    	
		    	directiveQtiService.bindNewQti(selectedOption, selectedOption.$element, attrs);
		    	setTimeout(
		    			  function() 
		    			  {
		    				  qstnHTML.find("input[type='radio'][name='RESPONSE']").eq(selectedIndex).attr("checked","checked");
		    					
		    			  }, 50);

         }
        
        $scope.imageClicked = false;
        var Option = null;
        var CursorPosition = 0;
        $scope.addImage = function(selectedOption,event,parentText){
        	Option = $(event.target).parents(parentText).find("div[contenteditable='true']").eq(0);
        	CursorPosition = QTI.getCaretPosition(Option.get(0));
        	if($(event.target).parents(parentText).next("#uploadImage").length == 1)
    		{
        		$scope.imageClicked = !$scope.imageClicked;
        		return;
    		}
        	$scope.imageClicked = true;
//        	angular.element("#uploadImage").css("top")
        	var p = $(angular.element(document.querySelector("#uploadImage"))).detach();
        	$(event.target).parents(parentText).after(p);
        }
        
        $scope.upload = function(files){
        	var returnValue;
        	if (files && files.length) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    returnValue = TestService.uploadImage(file,Option,CursorPosition,function(data,element,cursorPosition){
                        var optionText = element.html().replace(/&nbsp;/g," ");
                        element.html(optionText.substring(0,cursorPosition) + "<u contenteditable='false' url='"+ data +"'><i>"+ file.name +"</i></u>&nbsp;" + optionText.substring(cursorPosition + 1,optionText.length))
                        $scope.imageClicked = false;
                    });
                   
                }

            }
        	
        }
        /*****************************************End Question edit ****************************************/


        if (SharedTabService.currentTab && SharedTabService.currentTab.testId) {
            $scope.newVersionBtnCss = "";
            $scope.exportBtnCss = "";
        } else {
            $scope.newVersionBtnCss = "disabled";
            $scope.exportBtnCss = "disabled";
        }
        $scope.addNewTest = function () {
            SharedTabService.addNewTest($scope);
        }
        $scope.addTestWizard = function () {
            SharedTabService.addTestWizard($scope);
        }
        $scope.addTestWizardCriteria = function (response, currentNode) {
            SharedTabService.addTestWizardCriteria($scope, SharedTabService.tests[SharedTabService.currentTabIndex], response, currentNode);
        }

        $scope.isLoading = false;
        $scope.onClickTab = function (test) {
            SharedTabService.onClickTab(test, $scope);
            if (SharedTabService.tests[SharedTabService.currentTabIndex].testId) {
                $scope.newVersionBtnCss = "";
                $scope.exportBtnCss = "";
            } else {
                $scope.newVersionBtnCss = "disabled";
                $scope.exportBtnCss = "disabled";
            }

            if (test.testId && !test.questions.length) {
                $scope.isLoading = true;
                TestService.getTest(test.testId, function (testResult) {
                    $scope.renderTest(testResult.assignmentContents.binding, testResult.title);
                })
            }
        }

        $scope.isActiveTab = function (tabUrl) {
            return SharedTabService.isActiveTab(tabUrl, $scope);
        }

        $scope.isActiveSelectedTest = function (testId) {
            if (SharedTabService.currentTab) {
                return testId == SharedTabService.currentTab.id;
            }
            return false;
        }

        $scope.closeTab = function (tab) {
            SharedTabService.closeTab(tab, $scope);
        }
        $scope.closeTabWithConfirmation = function (tab) {
            SharedTabService.closeTabWithConfirmation(tab, $scope);
        }
        $scope.closeCriteria = function (folder) {
            SharedTabService.closeCriteria(folder, $scope);
        }

        $scope.$on('handleBroadcastTests', function () {
            $scope.tests = SharedTabService.tests;
        });
        $scope.$on('handleBroadcastCurrentTabIndex', function () {
            $scope.currentIndex = SharedTabService.currentTabIndex;
        });
        $scope.$on('handleBroadcast_AddTestWizard', function () {
            SharedTabService.addTestWizard($scope);
        });
        $scope.testTitle = "New Test";
        
        function buildQstnModifiedDetails(xml){
        	  var optionList=[];
        	  var correctAnswerList=[];
        	 
        	  $(xml).find('setOutcomeValue[identifier="SCORE"] baseValue')
        	      				.each(function(i, e) {    
        	      					
        	      				if($(this).text()=="1"){
        	      					correctAnswerList.push(i);
        	      				}      	      				      	      				
        	  });
        	  
        	  $(xml).find('itemBody').find('choiceInteraction').find("simpleChoice")
  				.each(function(i, e) { 
  					
  				optionList.push($(this).text().trim());  
  		  });
        	  
            var qstnModifiedData={
                	caption:$(xml).find('itemBody').find('p').html().trim(),
                	options:optionList,
                	optionCount:$(xml).find('itemBody').find('choiceInteraction').find("simpleChoice").length,
                	correctAnswer:correctAnswerList              			
            }
                	
            return qstnModifiedData;
          }
       function buildQstnMasterDetails(qstnNode){
      	  var xml = jQuery.parseXML(qstnNode.data);
      	  var optionList=[];
      	  var correctAnswerList=[];
      	  //$(xml).find('setOutcomeValue[identifier="SCORE"] baseValue').index($(xml).find('setOutcomeValue[identifier="SCORE"] baseValue:contains("1")'));
      	  $(xml).find('setOutcomeValue[identifier="SCORE"] baseValue')
      	      				.each(function(i, e) {    
      	      					
      	      				if($(this).text()=="1"){
      	      					correctAnswerList.push(i);
      	      				}      	      				      	      				
      	  });
      	  
      	  $(xml).find('itemBody').find('choiceInteraction').find("simpleChoice")
				.each(function(i, e) { 
					
				optionList.push($(this).text().trim());  
		  });
      	  
          var qstnMasterData={
              	caption:$(xml).find('itemBody').find('p').html().trim(),
              	options:optionList,
              	optionCount:$(xml).find('itemBody').find('choiceInteraction').find("simpleChoice").length,
              	correctAnswer:correctAnswerList              			
          }
              	
          return qstnMasterData;
        }
        
        $scope.$on('dropQuestion', function (event, source, destIndex, sourceTabName) {
        	if(SharedTabService.IsAnyQstnEditMode){
            	$scope.IsConfirmation=false;        	
       		 	$scope.alert("A question is already in Edit mode, save it before adding or reordering questions.");
       		 	return;
            }
        	
          var newNode = angular.copy(source.node);
                                 
            var QuestionEnvelop = {
        		metadata : {      
        			guid: newNode.guid,
        			title: newNode.title,
            		description: newNode.description,
            		quizType: newNode.quizType,
            		subject: newNode.subject,
            		timeRequired: newNode.timeRequired,            	
            		crawlable: newNode.crawlable,      		
            		keywords: newNode.keywords,          		
            		versionOf: newNode.versionOf,            		
            		version: newNode.version        		            		          		            		
                },            	
            	body: newNode.data
            }
            
            var tests = SharedTabService.tests[SharedTabService.currentTabIndex].questions;

            var templateQstnGUID = 0;
            var templateQuestionsList = $.grep(tests, function (element, index) {
            	if (element.optionsView != undefined)
            		return true;
            });
            templateQstnGUID = templateQuestionsList.length + 1;
            if (sourceTabName == "CustomQuestions") {  
            	newNode.IsEditView=true;                
            	SharedTabService.IsAnyQstnEditMode=true;
                if (!newNode.guid) {
                    newNode.guid = templateQstnGUID;
                }
            }else{
            	newNode.IsEditView=false;      
                newNode.qstnMasterData=buildQstnMasterDetails(newNode);
            }
            newNode.qstnLinkText=newNode.IsEditView ? "View":"Edit";     
            var nodeAlreadyExist = false;
            if (tests.length == 0) {
                tests.push(newNode);
            } else {
                if (sourceTabName != "CustomQuestions") {
                    tests.forEach(function (item) {
                        if (item.guid == newNode.guid) { nodeAlreadyExist = true; }
                    });
                }

                if (!nodeAlreadyExist) { tests.splice(destIndex, 0, newNode); }
            }
            $scope.tests[$scope.currentIndex].questions = tests;
        });

        $scope.$on('editTest', function (event, selectedTest) {
            $scope.editTest(selectedTest);
        });
        $scope.$on('handleBroadcast_createTestWizardCriteria', function (event, response, currentNode) {
            $scope.addTestWizardCriteria(response, currentNode);
            //TODO : need to revisit and change JQuery implementation
            $('.test-wizard-container').height(($(document).height() - $('.test-wizard-container').offset().top - 15) + 'px');
        });

        $scope.editTest = function (selectedTest) {
            //selectedTest.node.disableEdit = true;
            $scope.newVersionBtnCss = "";
            $scope.exportBtnCss = "";
            $scope.testGuid = selectedTest.node.guid;
            $scope.selectedTestNode = selectedTest.node;
            // $scope.BlockRightPanel = blockUI.instances.get('BlockRightPanel');
            //$scope.BlockRightPanel.start();

            //if Test is in root folder
            if (selectedTest.$parentNodeScope) {
                $scope.folderGuid = selectedTest.$parentNodeScope.node.guid;
                $scope.courseFolder = selectedTest.$parentNodeScope.node.title;
            }
            else {
                $scope.folderGuid = null;
            }

            $("#testCaption").val(selectedTest.node.title);
            $scope.isLoading = true;
            TestService.getTest(selectedTest.node.guid, function (test) {
                $scope.renderTest(test.assignmentContents.binding, selectedTest.node.title);
            })
            $scope.testTitle = selectedTest.node.title;
            $scope.metadata = TestService.getTestMetadata(selectedTest.node);
            SharedTabService.editTest($scope);
        }

        $scope.renderQuestions = function (qBindings, currentIndex) {
            if (qBindings.length == 0) {
                $scope.isLoading = false;
                // $scope.BlockRightPanel.stop();
                return false;
            }

            var question = qBindings.shift();

            TestService.getQuestion(question.boundActivity, function (response) {
                var displayNode = $("<div></div>")
                displayNode.guid = question.guid;
                QTI.play(response, displayNode, false);

                //$scope.tree2.push(displayNode);
                $scope.isLoading = false;
                SharedTabService.tests[currentIndex].questions.push(displayNode);
                SharedTabService.masterTests[currentIndex].masterQuestions.push(displayNode);//is to check for dirty.
                if (qBindings.length > 0) {
                    $scope.renderQuestions(qBindings, currentIndex);
                }
                else {
                    // $scope.BlockRightPanel.stop();
                }
            });
        };

        $scope.renderTest = function (questionBindings, title) {

            $scope.testTitle = title;

            //$scope.tree2 = [];

            QTI.initialize();

            $scope.renderQuestions(questionBindings, $scope.currentIndex);
        }

        //Function is to save the Test details with the questions.
        $scope.saveTest = function () {

            var test = SharedTabService.tests[SharedTabService.currentTabIndex];
            if (test.title.length <= 0) {
                return;
            }

            $scope.testTitle = $("#testCaption").val();
            //Building the json to create the test.
            var testcreationdata = {
                "metadata": {
                    "crawlable": "true"
                },
                "body": {
                    "@context": "http://purl.org/pearson/paf/v1/ctx/core/StructuredAssignment",
                    "@type": "StructuredAssignment",
                    "assignmentContents": {
                        "@contentType": "application/vnd.pearson.paf.v1.assignment+json",
                        "binding": []
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
            //binding the dragged question details. 
            var editedQstns= $.grep(test.questions, function(qstn) {
                return qstn.IsEdited;
            });
            
            angular
			.forEach(
                    test.questions,
					function (tree) {
					    testcreationdata.body.assignmentContents.binding.push(
							    { guid: tree.guid, activityFormat: "application/vnd.pearson.qti.v2p1.asi+xml", bindingIndex: index });
					    index = index + 1;

					});

            TestService.saveTestData(testcreationdata, test.folderGuid, function (testResult) {

                SharedTabService.tests[SharedTabService.currentTabIndex].testId = testResult.guid;
                SharedTabService.tests[SharedTabService.currentTabIndex].id = testResult.guid;
                SharedTabService.tests[SharedTabService.currentTabIndex].tabTitle = test.title;
                SharedTabService.currentTab = SharedTabService.tests[SharedTabService.currentTabIndex];
                $scope.newVersionBtnCss = "";
                $scope.exportBtnCss = "";

                if ($('.maindivTest[id=' + testResult.guid + ']').length) {
                    var selectedNode = angular.element($('.maindivTest[id=' + testResult.guid + ']')).scope().node;
                    selectedNode.title = test.title;
                    selectedNode.modified = (new Date()).toJSON();
                }
                if (SharedTabService.tests[SharedTabService.currentTabIndex].isSaveAndClose) {
                    SharedTabService.closeTab(SharedTabService.currentTab, $scope);
                    SharedTabService.removeMasterTest(SharedTabService.currentTab);
                } else {
                    SharedTabService.removeMasterTest(SharedTabService.currentTab);
                    SharedTabService.addMasterTest(SharedTabService.tests[SharedTabService.currentTabIndex]);
                }
            });

        }

        //Rendering the question as html		
        $scope.getHTML = function (datanode) {
            if (datanode.node.length) {
                return $sce.trustAsHtml(datanode.node[0].innerHTML);
            } else if (datanode.node) {
                return $sce.trustAsHtml(datanode.node.textHTML);
            }
        }

        //second tree model, place holder for the dragged questions.
        //$scope.tree2 = [];

        //versioning
        /*$scope.versions = SharedTabService.versions;
        $scope.isQuestions = true;
        $scope.isAnswers = true;

        $scope.isViewVersions = true;

        $scope.selectedVersions = SharedTabService.versions[1];
        $scope.noOfVersions = SharedTabService.versions[1].number;
        $scope.selectVersion = function (version) {
            $scope.noOfVersions = version.number;
        };*/
        $scope.createNewVersion = function (scope) {
            //var self = this;
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
            	$scope.IsConfirmation=false;
                this.alert("Please select scramble choice");
                return false;
            }

            $scope.versioningOptions = { "scrambleType": scrambleType, "noOfVersions": scope.noOfVersions };
            $scope.isViewVersions = scope.isViewVersions;

            TestService.createVersions(this, function (scope, testResult) {

                $scope.versionedTests = testResult;

                $scope.currentTab = SharedTabService.tests[SharedTabService.currentTabIndex];
                $scope.currentTab.modified = (new Date()).toJSON();
                if (SharedTabService.selectedMenu == SharedTabService.menu.myTest) {

                    $scope.selectedTestIndex = 0;
                    if ($scope.currentTab.folderGuid == null) {
                        $scope.selectedFolder = $scope.defaultFolders;
                    }
                    else {
                        $scope.selectedFolder = angular.element($('#' + $scope.currentTab.testId).closest('ol')).scope().node.nodes;
                    }
                    for (var i = 0; i < $scope.selectedFolder.length; i++) {
                        if ($scope.selectedFolder[i].guid === $scope.currentTab.testId) {
                            $scope.selectedTestIndex = i + 1;
                            break;
                        }
                    }


                    if($scope.currentTab.folderGuid== null){
                    	$scope.selectedFolder=$scope.defaultFolders;
                    	
                    	//$scope.selectedFolder = angular.element($('#' + $scope.currentTab.testId).closest('li').parent()).scope();
                    	for (var i = 0; i < $scope.defaultFolders.childNodes().length; i++) {
                            if ($scope.defaultFolders.childNodes()[i].node.guid === $scope.currentTab.testId) {
                                $scope.selectedTestIndex = i + 1;
                                break;
                            }
                        }
                    }
                    else{
                    	$scope.selectedFolder = angular.element($('#' + $scope.currentTab.testId).closest('ol')).scope().node;
	                    for (var i = 0; i < $scope.selectedFolder.nodes.length; i++) {
	                        if ($scope.selectedFolder.nodes[i].guid === $scope.currentTab.testId) {
	                            $scope.selectedTestIndex = i + 1;
	                            break;
	                        }
	                    }
                    }

                }

                $scope.maping = {};
                $scope.count = 0;

                $scope.versionedTests.forEach(function (node) {
                    var testID = node.guid;
                    TestService.getMetadata(testID, function (result) {
                        $scope.maping[node.guid] = result;
                        $scope.count = $scope.count + 1;

                        if ($scope.count == $scope.versionedTests.length)
                            $scope.bindTabs();
                    });
                })

                $scope.bindTabs = function () {
                    $scope.versionedTests.forEach(function (node) {
                        var result = $scope.maping[node.guid];
                        //update MyTest tree
                       /* node.testId = $scope.currentTab.testId;
                        node.folderGuid = $scope.currentTab.folderGuid;
                        node.nodeType = "test";
                        node.title = result.title;
                        node.tabTitle = result.title;
                        node.modified = $scope.currentTab.modified;

                        if (SharedTabService.selectedMenu == SharedTabService.menu.myTest) {
                            if ($scope.currentTab.folderGuid == null) {
                            	for(var j=$scope.selectedFolder.length-1; j>=0; j--){
                            		$scope.selectedFolder[j].parentNode.removeChild($scope.selectedTestIndex + parseInt(result.version), 0, node);
                            	}
                            }
                            else {
                            	for(var j=$scope.selectedFolder.length-1; j>=0; j--){
                            		$scope.selectedFolder[j].parentNode.removeChild($scope.selectedTestIndex + parseInt(result.version), 0, node);
                            	}
                                $scope.selectedFolder.splice($scope.selectedTestIndex + parseInt(result.version), 0, node);
                            }
                        }*/
                        //create tabs
                        if ($scope.isViewVersions) {
                            var newTestTab = new SharedTabService.Test(SharedTabService.tests[SharedTabService.currentTabIndex]);
                            newTestTab.questions = [];
                            newTestTab.id = node.guid;
                            newTestTab.testId = node.guid;
                            newTestTab.title = result.title;
                            newTestTab.tabTitle = result.title;
                            newTestTab.folderGuid = result.folderId;
                            SharedTabService.prepForBroadcastTest(newTestTab);
                        }
                    });
                }
            });
        }

       
        
        $scope.TestVersion_open = function () {

            $modal.open({
                templateUrl: 'views/partials/testVersionPopup.html',
                controller: 'TestVersionCreationController',
                size: 'md',
                backdrop: 'static',
                keyboard: false,
                resolve: {
                    parentScope: function () {
                        return $scope;
                    }
                }
            });
        };
        
        $scope.open = function () {

            $modal.open({
                templateUrl: 'views/partials/exportPopup.html',
                controller: 'ExportTestController',
                size: 'lg',
                backdrop: 'static',
                keyboard: false,
                resolve: {
                    testId: function () {
                        return SharedTabService.currentTab.testId;
                    }
                }
            });
        };
       

        //save confirmation on close button clicked..
        $scope.Confirmation_Open = function () {
            $modal.open({
                templateUrl: 'views/partials/saveConfirmationPopup.html',
                controller: 'SaveConfirmationController',
                backdrop: 'static',
                keyboard: false,
                resolve: {
                    parentScope: function () {
                        return $scope;
                    }
                }
            });
        }


        //#region Test wizard *************************

        $scope.SelecteNumberOnly = function (criteria) {
            criteria.numberOfQuestionsEntered = criteria.numberOfQuestionsEntered.replace(/[^\d]/g, '');
            /*if (criteria.numberOfQuestionsEntered == 0) {
                criteria.numberOfQuestionsSelected = SharedTabService.setDefault_numberOfQuestionsSelected(criteria.totalQuestions);
            } else {
                criteria.numberOfQuestionsSelected = null;
            }*/
        }


        $scope.toggleQuestiontypeSelection = function (criteria, questiontype) {
            var idx = criteria.selectedQuestiontypes.indexOf(questiontype);
            if (idx > -1) {// is currently selected
                criteria.selectedQuestiontypes.splice(idx, 1);
            }
            else { // is newly selected
                criteria.selectedQuestiontypes.push(questiontype);
            }
        };
        $scope.isApplySameCriteriaToAll = false;
        $scope.toggleApplySameCriteria = function (criteria) {

        };

        $scope.previevTest = function () {
            var isError = false;
            //$scope.tests[currentIndex].criterias.metadata.sort(randomize);
            //console.log($scope.tests[currentIndex].criterias.metadata.sort(randomize));
            var metadatas = [];
            SharedTabService.errorMessages = [];
            $scope.sharedTabService.tests[$scope.sharedTabService.currentTabIndex].criterias.forEach(function (criteria) {
                if (criteria.selectedQuestiontypes.length) {
                    var arr = [];
                    criteria.metadata.forEach(function (item) {
                        if (criteria.selectedQuestiontypes.indexOf(item.quizType) != -1) {
                            arr.push(item);
                        }
                    });
                    arr = arr.sort(randomize);
                    if (arr.length < criteria.numberOfQuestionsSelected) {
                        var type = '';
                        if (criteria.selectedQuestiontypes.length == 1) {
                            type = criteria.selectedQuestiontypes[0];
                            SharedTabService.addErrorMessage(criteria.treeNode.title, SharedTabService.errorMessageEnum.NotEnoughQuestionsAvailableForType_prefix + type + SharedTabService.errorMessageEnum.NotEnoughQuestionsAvailableForType_suffix);
                        } else {

                            for (var i = 0; i < criteria.selectedQuestiontypes.length; i++) {
                                if (i == criteria.selectedQuestiontypes.length - 1) {
                                    type = type.slice(0, -2);
                                    type += ' and ' + criteria.selectedQuestiontypes[i];
                                } else {
                                    type += criteria.selectedQuestiontypes[i] + ', ';
                                }
                            }
                            SharedTabService.addErrorMessage(criteria.treeNode.title, SharedTabService.errorMessageEnum.NotEnoughQuestionsAvailableForType_prefix + type + SharedTabService.errorMessageEnum.NotEnoughQuestionsAvailableForTypes_suffix);
                        }
                        isError = true;

                    }
                }
                else {
                    SharedTabService.addErrorMessage(criteria.treeNode.title, SharedTabService.errorMessageEnum.NoQuestionTypeSelected);
                    isError = true;
                    arr = criteria.metadata.sort(randomize);
                }
                if (criteria.numberOfQuestionsEntered > 0) {
                    criteria.numberOfQuestionsSelected = criteria.numberOfQuestionsEntered;
                }
                if (criteria.numberOfQuestionsSelected > criteria.totalQuestions) {
                    criteria.isError = true;
                    SharedTabService.addErrorMessage(criteria.treeNode.title, SharedTabService.errorMessageEnum.NotEnoughQuestionsAvailable);
                    isError = true;
                    return false;
                } else {
                    metadatas = metadatas.concat(arr.slice(0, criteria.numberOfQuestionsSelected));

                }
            });
            if (isError) {
                SharedTabService.TestWizardErrorPopup_Open(SharedTabService.errorMessages);
                return false;
            } else {
                $scope.sharedTabService.tests[$scope.sharedTabService.currentTabIndex].criterias.forEach(function (criteria) {
                    criteria.treeNode.showTestWizardIcon = true;
                    $rootScope.$broadcast("handleBroadcast_deselectedNode", criteria.treeNode);
                })
            }

            //console.log(metadatas);
            $scope.tests[$scope.sharedTabService.currentTabIndex].isTestWizard = false;
            $scope.sharedTabService.isTestWizardTabPresent = false;
            $scope.tests[$scope.sharedTabService.currentTabIndex].tabTitle = "Untitled test";
            QTI.initialize();
            //$scope.BlockRightPanel = blockUI.instances.get('BlockRightPanel');
            //$scope.BlockRightPanel.start();
            $scope.render(metadatas);
        }
        function randomize(a, b) {
            return Math.random() - 0.5;
        }
        //TODO: code optimization is need.
        $scope.render = function (metadatas) {
            if (metadatas.length == 0) {
                //$scope.BlockRightPanel.stop();
                return false;
            }

            var question = metadatas.shift();

            TestService.getQuestionById(question.guid, function (response) {
                var displayNode = $("<div></div>")
                displayNode.guid = question.guid;
                QTI.play(response, displayNode, false);

                //$scope.tree2.push(displayNode);
                $scope.isLoading = false;
                SharedTabService.tests[SharedTabService.currentTabIndex].questions.push(displayNode);
                SharedTabService.masterTests[SharedTabService.currentTabIndex].masterQuestions.push(displayNode);//is to check for dirty.
                if (metadatas.length > 0) {
                    $scope.render(metadatas, SharedTabService.currentTabIndex);
                }
                else {
                    //$scope.BlockRightPanel.stop();
                }
            });
        };
        //#endregion Test wizard *************************
    }]);

angular.module('e8MyTests')
.directive('bindQti', ['directiveQtiService',
                      function (directiveQtiService) {

                          return function (scope, element, attrs) {
                              directiveQtiService.bindNewQti(scope, element, attrs);
                          }

                          /*return function(scope, element, attrs) {
                              debugger;
                              var ensureCompileRunsOnce = scope.$watch(
                                  function(scope) {
                                      debugger;
                                    // watch the 'bindUnsafeHtml' expression for changes
                                    return scope.$eval(attrs.bindQti);
                                  },
                                  function(value) {
                                    // when the 'bindUnsafeHtml' expression changes
                                    // assign it into the current DOM
                                      debugger;
                                    element.html(value);
                      
                                    // compile the new DOM and link it to the current
                                    // scope.
                                    // NOTE: we only compile .childNodes so that
                                    // we don't get into infinite loop compiling ourselves
                                    $compile(element.contents())(scope);
                                    
                                    ensureCompileRunsOnce();
                                  }
                                );
                              };*/
                      }
])

angular.module('e8MyTests')
.service("directiveQtiService", ['$compile', function ($compile) {


    this.bindNewQti = function (scope, element, attrs) {

        var ensureCompileRunsOnce = scope.$watch(
	        function (scope) {

	            // watch the 'bindUnsafeHtml' expression for changes
	            return scope.$eval(attrs.bindQti);
	        },
	        function (value) {
	            // when the 'bindUnsafeHtml' expression changes
	            // assign it into the current DOM

	            element.html(value);

	            // compile the new DOM and link it to the current
	            // scope.
	            // NOTE: we only compile .childNodes so that
	            // we don't get into infinite loop compiling ourselves
	            $compile(element.contents())(scope);

	            ensureCompileRunsOnce();
	        }
	      );
    };
}]);
angular.module('e8MyTests')
.directive('ngReallyClick', [function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('click', function() {
                var message = attrs.ngReallyMessage;
                if (message && confirm(message)) {
                    scope.$apply(attrs.ngReallyClick);
                }
            });
        }
    }
}]);