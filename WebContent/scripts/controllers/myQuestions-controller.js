'use strict';

angular.module('e8MyTests')

.controller('MyQuestionsController',
    ['$scope', '$rootScope', '$location', '$cookieStore', '$http', '$sce', '$modal', 'QuestionFolderService', 'UserQuestionsService',
     'UserFolderService', 'TestService', 'SharedTabService', 'ArchiveService', 'EnumService', 'CommonService','QtiService',
     function ($scope, $rootScope, $location, $cookieStore, $http, $sce, $modal, QuestionFolderService, UserQuestionsService,
    		UserFolderService, TestService, SharedTabService, ArchiveService, EnumService, CommonService,QtiService) {
    	
        $scope.controller = EnumService.CONTROLLERS.myQuestion;

        $scope.isAddFolderClicked=false;
        $scope.isTestDeleteClicked=false;
        $scope.isFolderDeleteClicked=false;
        $scope.dragStarted = false;
        
		$scope.selectedNodes = [];
		
		var setTestNodeStatus = function(node){	
			node.isNodeSelected = true;
			node.showTestWizardIcon = true;
			node.showEditQuestionIcon = false;
			node.existInTestframe = true;
		}
		
		var updateWizardNodeStatus = function(node,isTabClicked){		
			node.isNodeSelected = true;
			node.showTestWizardIcon = !isTabClicked;
			node.showEditQuestionIcon = true;
			node.existInTestframe = true;
		}

/**********************************************************Start**************************************************/
		//This block of code update the wizard node status on Test tab switching. 
		
		var isAllSiblingsInTestWizardFrame = function(node,criterias) {
			var allSiblingsNotExistInWizardFrame=false;
			var nodeExist=false;
			for (var i = 0; i < node.nodes.length; i++) {		
				nodeExist=false;			
				for (var j = 0; j < criterias.length; j++) {		
					if (node.nodes[i].nodeType != EnumService.NODE_TYPE.question) {
						if (criterias[j].folderId == node.nodes[i].guid) {
							nodeExist = true;
							break;
						}
					}
				}

				if(!nodeExist){
					allSiblingsNotExistInWizardFrame=true;
					break;
				}	
			}

			if(!allSiblingsNotExistInWizardFrame){
				var isTabClicked = true;
				updateWizardNodeStatus(node,isTabClicked);	
				addingNodeInSelectedNodesArray(node);	
			}											
		}
		
		var updateWizardStatus = function(node,isTabClicked){
			updateWizardNodeStatus(node,isTabClicked);
			addingNodeInSelectedNodesArray(node);		
			if(node.nodes)updateWizardNodeHeirarchyStatus(node.nodes,isTabClicked);
		}
		
		var updateWizardNodeHeirarchyStatus = function(nodes,isTabClicked){			
			if(nodes){
				nodes.forEach(function(node) {			
					if (node.nodeType == EnumService.NODE_TYPE.question) {
						node.isNodeSelected = true;
						node.showEditQuestionIcon = true;
						node.existInTestframe = false;
						addingNodeInSelectedNodesArray(node);
					}else{
						updateWizardStatus(node,isTabClicked);		
					}													
				});
			}		

		}

		var updateTabWizardNodeStatusInTree = function(criterias,isTabClicked){		
			var scope = getRootNodesScope();										
			for (var i = 0; i < criterias.length; i++) {							
				for (var j = 0; j < scope.$nodesScope.$modelValue.length; j++) {
					var node = scope.$nodesScope.$modelValue[j];
					if (node.nodeType != EnumService.NODE_TYPE.question) {
						if (criterias[i].folderId == node.guid) {
							updateWizardStatus(node,isTabClicked);
							break;
						}else if(node.nodes){
							findAndUpdateWizardNodeStatus(node.nodes,criterias[i].folderId,isTabClicked);
							isAllSiblingsInTestWizardFrame(node,criterias);
						}
					}

				}

			}
		}	

		var findAndUpdateWizardNodeStatus = function(nodes,folderId,isTabClicked){	
			for (var i = 0; i < nodes.length; i++) {	
				var node = nodes[i];
				if (node.nodeType != EnumService.NODE_TYPE.question) {
					if (folderId == node.guid) {
						updateWizardStatus(node,isTabClicked);
						break;
					}else if(node.nodes){
						findAndUpdateWizardNodeStatus(node.nodes,folderId,isTabClicked);
					}
				}
			}
		}
		
/*******************************************************End*************************************************************/

		var updateTestNodeStatus = function(node,activeTest){	

			if(typeof(node.nodes) == 'undefined'){
				if (node.nodeType != EnumService.NODE_TYPE.question) {
					if(isAllQuestionsInTestFrame(node,activeTest)){
						setTestNodeStatus(node);
						addingNodeInSelectedNodesArray(node);
					}else return false;
				}else{
					setTestNodeStatus(node);
					addingNodeInSelectedNodesArray(node);
				}				
				return;
			}

			if(isAllQuestionsInTestFrame(node,activeTest)){
				setTestNodeStatus(node);
				addingNodeInSelectedNodesArray(node);
			}
			
		
			node.nodes.forEach(function(node) {
				if(isNodeInTestFrame(node)){
					setTestNodeStatus(node);
					addingNodeInSelectedNodesArray(node);
				}

			});		
		}

		var resetSelectedNodeStatus = function(){
			$scope.selectedNodes.forEach(function(node) {
				resetNodeStatus(node);
			});		
			$scope.selectedNodes=[];
		}


		var getRootNodesScope = function() {
			return angular.element(document.getElementById("MyTest-tree-root")).scope();
		};

		$scope.collapseAll = function() {
			var scope = getRootNodesScope();
			scope.collapseAll();
		};
		
		var setTestNodesStatus = function(testNodes,activeTest){
			var scope = getRootNodesScope();

			for (var i = 0; i < testNodes.length; i++) {
				for (var j = 0; j < scope.$nodesScope.$modelValue.length; j++) {  				
					var node = scope.$nodesScope.$modelValue[j];				
					if(node.guid==testNodes[i]){  							
						updateTestNodeStatus(node,activeTest);  						
						break;
					}
					setChildNodeStatus(node,testNodes[i],activeTest);
				}
			}
		}
		

		var isAllQuestionsInTestFrame = function(node,activeTest) {
			var allQuestionsExistInTestFrame = false;
			if (node.questionBindings && node.questionBindings.length>0) {
				for (var i = 0; i < node.questionBindings.length; i++) {
					allQuestionsExistInTestFrame = false;
					for (var j = 0; j < activeTest.questions.length; j++) {
						if (node.questionBindings[i].questionId == activeTest.questions[j].guid) {
							allQuestionsExistInTestFrame = true;
							break;
						}
					}
					if (!allQuestionsExistInTestFrame) {
						break;
					}

				}				
			} else {
				allQuestionsExistInTestFrame = false;
			}
			return allQuestionsExistInTestFrame;
		}

		var setChildNodeStatus = function(node,testNode,activeTest){
			if(typeof(node.nodes) == 'undefined'){
				if(isAllQuestionsInTestFrame(node,activeTest)){
					updateTestNodeStatus(node,activeTest);  
				}		
				return;
			}
			for (var i = 0; i < node.nodes.length; i++) {						
				var childNode = node.nodes[i];				
				if(childNode.guid==testNode){  							
					updateTestNodeStatus(childNode,activeTest);  	
					if(node.nodes.length == 1){
						setTestNodeStatus(node);
						addingNodeInSelectedNodesArray(node);
					}					
					break;
				}					
				setChildNodeStatus(childNode,testNode,activeTest);
			}			
		}

		var getTestQuestionsNode = function(activeTest,testNodes){  			
			var isQuestionExist=false;
			for (var i = 0; i < activeTest.questions.length; i++) {  	
				isQuestionExist = false;
				for (var j = 0; j < activeTest.questionFolderNode.length; j++) {
					if(activeTest.questionFolderNode[j].questionBindings){
						for (var k = 0; k < activeTest.questionFolderNode[j].questionBindings.length; k++) {
							if(activeTest.questionFolderNode[j].questionBindings[k].questionId == activeTest.questions[i].guid){
								isQuestionExist=true;
								break;
							}  						
						}
					}					

					if(isQuestionExist){
						break;
					}
				}

				if(!isQuestionExist){  					
					testNodes.push(activeTest.questions[i].guid);					
				}

			}  			
		}

		var updateTestNodesStatus = function(activeTest){  			
			var testNodes = [];
			activeTest.questionFolderNode.forEach(function(folder) {  				
				testNodes.push(folder.guid);
			});		

			getTestQuestionsNode(activeTest,testNodes);  	

			setTestNodesStatus(testNodes,activeTest);
		}

		var onTabLoadSetTreeNodesStatus = function(){  	
			var activeTest = SharedTabService.tests[SharedTabService.currentTabIndex];            
			if (!activeTest.isTestWizard && activeTest.questions.length) {						   
				updateTestNodesStatus(activeTest);
			}else if(activeTest.isTestWizard){
				onTabLoadSetTestWizardNodesStatus(activeTest);
			}
		}
		

		var onTabLoadSetTestWizardNodesStatus = function(activeTest) {
			var scope = getRootNodesScope();

			for (var i = 0; i < activeTest.criterias.length; i++) {
				for (var j = 0; j < scope.$nodesScope.$modelValue.length; j++) {
					var node = scope.$nodesScope.$modelValue[j];
					if (node.guid == activeTest.criterias[i].folderId) {
						updateWizardNodeStatus(node,true);
						addingNodeInSelectedNodesArray(node);
						break;
					}
				}
			}
		}

		//To check the question node is present in selectedNodes array.
		var isNodeInSelectedNodesArray = function(node) {
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
		var addingNodeInSelectedNodesArray = function(node) {								
			if(!isNodeInSelectedNodesArray(node)){
				$scope.selectedNodes.push(node);
			}			
		}
		
	     //remove a node from array by ID.
        var removeNodeByID = function(nodes,nodeID) {
            for (var j = 0; j < nodes.length; j++) {
                if (nodes[j].guid == nodeID) {        
                    removeNodeByIndex(nodes,j);
                }
            }
        }

		//remove a node from array by index.
		var removeNodeByIndex = function(nodes,index) {
			nodes.splice(index, 1);
		}

		//remove a node from array by ID.
		var removeNodeFromTestQuestionFolders = function(nodeID) {
			var activeTest = SharedTabService.tests[SharedTabService.currentTabIndex];

			for (var j = 0; j < activeTest.questionFolderNode.length; j++) {
				if (activeTest.questionFolderNode[j].guid == nodeID) {										
					removeNodeByIndex(activeTest.questionFolderNode,j);
					break;
				}
			}
		}

		//To remove a node from selectedNodes array.
		var removeNodeFromSelectedNodes = function(node) {
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

		var isNodeUsedForWizard = function(node, test){	
			var isNodeUsed=false;
			test.criterias.forEach(function(usedNode) {
				if(usedNode.folderId === node.guid){
					isNodeUsed=true;
				}
			});
			return isNodeUsed;
		}

		//To check the question node is present in current test frame.
		var isNodeInTestFrame = function(node) {			
			var activeTest = SharedTabService.tests[SharedTabService.currentTabIndex];
			if(node.nodeType == EnumService.NODE_TYPE.question){
				return !activeTest.questions.every(function(usedNode) {
					if(usedNode.guid === node.guid){						
						return false;
					}
					return true;
				});
			}else{
				return !activeTest.questionFolderNode.every(function(usedNode) {
					if(usedNode.guid === node.guid){						
						return false;
					}
					return true;
				});
			}

			return false;									
		}						

		//To change the selection status of the children nodes when parent node has been selected/deselcted.
		var checkChildSelection = function(node){   			
			if(typeof(node.nodes) == 'undefined'){
				return;
			}
			if(node.isNodeSelected){
				var test = SharedTabService.tests[SharedTabService.currentTabIndex];
				node.nodes.forEach(function (node) {			      
					if (isNodeUsedForWizard(node, test)) {
						node.showTestWizardIcon = false;
					} else {
						node.showTestWizardIcon = true;
					}
					node.isNodeSelected = true;
					if(!isNodeInTestFrame(node)){
						node.showEditQuestionIcon = true;
						node.existInTestframe = false;		
						addingNodeInSelectedNodesArray(node);
						if(node.nodes){
							checkChildSelection(node);
						}					
					}
				});								
			}else{									
				node.nodes.forEach(function(node) {	
					node.isNodeSelected = false;
					node.showEditQuestionIcon = false;
					node.showTestWizardIcon = false; 	
					node.existInTestframe = false; 											
					if(isNodeInTestFrame(node)){
						node.isNodeSelected = true;		
						node.existInTestframe = true;		
						node.showTestWizardIcon = true; 
					}else{
						removeNodeFromSelectedNodes(node);
					}					
					if(node.nodes){
						checkChildSelection(node);
					}										

				});									
			}								
		};

		//To check all child nodes of the parent node are selected.
		var isAllSiblingsSelected = function(siblingNodes) {								
			var allSiblingsNotSelected = false;
			siblingNodes.forEach(function(node) {				
				if (!node.isNodeSelected) {
					allSiblingsNotSelected = true;	
					return;
				}
			});

			return !allSiblingsNotSelected;																
		}

		var deselectNodesOnDrag = function(node){
			node.isNodeSelected = false;
			node.showEditQuestionIcon = false;
			if(node.nodes){
				node.nodes.forEach(function(childNode) {
					childNode.isNodeSelected = false;
					childNode.showEditQuestionIcon = false;
					if(childNode.nodes){
						deselectNodesOnDrag(childNode);
					}
				})
			}
		}
		//To change the selection status of the parent node of a node.
		var checkSiblingSelection = function(scope){
			var activeTest = SharedTabService.tests[SharedTabService.currentTabIndex];
			if(scope.node.isNodeSelected){									
				if(scope.$parentNodeScope != null && isAllSiblingsSelected(scope.$parentNodeScope.node.nodes)) {
					scope.$parentNodeScope.node.isNodeSelected = true;
					scope.$parentNodeScope.node.showEditQuestionIcon = true;
					if(isNodeUsedForWizard(scope.$parentNodeScope.node, activeTest)){
						scope.$parentNodeScope.node.showTestWizardIcon = false;
					}else{
						scope.$parentNodeScope.node.showTestWizardIcon = true; 
					}				

					addingNodeInSelectedNodesArray(scope.$parentNodeScope.node);
					if(scope.$parentNodeScope.$parentNodeScope != null){
						checkSiblingSelection(scope.$parentNodeScope);
					}
				}
			}else if(scope.$parentNodeScope != null){
				scope.$parentNodeScope.node.showEditQuestionIcon = false;
				scope.$parentNodeScope.node.showTestWizardIcon = false; 
				scope.$parentNodeScope.node.isNodeSelected = false;			
				removeNodeFromSelectedNodes(scope.$parentNodeScope.node);
				if(scope.$parentNodeScope.$parentNodeScope!=null){
					checkSiblingSelection(scope.$parentNodeScope);
				}									
			}
		};	
		

		//no teb switch, restore selectedNodes items
		for (var i = 0; i < SharedTabService.tests.length; i++) {
			if (SharedTabService.tests[i].treeNode) {
				$scope.selectedNodes.push(SharedTabService.tests[i].treeNode);
			}
		}
		
        $scope.loadTree = function() {        	
        	
        	QuestionFolderService.defaultFolders(function (defaultFolders) {
        		if(defaultFolders==null){
        			CommonService.showErrorMessage(e8msg.error.cantFetchFolders)
        			return;
        		}       		
        		        		
            	QuestionFolderService.questionRootFolder(function(myQuestionRoot){
            		if(myQuestionRoot==null){
            			CommonService.showErrorMessage(e8msg.error.cantFetchRootFolder)
            			return;
            		}
            		$scope.myQuestionRoot = myQuestionRoot;
            	            	
	                $scope.defaultFolders = defaultFolders;
	                
	                QTI.initialize();
	                
	                $rootScope.blockLeftPanel.start();
	                UserQuestionsService.userQuestions(function(questions){
	                	if(questions==null){
	                		$rootScope.blockLeftPanel.stop();
	                		CommonService.showErrorMessage(e8msg.error.cantFetchTests)
	            			return;
	                	}
	                	var questionNumber = 0;	                	
	                	questions.forEach(function(userQuestion) {	             		
	                		
	                		var yourQuestion = {};						
							yourQuestion.isQuestion = true;
							yourQuestion.questionXML = true;

							yourQuestion.nodeType = "question";
							yourQuestion.questionType = "userCreatedQuestion";
							yourQuestion.guid = userQuestion.guid;
							yourQuestion.showEditQuestionIcon = false;
							yourQuestion.isNodeSelected = false;
							
							questionNumber++;
							yourQuestion.questnNumber = questionNumber;
							addToQuestionsArray(yourQuestion);

							yourQuestion.data = userQuestion.qtixml;
							yourQuestion.quizType = userQuestion.metadata.quizType;
							
							yourQuestion.qtiModel =  QtiService.getQtiModel(yourQuestion.data,yourQuestion.quizType);
							
							yourQuestion.extendedMetadata = userQuestion.metadata.extendedMetadata;						
	                		$scope.defaultFolders.push(yourQuestion);	
	                	});
	                	onTabLoadSetTreeNodesStatus();	                	 
	                	$rootScope.blockLeftPanel.stop();
	                });
	                
            	});
                
            	
                
            });
        	
        	
        }
        
        $scope.loadTree();        
        
        var onDragAndDropSetNodeStatus  = function(nodeScope,isSelected){
        	nodeScope.node.showEditQuestionIcon = isSelected;
        	nodeScope.node.isNodeSelected = isSelected;
        	nodeScope.node.showTestWizardIcon = isSelected;
        	checkSiblingSelection(nodeScope);
        }
        
        $scope.$on('ImportUserBooks', function() {		
			$scope.loadTree();								
		})

        $scope.treeOptions = {
                
                beforeDrag: function (sourceNodeScope) {
                    if((sourceNodeScope.node.hasOwnProperty('existInTestframe') && sourceNodeScope.node.existInTestframe == true) || 
                    (sourceNodeScope.node.hasOwnProperty('draggable') && sourceNodeScope.node.draggable == false) || sourceNodeScope.node.isEditMode){
                        sourceNodeScope.$$apply = false;
                        return false;
                    }    
                    sourceNodeScope.sourceOnly = true;
                    return true;
                },
                dragMove: function(e) {
                	$scope.dragStarted = true;
                	
                	/*
                	 * Saving placeholder and position to hide|show placeholder on enter|leave a folder node
                	 */ 
                	
                	$scope.placeElm = e.elements.placeholder;
                	$scope.position = e.pos;
                	//deselectNodesOnDrag(e.source.nodeScope.node);
                	if($rootScope.tree && $rootScope.tree.mouseOverNode){
                		if(!isForeign(e)){
    	                	$scope.position.cancel = true;
                    	}
                		var mouseOverNode = $rootScope.tree.mouseOverNode
                		if(mouseOverNode.node.isNodeSelected){
                			$scope.selectedMouseOverNode = mouseOverNode.node;
                			mouseOverNode.node.isNodeSelected = false;
                		}
                	}
                	
                	if(e.dest.nodesScope.$parent.controller =="TestCreationFrameController") {
                		CommonService.autoScrollRightFrame($('div#qstnArea'), e);
                	} else {
                    	CommonService.autoScrollLeftFrame($('div#MyTest-tree-root'), e);	
                	}                	
                    
                },
                dragStart: function(e) {
                	$('body *').css({'cursor':'url("images/grabbing.cur"), move'});
                	e.source.nodeScope.sourceOnly = false;
                },
                dragStop: function(e) {
                	$('body *').css({'cursor':''});
                	$scope.dragStarted = false;
                },
                beforeDrop: function(e) {
                    
                	if(SharedTabService.tests[SharedTabService.currentTabIndex].isTestWizard)
                		return false;
                	
                    var source = e.source.nodeScope;
                    var sourceParent = e.source.nodeScope.$parentNodeScope;

                    var mouseOverNode = null;
                    if($rootScope.tree)
                        mouseOverNode = $rootScope.tree.mouseOverNode;

                    if (mouseOverNode) {
                        $rootScope.tree = { mouseOverNode: null };
                        mouseOverNode.hover = false;
                        $scope.dragStarted = false;
                    }

                    if (mouseOverNode && (mouseOverNode.node != source.node)) {

                        e.source.nodeScope.$$apply = false;
                        $scope.dropIntoFolder(source, sourceParent, mouseOverNode);
                        return;                        
                    }                    

                    var destIndex = e.dest.index;
                    
                    var prev;
                    if(e.source.index < destIndex) {
                    	prev = e.dest.nodesScope.childNodes()[destIndex];	
                    } else {
                    	prev = e.dest.nodesScope.childNodes()[destIndex-1];
                    }
                    
                    var next;
                    if(e.source.index < destIndex) {
                    	next = e.dest.nodesScope.childNodes()[destIndex+1];	
                    } else {
                    	next = e.dest.nodesScope.childNodes()[destIndex];
                    }                                            

                    if(source.node.nodeType=="question") {
                        if(next && next.node.nodeType == "folder") { 
                            e.source.nodeScope.$$apply = false;
                            $scope.dragStarted = false;
                            return;
                        }                    
                    }     
                    
                    if(source.node.nodeType=="folder") {
                        if(prev && prev.node.nodeType == "question") { 
                            e.source.nodeScope.$$apply = false;
                            $scope.dragStarted = false;
                            return;
                        }                    
                    }  

                    var destination = e.dest.nodesScope;

                    var editModeQuestions=$(destination.$parent.$element).find("li[printmode=false]");

                    if(editModeQuestions.length>0 && destination.$parent.controller =="TestCreationFrameController"){
                        $scope.dragStarted = false;
                        e.source.nodeScope.$$apply = false;
                        $rootScope.$broadcast('beforeDrop');
                    }
                    
                    var IsTargetAreaInScope=false;     
                    if(angular.element(e.target).hasClass('angular-ui-tree')) {
                        IsTargetAreaInScope = true;                  
                    }                      

                    if( !IsTargetAreaInScope && 
                            (destination.$parent &&  
                                    (
                                            $(destination.$parent.$element).find("ol").attr('droppable') == 'false' ||
                                            $(destination.$parent.$element).closest("ol").attr('droppable') == 'false'
                                    )                              
                            )
                    ) {

                        e.source.nodeScope.$$apply = false;
                        $scope.dragStarted = false;
                    }
                    if(destination.node){
                        if(destination.node.nodeType == "archiveRoot"){

                            e.source.nodeScope.$$apply = false;
                            $scope.dragStarted = false;
                        }
                    }
 
                },
                dropped: function(e) {
                    
                    var destParent = e.dest.nodesScope.$parent;
                    var source = e.source.nodeScope;
                    var sourceParent = e.source.nodeScope.$parentNodeScope;
                    var sourceIndex = e.source.index;
                    var destIndex = e.dest.index;
                    var prev = e.dest.nodesScope.childNodes()[destIndex-1];
                    var next = e.dest.nodesScope.childNodes()[destIndex+1];                                        
                    if(sourceIndex == destIndex && source.controller == destParent.controller){
                        $scope.dragStarted = false;
                        e.source.nodeScope.$$apply = false;
                        return false;
                    }
                    if(destParent.controller == "TestCreationFrameController" ){
                    	if(SharedTabService.tests[SharedTabService.currentTabIndex].questions 
                    			&& SharedTabService.tests[SharedTabService.currentTabIndex].questions.length){

                    		SharedTabService.tests[SharedTabService.currentTabIndex].questions.splice(destIndex, 1);
                    	}else if(SharedTabService.tests[SharedTabService.currentTabIndex].criterias){
                    		
                    		var index = 0, criteriaIndex = 0;
                    		SharedTabService.tests[SharedTabService.currentTabIndex].criterias.forEach(function(criteria) {
                    			if(criteria.nodeType) {
                    				criteriaIndex = index;                    					
                    			}
                    			index++;
                    		});
                    		SharedTabService.tests[SharedTabService.currentTabIndex].criterias.splice(criteriaIndex, 1);
                    	}
                    }
                	
                    $scope.dragEnd(e, destParent, source, sourceParent,
                              sourceIndex, destIndex, prev, next);     
                }
              };

        $scope.dropIntoFolder = function (source, sourceParent, mouseOverNode) {
            var item = source.node;                                                                                            
            
            if(item.nodeType == EnumService.NODE_TYPE.folder) {
                item.parentId = mouseOverNode.node.guid;
                $rootScope.blockLeftPanel.start();
                QuestionFolderService.getFoldersMinSeq(mouseOverNode.node, function(minSeq) {
                	item.sequence = minSeq==0.0 ? 1.0 : (0.0 + minSeq)/2;
                	QuestionFolderService.saveQuestionFolder(item, function(userFolder) {
                		
                        if (userFolder == null) {
                        	$rootScope.blockLeftPanel.stop();
                            CommonService.showErrorMessage(e8msg.error.cantSave);
                            return;
                        }else if(userFolder == EnumService.HttpStatus.CONFLICT) {
                			$rootScope.blockLeftPanel.stop();
            	            $scope.IsConfirmation = false;
            	            $scope.message = e8msg.validation.duplicateFolderTitle;
            	            $modal.open(confirmObject);        		
                    		return;
                		}
                        
                        source.remove();
                    	if(mouseOverNode.node.nodes) {          
            				if(mouseOverNode.node.nodes[0].nodeType == EnumService.NODE_TYPE.emptyFolder) {
            					mouseOverNode.node.nodes.splice(0, 1);            					
            				} 
            				mouseOverNode.node.nodes.unshift(item);
                    	}
            			if(sourceParent && sourceParent.node && sourceParent.node.nodes.length==0) {
            				sourceParent.node.nodes.push(CommonService.getEmptyFolder());
            			}                    			
            			
                		$rootScope.blockLeftPanel.stop();
                	});                	
                })                	
            } else {
            	
            	source.remove();
            	
            	var sourceFolder = $scope.removeTestBindingFromSource(sourceParent, item.guid);
            	QuestionFolderService.saveQuestionFolder(sourceFolder, function(userFolder) {
            		if(userFolder==null){
                		$rootScope.blockLeftPanel.stop();
                 		CommonService.showErrorMessage(e8msg.error.cantSave);
                 		return;
                 	}
            		$scope.insertTestBindingToDest(mouseOverNode, item.guid, function() {
            			
            			if(mouseOverNode.node.nodes) {          
            				if(mouseOverNode.node.nodes[0].nodeType == EnumService.NODE_TYPE.emptyFolder) {
            					mouseOverNode.node.nodes.splice(0, 1);
            				}
            				mouseOverNode.node.nodes.unshift(item);
            				var questnNumber = 0;
            				mouseOverNode.node.nodes.forEach(function(item){          
            					item.questnNumber = questnNumber + ((item['nodeType']=="question")?1:0);
            					questnNumber++;
            				});                

            			}
            			
            			if(sourceParent && sourceParent.node && sourceParent.node.nodes.length==0) {
            				sourceParent.node.nodes.push(CommonService.getEmptyFolder());
            			}
            			
            			if(sourceParent == null) {
            				var questionIndex = 0;
            				$scope.defaultFolders.forEach(function(node){
            					if(node.nodeType == EnumService.NODE_TYPE.question) {
            						node.questnNumber = ++questionIndex;
            					}
            				})
            			}
            			if(sourceParent && sourceParent.node) {
            				var questionIndex = 0;
            				sourceParent.node.nodes.forEach(function(node){
            					if(node.nodeType == EnumService.NODE_TYPE.question) {
            						node.questnNumber = ++questionIndex;
            					}
            				})
            			}
                		$rootScope.blockLeftPanel.stop();                        			
            		});

            	});            		              	               	
            }
        };
        

        $scope.dragEnd = function (event, destParent, source, sourceParent,
  			  sourceIndex, destIndex, prev, next) {
        	          
  			if(!$scope.dragStarted) {
                return false;
            }
  			
  			$scope.dragStarted = false;  			            
  			
			if (!source.node.isNodeSelected) {
				$scope.selectNode(null,source);
			}

            if(!(destParent.controller === EnumService.CONTROLLERS.myQuestion)){        

                if (SharedTabService.tests[SharedTabService.currentTabIndex].isTestWizard) {
                    $scope.createTestWizardCriteria(source, "dragEvnt");
                } else {
                    $scope.editQuestion(source.node, destIndex, "dragEvnt");
                }    
                
                return false;
            }
            
            $rootScope.blockLeftPanel.start();                        

            if (sourceIndex != destIndex) {
                source.node.selectTestNode = false;
            }

            var item = source.node;

            var duplicateTitle = false;

            if(destParent == null || destParent.node == null) {
            	if(item.nodeType == EnumService.NODE_TYPE.folder) {
            		$scope.defaultFolders.forEach(function(nodeItem) {                        
            			if(nodeItem.nodeType == EnumService.NODE_TYPE.folder && nodeItem.title == item.title && nodeItem.$$hashKey != item.$$hashKey) {
            				duplicateTitle = true;                    			 
            			}                        	                        
            		})

            		if(duplicateTitle) {
            			$scope.IsConfirmation = false;
            			$scope.message = "A folder already exists with this name.";
            			$modal.open(confirmObject);

            			if(sourceParent) {
            				sourceParent.node.nodes.splice(sourceIndex, 0, source.node);	
            			} else {
            				$scope.defaultFolders.splice(sourceIndex, 0, source.node);
            			}

            			$scope.defaultFolders.splice(destIndex, 1);

            			$rootScope.blockLeftPanel.stop();
            			return false;
            		}
            	}
            }
            if(destParent && destParent.node && destParent.node.nodes) {                	

            	if(item.nodeType == EnumService.NODE_TYPE.folder) {
            		destParent.node.nodes.forEach(function(nodeItem) {                        
            			if(nodeItem.nodeType == EnumService.NODE_TYPE.folder && nodeItem.title == item.title && nodeItem.$$hashKey != item.$$hashKey) {
            				duplicateTitle = true;                    			 
            			}                        	

            		})

            		if(duplicateTitle) {
            			$scope.IsConfirmation = false;
            			$scope.message = "A folder already exists with this name.";
            			$modal.open(confirmObject);

            			if(sourceParent) {
            				sourceParent.node.nodes.splice(sourceIndex, 0, source.node);	
            			} else {
            				$scope.defaultFolders.splice(sourceIndex, 0, source.node);
            			}

            			destParent.node.nodes.splice(destIndex, 1);

            			$rootScope.blockLeftPanel.stop();
            			return false;
            		}
            	}                	
            }

            var prevSeq = 0.0;
            var nextSeq = 0.0;
            $scope.itemSeq = 0.0;

            // delete empty previous and next node if any
            $scope.deleteEmptyNode(prev, next, destParent);

            if(item.nodeType == EnumService.NODE_TYPE.question) {

            	var sourceFolder = $scope.removeTestBindingFromSource(sourceParent, item.guid);   
            	QuestionFolderService.updateQuestionFolder(sourceFolder, function(userFolder) {
            		if(userFolder==null){
            			$rootScope.blockLeftPanel.stop();
            			CommonService.showErrorMessage(e8msg.error.cantSave);
            			return;
            		}
            		$scope.addTestToDest(destParent, function() {

            			if(sourceParent && sourceParent.node && sourceParent.node.nodes.length==0) {
            				sourceParent.node.nodes.push(CommonService.getEmptyFolder());
            				onDragAndDropSetNodeStatus(sourceParent,false);
            			}

            			if(sourceParent == null) {
            				var questionIndex = 0;
            				$scope.defaultFolders.forEach(function(node){
            					if(node.nodeType == EnumService.NODE_TYPE.question) {
            						node.questnNumber = ++questionIndex;
            					}
            				})
            			}
            			if(destParent.node) {
            				var questionIndex = 0;
            				destParent.node.nodes.forEach(function(node){
            					if(node.nodeType == EnumService.NODE_TYPE.question) {
            						node.questnNumber = ++questionIndex;
            					}
            				})
            			}
            			if(destParent == null || destParent.node == null) {
            				var questionIndex = 0;
            				$scope.defaultFolders.forEach(function(node){
            					if(node.nodeType == EnumService.NODE_TYPE.question) {
            						node.questnNumber = ++questionIndex;
            					}
            				})
            			}
            			if(sourceParent && sourceParent.node) {
            				var questionIndex = 0;
            				sourceParent.node.nodes.forEach(function(node){
            					if(node.nodeType == EnumService.NODE_TYPE.question) {
            						node.questnNumber = ++questionIndex;
            					}
            				})
            			}

            			$rootScope.blockLeftPanel.stop();
            		});                        
            	});            		            		
            }
            else if(item.nodeType == EnumService.NODE_TYPE.folder) {

            	if(prev) {
            		$scope.getFolderNodeSequence(prev.node);
            		prevSeq = $scope.itemSeq;
            	}
            	if(next) { 
            		$scope.getFolderNodeSequence(next.node);
            		nextSeq = $scope.itemSeq;
            	}            		 

            	if(destParent.node) {
            		item.parentId = destParent.node.guid;            			
            	} else {
            		item.parentId = $scope.myQuestionRoot.guid;
            	}

            	if(prevSeq == 0.0 && nextSeq == 0.0) {
            		item.sequence = 1.0;
            	} else if(prevSeq > 0.0 && nextSeq == 0.0) {
            		item.sequence = prevSeq + 1.0;
            	} else {
            		item.sequence = (parseFloat(prevSeq) + parseFloat(nextSeq)) / 2;	
            	}
            	QuestionFolderService.updateQuestionFolder(item, function(userFolder) {
            		if(userFolder==null){
            			$rootScope.blockLeftPanel.stop();
            			CommonService.showErrorMessage(e8msg.error.cantSave);
            			return;
            		}
            		if(sourceParent && sourceParent.node && sourceParent.node.nodes.length==0) {
            			sourceParent.node.nodes.push(CommonService.getEmptyFolder());
            			onDragAndDropSetNodeStatus(sourceParent,false);
            		}
            		$rootScope.blockLeftPanel.stop();
            	});
            }                            
        };
        
        $scope.insertTestBindingToDest = function(destFolder, questionId, callback) {
        	var destNode = destFolder.node;
        	var questionBindings = destNode.questionBindings;
        	        	
        	var firstNodeSequence = 0.0, newSequence = 1.0;
        	if(questionBindings.length) {
        		firstNodeSequence = questionBindings[0].sequence;
        		newSequence = (0.0 + firstNodeSequence) / 2;
        	}
        	
        	var questionBinding = {
    			questionId: questionId, sequence: newSequence
        	}
        	
        	destNode.questionBindings.unshift(questionBinding);
        	
        	QuestionFolderService.updateQuestionFolder(destNode, function(userFolder) {
        		if(userFolder==null){
             		CommonService.showErrorMessage(e8msg.error.cantSave);
             		return;
             	}
        		callback();
        	})
        }
        
        $scope.addTestToDest = function(destFolder, callback) {
        	var destNodes;
    		if(destFolder == null || destFolder.node == null) {
    			destNodes = $scope.defaultFolders;    			
    		} else {
    			destNodes = destFolder.node.nodes;
    		}
    		
        	var questionBindings = [];
        	var sequence = 1.0;
        	destNodes.forEach(function(question) {
        		if(question.nodeType == EnumService.NODE_TYPE.question) {
        			
            		var questionBinding = {
                			questionId: question.guid,
                			sequence: sequence  
            		}
            		questionBindings.push(questionBinding);
            		sequence = sequence + 1.0;
        		}        		 
        	})
        	
        	var destNode;
        	if(destFolder == null || destFolder.node == null) {
        		var destNode = $scope.myQuestionRoot;    			
    		} else {
    			destNode = destFolder.node;
    		}
        	
        	destNode.questionBindings = questionBindings;
        	QuestionFolderService.updateQuestionFolder(destNode, function(userFolder) {
        		if(userFolder==null){
             		CommonService.showErrorMessage(e8msg.error.cantSave);
             		return;
             	}
        		callback();
        	});
        }
        
        $scope.removeTestBindingFromSource = function (sourceFolder, questionId) {
        	var sourceNode;
    		if(sourceFolder == null || sourceFolder.node == null) {
    			sourceNode = $scope.myQuestionRoot;
    		} else {
    			sourceNode = sourceFolder.node;
    		}    		
    		
    		var questionBindings = sourceNode.questionBindings;
        	var index=0, indexToRemove=0;
        	
        	questionBindings.forEach(function(questionBinding) {
        		if(questionBinding.questionId == questionId) {
        			indexToRemove = index;
        		}
        		index = index + 1;        		
        	})
        	
        	questionBindings.splice(indexToRemove, 1);
        	sourceNode.questionBindings = questionBindings;
        	
        	return sourceNode;
    	}
        
        $scope.deleteEmptyNode = function(prev, next, destParent) {
        	if(prev && prev.node && "sequence" in prev.node && prev.node.sequence == 0){
        		destParent.node.nodes.splice(0,1);
        		onDragAndDropSetNodeStatus(destParent, true);
        	}
        		
        	if(next && next.node && "sequence" in next.node && next.node.sequence == 0){
        		destParent.node.nodes.splice(1,1);
        		onDragAndDropSetNodeStatus(destParent, true);
        	}
        	
        }
        
        $scope.getFolderNodeSequence = function(node) {
        	$scope.itemSeq = 0.0;
        	if(node.nodeType == EnumService.NODE_TYPE.folder) {
        		$scope.itemSeq = node.sequence;
        	}
        }
        
        $scope.getTestNodeSequence = function(node) {
        	$scope.itemSeq = 0.0;
        	if(node.nodeType == EnumService.NODE_TYPE.test) {
        		node.extendedMetadata.forEach(function(data) {
            		if(data.name=='sequence') {        			
            			$scope.itemSeq =  data.value;        			
            		}
            	}); 	
        	}
        }        

        $scope.treeNodeMouseEnter = function (node) {
            if ($scope.dragStarted && node.collapsed 
            		&& node.node.nodeType != EnumService.NODE_TYPE.archiveFolder 
            		&& node.node.nodeType != EnumService.NODE_TYPE.emptyFolder) {
                $rootScope.tree = { mouseOverNode: node };
                
                if($scope.position){
                	/*
                     * This block of code will hide placeholder and show selection on folder node.                     *
                     */                	 
                	$scope.placeElm.css('display', 'none');
                	node.hover = true;                	
                	$scope.position.cancel = true; //  This variable prevents the code for showing placeholder in dragMove event of uiTree
                }
            }
        };

        $scope.treeNodeMouseLeave = function (node) {

            $rootScope.tree = { mouseOverNode: null };
            
            if($scope.position){            	
            	/*
                 * This block of code will show placeholder and hide selection on folder node.                     *
                 */            		
            	$scope.placeElm.css('display', '');
            	node.hover = false;            	
            	$scope.position.cancel = false;            
            }
            
            if($scope.selectedMouseOverNode){
            	$scope.selectedMouseOverNode.isNodeSelected = true;
            	$scope.selectedMouseOverNode = null;
            }
        }      
     		
		var onSelectionUpdateNodeStatus = function(scope) {
			var node = scope.node;
			var activeTest = SharedTabService.tests[SharedTabService.currentTabIndex];

			node.showTestWizardIcon  = !isNodeUsedForWizard(node, activeTest);

			if (isNodeInTestFrame(node)) {
				node.showEditQuestionIcon = false;
				node.existInTestframe = true;
				node.isNodeSelected = true;
			} else {
				node.showEditQuestionIcon = node.isNodeSelected;
				node.existInTestframe = false;
				if (node.isNodeSelected) {
					addingNodeInSelectedNodesArray(node);	
				}else{
					removeNodeFromSelectedNodes(node);	
				}
			}		

			checkSiblingSelection(scope);
		}	
		
		//to skip the selection of a node if node is present in test frame.
		var skipNodeSelection=function(node){
			if(node.isNodeSelected && (node.showEditQuestionIcon == false || node.showTestWizardIcon == false) && node.existInTestframe == true ){
				return true;
			}								
		}
		
		$scope.selectNode = function (event,scope) {
			
			if(event != null){
				event.preventDefault(); //Avoids event conflict
			}
			
			var node = scope.node;
			if(node.isEditMode){
				return;
			}
			
			if(skipNodeSelection(node)){
				return;
			}
			
			if(node.nodeType == EnumService.NODE_TYPE.question && (scope.$parentNodeScope) && (scope.$parentNodeScope.node.isNodeSelected && scope.$parentNodeScope.node.showTestWizardIcon == false)){
				return;
			}
			
			if ($scope.showAddFolderPanel) {
				$scope.showAddFolderPanel = false;
			}
			if (node.isNodeSelected == false
					&& $rootScope.globals.loginCount <= evalu8config.messageTipLoginCount
					&& node.nodeType != EnumService.NODE_TYPE.question
					&& node.nodeType != EnumService.NODE_TYPE.publisherTests) {
				$('.questionMessagetip').show()
				setTimeout(function() {
					$('.questionMessagetip').hide();
				}, 5000);
			}

			if (node.isNodeSelected) {
				if (isNodeInTestFrame(node)) {
					return false;
				}
			}

			node.isNodeSelected = !node.isNodeSelected;
			onSelectionUpdateNodeStatus(scope);
			if (typeof (node.nodes) != 'undefined') {
				checkChildSelection(scope.node);	
			}

		};
		
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
			return ($scope.isNodeUsedForEdit(node, test) || isNodeUsedForWizard(node, test));
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
			if(eventType ==null || eventType =='' || eventType == undefined){
				eventType = "clickEvnt";
			}

			var test = SharedTabService.tests[SharedTabService.currentTabIndex];
			
			 $scope.addSelectedQuestionsToTestTab(test, destIndex, eventType,scope);								     
			
			
		}
		
		$scope.addSelectedQuestionsToTestTab = function(activeTest, destIndex, eventType,scope) {
        	var selectedScopeNode = typeof scope.node == "undefined" ? scope : scope.node;
        	
        	if(selectedScopeNode.nodeType == "question" && activeTest.isTestWizard) {
            	$scope.IsConfirmation = false;
            	$scope.message = "A Question cannot be added to the TEST Wizard.";
            	$modal.open(confirmObject);
            	$scope.dragStarted = false;
            	return false;        		
        	}

        	if (activeTest.isTestWizard) {
        		$rootScope.$broadcast('handleBroadcast_AddNewTab');
        		activeTest = SharedTabService.tests[SharedTabService.tests.length-1];
        	}
        	
        	if(!selectedScopeNode.showEditQuestionIcon){
        		$scope.isAnyNodeAlreadyAdded = true;
        	}
        	
        	if(selectedScopeNode.nodeType == EnumService.NODE_TYPE.question && eventType == "clickEvnt"){
				addQuestionToTestFrameTab(activeTest,destIndex,eventType,scope);
			//}else if((selectedScopeNode.nodeType == EnumService.NODE_TYPE.chapter || selectedScopeNode.nodeType == EnumService.NODE_TYPE.topic) && eventType == "clickEvnt"){
        	}else if (eventType == "clickEvnt"){
				addFoldersToTestTab(activeTest, destIndex,scope,eventType)
			}else{
                $scope.addQuestionsToTestTab(activeTest, destIndex, eventType,selectedScopeNode,$scope.isAnyNodeAlreadyAdded);
				$scope.isAnyNodeAlreadyAdded = false;
			}        

		}		
		
		//to set the status of the question node,if the question node present in test frame.
		var setAddedFolderNodeStatus=function(item){
			item.existInTestframe=true;
			item.isNodeSelected = true;
			item.showEditQuestionIcon = false;
			item.showTestWizardIcon = true;													
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
		
		//remove a node from array by ID.
		var addNodeIdToArray = function(nodes,nodeID) {
			if(!isNodeInArray(nodes,nodeID)){
				nodes.push(nodeID);
			}
		}
		
		
		var getImmediateChildren = function (nodeScope, immediateChildren) {	
			if(nodeScope.nodes){
				nodeScope.nodes.forEach(function(node) {
					if(node.nodes){		
						immediateChildren.push(node);
						getImmediateChildren(node, immediateChildren);
					}
				})
			}								
			return immediateChildren;
		}
			
		var addFoldersToTestTab = function (activeTest, destIndex,scope,eventType) {	
			var clickedFolder = typeof scope.node == "undefined" ? scope : scope.node;
			
			var httpReqCount = 0,httpReqCompletedCount = 0,processedNodeCount = 0;
			var isAllNodesNotAdded=false;
		
			var emptyResponseNodes = [];		
			
			
			setAddedFolderNodeStatus(clickedFolder);
			addingNodeToArray(activeTest.questionFolderNode,clickedFolder);		
			
			var processingNodes=[];
			processingNodes.push(clickedFolder);								
			
			for (var i = 0; i < processingNodes.length; i++) {
				processedNodeCount++;
				
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
							var immediateChildren =[];
							getImmediateChildren(questionFolder, immediateChildren);
							immediateChildren.forEach(function(node) {
								addNodeIdToArray(emptyResponseNodes,node.guid);	
							});
							addNodeIdToArray(emptyResponseNodes,questionFolder.guid);	
							addNodeIdToArray(emptyResponseNodes,questionFolder.parentId);	
							isAllNodesNotAdded=true;
							removeNodeByID(activeTest.questionFolderNode,questionFolder.guid);									
						}
						
						processHierarchyNodeStatus(processedNodeCount,processingNodes,httpReqCount,
								httpReqCompletedCount,isAllNodesNotAdded,clickedFolder,scope,activeTest,emptyResponseNodes);
						
						
					});
					

			}							
			
			processHierarchyNodeStatus(processedNodeCount,processingNodes,httpReqCount,
					httpReqCompletedCount,isAllNodesNotAdded,clickedFolder,scope,activeTest,emptyResponseNodes);
			
		}
		
		
		var processHierarchyNodeStatus = function(processedNodeCount,processingNodes,httpReqCount,
				httpReqCompletedCount,isAllNodesNotAdded,clickedFolder,scope,activeTest,emptyResponseNodes){
			
			if (processedNodeCount == processingNodes.length && httpReqCount == httpReqCompletedCount) {
				
				if(scope.node.nodes && !emptyResponseNodes.length>0){
					updateNodeHierarchyStatus(scope.node,activeTest);
				}
					
				if(isAllNodesNotAdded){
					clickedFolder.showEditQuestionIcon = true;									
					removeNodeByID(activeTest.questionFolderNode,clickedFolder.guid);	
				}
				if(SharedTabService.errorMessages.length > 0)
					SharedTabService.TestWizardErrorPopup_Open();					
				
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
			if(scope.$parentNodeScope==null){
				return false;
			}
				if(isAllSiblingsInTestFrame(scope,activeTest)) {
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
		
		var addQuestionToTestFrameTab = function (activeTest,destIndex,eventType,nodeScope) {							 
			if (nodeScope.node.showEditQuestionIcon) {					
					if (activeTest.IsAnyQstnEditMode) {
						nodeScope.node.showEditQuestionIcon = true;
						$scope.IsConfirmation = false;
						$scope.message = "A question is already in Edit mode, save it before adding or reordering questions.";
						$modal.open(confirmObject);
						$scope.dragStarted = false;
					}else{      
						$rootScope.blockPage.start();
						nodeScope.node.showEditQuestionIcon = false;
						$rootScope.$broadcast("dropQuestion",nodeScope.node, destIndex,"QuestionBank", eventType);
						nodeScope.node.existInTestframe = true;
						if(nodeScope.$parentNodeScope!=null)checkAllSibblingNodeInTestFrame(nodeScope,activeTest);
					}    

			}
		};
		
		//To add a node to questionFolderNode array.
		var checkAllSibblingNodeInTestFrame = function(scope, activeTest) {								
			scope.node.existInTestframe = true;								
			if(isAllSiblingsSelected(scope.$parentNodeScope.node.nodes)){
				scope.$parentNodeScope.node.showEditQuestionIcon = true;
				scope.$parentNodeScope.node.showTestWizardIcon = true; 
				scope.$parentNodeScope.node.isNodeSelected = true;	
				if(isAllSiblingsInTestFrame(scope,activeTest)){					
					scope.$parentNodeScope.node.showEditQuestionIcon = false;
					scope.$parentNodeScope.node.existInTestframe = true;			
					addingNodeInQuestionFolderNodeArray(scope.$parentNodeScope.node,activeTest);
				}
				addingNodeInSelectedNodesArray(scope.$parentNodeScope.node,activeTest);
				if(scope.$parentNodeScope.$parentNodeScope != null){
					checkAllSibblingNodeInTestFrame(scope.$parentNodeScope,activeTest);
				}
			}
		}
		
		//To check all child nodes of the parent node are selected.
		var isAllSiblingsInTestFrame = function(scope,test) {
			var allSiblingsNotExistInTestFrame=false;
			scope.$parentNodeScope.node.nodes.forEach(function(node) {										
				if(!isNodeInTestFrame(node)){
					allSiblingsNotExistInTestFrame = true;
					return;
				} 																	
			});	

			return !allSiblingsNotExistInTestFrame;																
		}	
		
		//To add a node to questionFolderNode array.
		var addingNodeInQuestionFolderNodeArray = function(node,activeTest) {		
			var existInquestionFolderNode;			
			if(typeof(activeTest.questionFolderNode) != "undefined" ){
				for (var i = 0; i < activeTest.questionFolderNode.length; i++) {
					if (activeTest.questionFolderNode[i].guid == node.guid) {
						existInquestionFolderNode =true;
						break;
					}
				}
			}
			
			if(!existInquestionFolderNode){
				activeTest.questionFolderNode.push(node);	
			}		
		}
		
		$scope.addQuestionsToTestTab = function (test, destIndex, eventType, isAnyNodeAlreadyAdded) {
		    var httpReqCount = 0,
                httpReqCompletedCount = 0,
                uniqueNodeCount = 0;

			for (var i = 0; i < $scope.selectedNodes.length; i++) {
				if($scope.selectedNodes[i].nodeType != EnumService.NODE_TYPE.question){
                    $scope.selectedNodes[i].existInTestframe = true;
				test.questionFolderNode.push($scope.selectedNodes[i]);
				}
				
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

					} else {
						
				        httpReqCount++;
						$rootScope.blockPage.start();
						
						$scope.selectedNodes[i].showEditQuestionIcon = false;
						var questionFolder = $scope.selectedNodes[i];
						getQuestions(questionFolder, function(response, questionFolder) {
							if(!isAnyNodeAlreadyAdded) {
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
							$rootScope.$broadcast(
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
							}
						});
					}

				}
			}
			if((uniqueNodeCount == 0 && $scope.selectedNodes.length !=0) || httpReqCount == 0){
				$scope.showDuplicateQuestionsAlert();
			}
		}
		
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
		
        $scope.createTestWizardMode=false; 
        
    	
 /**********************************************************Start**************************************************/
  //This block of code is to manage the adding/draging the folder to the wizard frame.        

        var isAllSiblingsInWizardFrame = function(scope,test) {
			var allSiblingsNotExistInWizardFrame=false;			
				scope.$parentNodeScope.node.nodes.forEach(function(node) {	
					if(!isNodeUsedForWizard(node, test)){
						allSiblingsNotExistInWizardFrame = true;
						return;
					} 																	
				});	
				
			return !allSiblingsNotExistInWizardFrame;																
		}
		
		var updateSelectedWizardFolderNodeStatus = function(node){		
			node.isNodeSelected = true;
			node.showTestWizardIcon = false;
			node.showEditQuestionIcon = true;
			node.existInTestframe=true;
		}
		
		var updateSelectedWizardFolderQuestionNodeStatus = function(node){		
			node.isNodeSelected = true;
			node.showTestWizardIcon = false;
			node.showEditQuestionIcon = true;
			node.existInTestframe=false;
		}
		
		
		var updateSelectedWizardFolderQuestionsNodeStatus = function(node){			
			if(node.nodes){
				node.nodes.forEach(function(node) {	
					if (node.nodeType == EnumService.NODE_TYPE.question) {
						updateSelectedWizardFolderQuestionNodeStatus(node);
						addingNodeInSelectedNodesArray(node);
						updateSelectedWizardFolderQuestionsNodeStatus(node);											
					}else{						
						updateSelectedWizardFolderNodeStatus(node);
						addingNodeInSelectedNodesArray(node);
						updateSelectedWizardFolderQuestionsNodeStatus(node);	
					}											
				});
			}		
		}
		
		var updateSelectedWizardFolderChildNodeStatus = function(node){			
			if(node.nodes){
				node.nodes.forEach(function(node) {	
					if (node.nodeType != EnumService.NODE_TYPE.question) {
						updateSelectedWizardFolderNodeStatus(node);
						updateSelectedWizardFolderChildNodeStatus(node);		
					}											
				});
			}		

		}
		
		var checkSiblingTopicSelectionForWizard = function(scope,activeTest){
			if(scope.$parentNodeScope && (isAllSiblingsInWizardFrame(scope,activeTest))){
				scope.$parentNodeScope.node.showTestWizardIcon = false;
				scope.$parentNodeScope.node.existInTestframe=true;
				addingNodeInSelectedNodesArray(scope.$parentNodeScope.node);
			}
			if(scope.node.nodes)updateSelectedWizardFolderChildNodeStatus(scope.node);		
		};
		
		
        
        var addWizardToTestFrameTab = function(scope, currentNode, test){       
        	updateSelectedWizardFolderNodeStatus(currentNode);		
        	$rootScope.blockPage.start();
        	getQuestions(
        			currentNode,
        			function (response, currentNode) {
        				try {					    	
        					if (response.length) {        						
        						$rootScope.$broadcast(
        								"handleBroadcast_createTestWizardCriteria",
        								response,currentNode);		        		
        						addingNodeInSelectedNodesArray(currentNode);
        						updateSelectedWizardFolderQuestionsNodeStatus(currentNode);
        						checkSiblingTopicSelectionForWizard(scope,test);
        					} else {
        						SharedTabService.addErrorMessage(currentNode.title, e8msg.warning.emptyFolder);
        						currentNode.showTestWizardIcon = true;          
        						SharedTabService.TestWizardErrorPopup_Open();
        					}

        				} catch (e) {
        					console.log(e);
        				} finally {        					
        					$rootScope.blockPage.stop();
        				}
        			});

        }
        
        var dragNodesToWizardFrameTab = function(){        	
        	var chapters = [];
        	for (var i = 0; i < $scope.selectedNodes.length; i++) {
        		var parentNodeExist=false;
        		for (var j = 0; j < $scope.selectedNodes.length; j++) {
        			if ($scope.selectedNodes[i].parentId == $scope.selectedNodes[j].guid ) {            			
        				parentNodeExist = true;
        				if ($scope.selectedNodes[i].nodeType != EnumService.NODE_TYPE.question) {
        					$scope.selectedNodes[i].existInTestframe = true;        					
        				}
        				$scope.selectedNodes[i].showTestWizardIcon = false;
        				break;
        			}
        		}        	
        		if(!parentNodeExist){
        			chapters.push($scope.selectedNodes[i]);
        		}
        	}

        	for (var i = 0; i < chapters.length; i++) {
        		var currentNode = chapters[i];
        		if (currentNode.showTestWizardIcon) {
        			if (currentNode.nodeType === EnumService.NODE_TYPE.question) {
        				$scope.createTestWizardMode=false;
        				continue;
        			}

        			if (currentNode.nodes && !currentNode.isCollapsed) {
        				separateDraggedFoldersAndQuestions(currentNode ,currentNode.nodes);
        			}else{
        				addDraggedFoldersToWizardFrame(currentNode);
        			}
        		}
        	}
        }
        	
        var	separateDraggedFoldersAndQuestions = function(parentNode, children){
        	var questionsTobeAddedToWizard = [];
        	parentNode.showTestWizardIcon = false;
        	for (var i = 0; i < children.length; i++) {
        		if(children[i].nodeType != "question"){
        			if(children[i].nodes  && !children[i].isCollapsed){
        				separateDraggedFoldersAndQuestions(children[i], children[i].nodes);
        			}else{
        				addDraggedFoldersToWizardFrame(children[i]);
        			}
        		}else{
        			questionsTobeAddedToWizard.push(children[i]);
        		}
        	}
        	if(questionsTobeAddedToWizard.length > 0){
        		addQuestionNodesToWizardFrame(questionsTobeAddedToWizard ,parentNode);
        	}
        }
        
        
        var addQuestionNodesToWizardFrame = function(questionNodes, currentNode){
			$rootScope.$broadcast(
					"handleBroadcast_createTestWizardCriteria",
					questionNodes,currentNode);
			updateSelectedWizardFolderNodeStatus(currentNode);	
			//checkSiblingTopicSelectionForWizard(scope,test);
			//updateSelectedWizardFolderQuestionsNodeStatus(currentNode);
			
		}
        var httpReqCount = 0,
    	httpReqCompletedCount = 0;
        var addDraggedFoldersToWizardFrame = function(currentNode){
        	httpReqCount++;
        	currentNode.showTestWizardIcon = false;
        	currentNode.existInTestframe = true;
        	$rootScope.blockPage.start();
        	getQuestions(
        			currentNode,
        			function (response, currentNode) {
        				try {
        					httpReqCompletedCount++;
        					if (response.length) {        								
        						$rootScope.$broadcast(
        								"handleBroadcast_createTestWizardCriteria",
        								response,
        								currentNode);
        					} else {
        						SharedTabService.addErrorMessage(currentNode.title, e8msg.warning.emptyFolder);
        						currentNode.showTestWizardIcon = true;
        						if(currentNode.nodes){
        							updateEmptyNodeStatus(currentNode);
        						}
        					}

        					if (httpReqCount == httpReqCompletedCount && SharedTabService.errorMessages.length > 0) {
        						httpReqCount = 0;
        						httpReqCompletedCount = 0;
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
		var updateEmptyNodeStatus = function(node){
			node.nodes.forEach(function(node) {
				if (node.questionBindings && node.questionBindings.length == 0) {
					node.showTestWizardIcon = true;
				}
				if(node.nodes){
					updateEmptyNodeStatus(node);
				}
			})
		}
		
		var isWizardFrameAvailable = function(node){		
			var activeTest = SharedTabService.tests[SharedTabService.currentTabIndex];         
			for (var j = 0; j < SharedTabService.tests.length; j++) {
				if (activeTest.id != SharedTabService.tests[j].id && SharedTabService.tests[j].isTestWizard ) {										
					return true;
					break;
				}
			}
			return false;
		}


        // TODO : need to move this to service.
        $scope.createTestWizardCriteria = function(
        		currentNode,eventType) {

        	if(isWizardFrameAvailable())return false;
        	
        	$scope.createTestWizardMode=true;

        	if(eventType ==null || eventType =='' || eventType == undefined){
        		eventType = "clickEvnt";
        	}

        	if (!SharedTabService.isTestWizardTabPresent) {
        		$rootScope.$broadcast('handleBroadcast_AddTestWizard');
        	}

        	var tab = SharedTabService.tests[SharedTabService.currentTabIndex];
        	
        	if(SharedTabService.isErrorExist(
                    currentNode.node, $scope.selectedNodes)) {					
                SharedTabService.TestWizardErrorPopup_Open();
                return false;
            }

        	if( eventType == "clickEvnt"){
        		addWizardToTestFrameTab(currentNode, currentNode.node, tab);				
        	}else{
        		dragNodesToWizardFrameTab(currentNode, currentNode.node, tab);				
        	}

        }

  /**********************************************************End**************************************************/
        
        
		function getQuestions(currentNode, callBack) {
			
		    UserQuestionsService.allFolderQuestions(currentNode.guid, function (userQuestions) {
		        var responceMetadatas = [];
		        for (var i = 0; i < userQuestions.length; i++) {
		            responceMetadatas.push(userQuestions[i].metadata);
		        }
		        callBack(responceMetadatas, currentNode)
		    })			
		}
		
        $scope.getFolders = function(defaultFolder) {
        	if($scope.showAddFolderPanel){
        		$scope.showAddFolderPanel = false;
        	}
        	if(defaultFolder.node.nodeType == EnumService.NODE_TYPE.folder) {
        		$scope.getUserFolders(defaultFolder);
        	}        	
        }
        
        var isAllChildsInWizardFrame = function(folders) {
        	var activeTest = SharedTabService.tests[SharedTabService.currentTabIndex];
        	var allSiblingsNotExistInWizardFrame=false;
        	folders.every(function(folder) {										
        		if(!isNodeUsedForWizard(folder, activeTest)){
        			allSiblingsNotExistInWizardFrame = true;
        			return false;
        		} 		
        		return true;
        	});	

        	return !allSiblingsNotExistInWizardFrame;																
        }

        var allQuestionBindingsInTestFrame = function(folder,activeTest){
        	var allQuestionNotInTestFrame = false;
        	if(folder.questionBindings.length>0){				
        		for (var i = 0; i < folder.questionBindings.length; i++) {	
        			if(activeTest.questions.length>0){	
        				for (var j = 0; j < activeTest.questions.length; j++) {
        					if(folder.questionBindings[i].questionId!=activeTest.questions[j].guid){
        						allQuestionNotInTestFrame = true;
        						break;
        					}
        				}
        			}else{
        				allQuestionNotInTestFrame=true;
        			}        			
        			if(allQuestionNotInTestFrame){			
        				break;
        			}
        		}
        	}else{
        		allQuestionNotInTestFrame = true;;
        	}
        	return !allQuestionNotInTestFrame;
        }


        //to change the status of the topic/chapter question node, when all childs are in test frame.
        var onParentExpandUpdateChildFolderStatus = function(expandedNode,childFolders,activeTest){	        	   
        	if(activeTest.isTestWizard){						
        		updateChildFolderStatusByWizardFrame(expandedNode,childFolders,activeTest);
        	}else{
        		updateChildFolderStatusByTestFrame(childFolders,activeTest);
        	}

        }

        var updateChildFolderStatusByTestFrame = function(childFolders,activeTest) {	        				
        	childFolders.forEach(function(folder) {			
        		if(allQuestionBindingsInTestFrame(folder, activeTest)){
        			folder.isNodeSelected = true;
        			folder.showEditQuestionIcon = false;
        			folder.showTestWizardIcon = true;
        			folder.existInTestframe = true;	
        			addingNodeInSelectedNodesArray(folder);				
        		}			
        	});				
        }											

        var updateChildFolderStatusByWizardFrame = function(expandedNode,childFolders,activeTest) {        							
        	childFolders.forEach(function(folder) {			
        		if(expandedNode.existInTestframe || isNodeUsedForWizard(folder, activeTest)){
        			folder.isNodeSelected = true;
        			folder.showEditQuestionIcon = true;
        			folder.showTestWizardIcon = false;
        			folder.existInTestframe = true;	
        		}
        		//add the node to $scope.selectedNodes array, if node is in selected status.
        		if(folder.isNodeSelected){													
        			addingNodeInSelectedNodesArray(folder);				
        		}
        	});	

        	if(!expandedNode.questionBindings){
        		if(isAllChildsInWizardFrame(childFolders)){
        			expandedNode.showEditQuestionIcon = true;
        			expandedNode.showTestWizardIcon = false;
        			expandedNode.isNodeSelected = true;		
        			expandedNode.existInTestframe = true;		
        			if(expandedNode.isNodeSelected)addingNodeInSelectedNodesArray(expandedNode); 
        		}
        	};        							
        }

        
        $scope.getUserFolders = function (defaultFolder, callback) {

        	if (!defaultFolder.collapsed) {
                defaultFolder.collapse();
                defaultFolder.node.isCollapsed = true;
            } else {
                defaultFolder.expand();
                defaultFolder.node.isCollapsed = false;
            }
             
             if(defaultFolder.node.nodes){
                 return false;
             }

            if (!defaultFolder.collapsed) {            	
				
				QuestionFolderService.getFoldersByParentFolderId(defaultFolder.node.guid, function (userFolders) {
					var activeTest = SharedTabService.tests[SharedTabService.currentTabIndex];
					var allChildNotInWizardFrame=true;
					userFolders.forEach(function(folder) {
						folder.showEditQuestionIcon = defaultFolder.node.showEditQuestionIcon;
						folder.showTestWizardIcon = defaultFolder.node.showTestWizardIcon;
						folder.isNodeSelected = defaultFolder.node.isNodeSelected;		
						if(defaultFolder.node.isNodeSelected)addingNodeInSelectedNodesArray(folder);   
					});
					
					onParentExpandUpdateChildFolderStatus(defaultFolder.node,userFolders,activeTest);					
					
					defaultFolder.node.nodes = userFolders;
					
	                QTI.initialize();
	                
	                $rootScope.blockLeftPanel.start();
	                UserQuestionsService.userBookQuestions(defaultFolder.node.guid, function(questions){
	                	
                    	if(userFolders.length == 0 && (questions == null || questions.length == 0)) {

    						userFolders.push(CommonService.getEmptyFolder());
    					}
                    	
	                	if(questions==null){
	                		$rootScope.blockLeftPanel.stop();
	                		CommonService.showErrorMessage(e8msg.error.cantFetchTests)
	            			return;
	                	}
	                	var questionNumber = 0;
	                	questions.forEach(function(userQuestion) {
	                		
							var yourQuestion = {};							
							
							yourQuestion.isQuestion = true;
							yourQuestion.questionXML = true;

							yourQuestion.nodeType = "question";
							yourQuestion.questionType = "userCreatedQuestion";
							yourQuestion.guid = userQuestion.guid;
							yourQuestion.showEditQuestionIcon = defaultFolder.node.showEditQuestionIcon;
							yourQuestion.isNodeSelected = defaultFolder.node.isNodeSelected;
							yourQuestion.existInTestframe = !defaultFolder.node.showEditQuestionIcon;
							if(yourQuestion.isNodeSelected){
								addingNodeInSelectedNodesArray(yourQuestion);		
							}
							
							questionNumber++;
							yourQuestion.questnNumber = questionNumber;
							
							yourQuestion.data = userQuestion.qtixml;
							yourQuestion.quizType = userQuestion.metadata.quizType;
							yourQuestion.extendedMetadata = userQuestion.metadata.extendedMetadata;							
							defaultFolder.node.nodes.push(yourQuestion);	
	                	});	                	
	                	setParentNodeAndChildNodeStatus(defaultFolder.node);
	                	
                        if (defaultFolder.node.nodes.length > 1 && defaultFolder.node.nodes[0].sequence == 0) {
                            defaultFolder.node.nodes.shift();
                        }
                        
	                	$rootScope.blockLeftPanel.stop();
	                });
                    
                    if(callback) callback();
                });                
            }
        };     
        
      
        
      //to change the status of the topic/chapter question node, when all childs are in test frame.
		var setParentNodeAndChildNodeStatus=function(folder){	
			
			var isAllChildNodeNotInTestFrame=false;
			for (var i = 0; i < folder.nodes.length; i++) {				
				if(isNodeInTestFrame(folder.nodes[i])){
					folder.nodes[i].isNodeSelected = true;
					folder.nodes[i].showEditQuestionIcon = false;
					folder.nodes[i].showTestWizardIcon = true;
					folder.nodes[i].existInTestframe = true;	
					addingNodeInSelectedNodesArray(folder.nodes[i]);		
				}else{
					isAllChildNodeNotInTestFrame=true;
				}				
			}

			if(!isAllChildNodeNotInTestFrame){
				folder.isNodeSelected = true;
				folder.showEditQuestionIcon = false;
				folder.showTestWizardIcon = true;
				folder.existInTestframe = true;						
				addingNodeToArray(SharedTabService.tests[SharedTabService.currentTabIndex].questionFolderNode,folder);	
				addingNodeInSelectedNodesArray(folder);					
			}							
		}
		
        
        var isAnyNodeCollapsed = false;
        function checkIfTestIsBeingEdited(folder) {
        	
        	if (folder.node.nodeType === 'folder'){
        		
        		//Check if the folder is immediate parent (need not be expanded) since test tab contains folder reference
            	if(checkIsTestInEditMode(folder.node)){       	
            		return true;
            	}else if (folder.collapsed){
            		isAnyNodeCollapsed=true;
            	}else if(folder.childNodesCount() > 0) { //perform recurssion for child nodes
        			for (var j = 0; j < folder.childNodesCount(); j++){
        				//If the folder is collapsed, set a flag to true 
        				if (checkIfTestIsBeingEdited(folder.childNodes()[j])){
	   						return true;
		   				 }
        			}
            	}       		
        	}
        	
	        return false;
        }
        
        function checkIsTestInEditMode(node){
        	
			for (var j = 0; j < SharedTabService.tests.length; j++) {
				 if (SharedTabService.tests[j].folderGuid == node.guid) {
					 return true;
		         }
			 }
        	return false;

        }
        
        function isAnyTestInEditMode(){
        	for(var j = 0; j < SharedTabService.tests.length; j++) {
        		if(SharedTabService.tests[j].testId){
        			return true;
        		}
        	}
        	return false;
        }        	
        
        function checkIfTestIsInList(tests){
        	for(var i = 0; i < tests.length; i++){
        		for(var j = 0; j < SharedTabService.tests.length; j++){
        			if(tests[i].guid == SharedTabService.tests[j].testId){
        				return true;
        			}
        		}
        	}
        	return false;
        }                		
        	
        var confirmObject = {
                templateUrl: 'views/partials/alert.html',
                controller: 'AlertMessageController',
                backdrop: 'static',
                keyboard: false,
                resolve: {
                    parentScope: function () {
                        return $scope;
                    }
                }
            };
        
        $scope.deleteFolder = function(folder) {
        	$scope.isFolderDeleteClicked=true;
    		$scope.IsConfirmation = true;        		
    		$scope.message="Are you sure you want to permanently delete this folder. This action cannot be undone. Click OK if you want to delete this folder";
    		
    		$modal.open(confirmObject).result.then(function(ok) {
	    		if(ok) {
        			ArchiveService.deleteFolder(folder.node.guid, function(response) {
        				if(response==null){
        					CommonService.showErrorMessage(e8msg.error.cantDeleteFolder)
                			return;
        				}
        				folder.remove(); 
	                    if($scope.archiveRoot && $scope.archiveRoot.node && $scope.archiveRoot.node.nodes && $scope.archiveRoot.node.nodes.length == 0 && $scope.defaultFolders.length == 1)
	                    	$scope.loadTree();
	                }); 
	    		}
    		})    		
        };
        
        
        $scope.deleteTest = function(test) {
        	$scope.isTestDeleteClicked=true;
    		$scope.IsConfirmation=true;   
    		$scope.message="Are you sure you want to permanently delete this test. This action cannot be undone. Click OK if you want to delete this test";

    		$modal.open(confirmObject).result.then(function(ok) {
	    		if(ok) {
	                ArchiveService.deleteTest(test.node.guid, test.$parentNodeScope.node.guid, function(response,status) {
	                	if(status!=200){
        					CommonService.showErrorMessage(response)
                			return;
        				}
	                    test.remove();
	                    
	                    if($scope.archiveRoot && $scope.archiveRoot.node && $scope.archiveRoot.node.nodes && $scope.archiveRoot.node.nodes.length == 0 && $scope.defaultFolders.length == 1)
	                    	$scope.loadTree();
	                }); 
	    		}
    		})
        };                
        
        // Rendering the question as html
        $scope.getHTML = function (datanode) {
            if (datanode.node.length) {
                return $sce.trustAsHtml(datanode.node[0].innerHTML);
            } else if (datanode.node) {
                return $sce.trustAsHtml(datanode.node.textHTML);
            }
        }

        $scope.editFolder = function (element, node) {
            var rootFolders = $scope.defaultFolders;
            if (element.$parentNodeScope) {
                rootFolders = element.$parentNodeScope.$parent.node.nodes;
            }
            var userFolder = node;
            if(userFolder.title == userFolder.titleTemp){
            	userFolder.isEditMode = false;
            	return;
            }
            $scope.editingFolder = node;
            if (userFolder.title == null || userFolder.title.trim().length == 0) { return; }

            if (rootFolders
            		&& rootFolders[0]
            		&& rootFolders[0].nodeType == EnumService.NODE_TYPE.folder) {

                var duplicateTitle = false;
                rootFolders.forEach(function (rootFolder) {
                    if (rootFolder.guid != userFolder.guid && rootFolder.titleTemp == userFolder.title && rootFolder.nodeType == EnumService.NODE_TYPE.folder) {
                        duplicateTitle = true;

                        $scope.message = "A folder already exists with this name. Please save with another name.";
                        $scope.editingFolder.isEditMode = true;

                        $modal.open(confirmObject).result.then(function (ok) {
                            if (ok) {
                                $("#txtFolderNameEdit_"+node.guid).focus();
                            }
                        });
                    }
                });

                if (duplicateTitle) return;

            }
             
            QuestionFolderService.saveQuestionFolder(userFolder, function (userFolder) {
                if (userFolder == null) {
                    CommonService.showErrorMessage(e8msg.error.cantSave);
                    return;
                }else if(userFolder == EnumService.HttpStatus.CONFLICT) {
        			$rootScope.blockLeftPanel.stop();
    	            $scope.IsConfirmation = false;
    	            $scope.message = e8msg.validation.duplicateFolderTitle;
    	            $modal.open(confirmObject);        		
            		return;
        		}
                // $scope.loadTree();

                userFolder.nodeType = "folder";
                //rootFolders.unshift(userFolder);
                $scope.editingFolder.isEditMode = false;
                $scope.editingFolder.titleTemp = angular.copy(userFolder.title);                           

                $scope.folderName = "";

                userFolder.isEditMode = false;
            });
        }

        $scope.addNewFolder = function () {        	
        	$('.tooltip').remove();
        	if($scope.folderName == null || $scope.folderName.trim().length==0) { return; }
        	
            var sequence = 1;

            if($scope.defaultFolders 
            		&& $scope.defaultFolders[0] 
            		&& $scope.defaultFolders[0].nodeType == EnumService.NODE_TYPE.folder) {
            	
            	var duplicateTitle = false;
            	$scope.defaultFolders.forEach(function(rootFolder) {
            		if(rootFolder.title == $scope.folderName && rootFolder.nodeType == EnumService.NODE_TYPE.folder) {
            			if(rootFolder.titleTemp != $scope.folderName){
                            return;
                        }
            			duplicateTitle = true;	
            			
            			$scope.isAddFolderClicked=true;
                        $scope.IsConfirmation = false;
                        $scope.message = "A folder already exists with this name. Please save with another name.";

                        $modal.open(confirmObject).result.then(function(ok) {
                            if(ok) {
                                $("#txtFolderName").focus();
                            }
                        });
            		}
            	});
            	
            	if(duplicateTitle) return;
            	
            	sequence = (0 + $scope.defaultFolders[0].sequence) / 2;
            }
            
            var userFolder = {
                "parentId": $scope.myQuestionRoot.guid,                
                "sequence": sequence,
                "title": $scope.folderName
            };
            $scope.folderName=null;
            QuestionFolderService.saveQuestionFolder(userFolder, function (userFolder) {
				if(userFolder==null){
             		CommonService.showErrorMessage(e8msg.error.cantSave);
             		return;
             	}else if(userFolder == EnumService.HttpStatus.CONFLICT) {
        			$rootScope.blockLeftPanel.stop();
    	            $scope.IsConfirmation = false;
    	            $scope.message = e8msg.validation.duplicateFolderTitle;
    	            $modal.open(confirmObject);        		
            		return;
        		}
            	
            	userFolder.nodeType = "folder";
            	$scope.defaultFolders.unshift(userFolder);
            	
                $scope.folderName = "";
               
                $scope.showAddFolderPanel = false;
            });
            
            $("#MyTest-tree-root")[0].scrollTop = 0; 

        }                
		
      // evalu8-ui : to set Active Resources Tab , handled in
		// ResourcesTabsController
        $rootScope.$broadcast('handleBroadcast_setActiveResourcesTab', EnumService.RESOURCES_TABS.yourquestions);

        // #region Save-as test
        $scope.$on('handleBroadcast_AddNewFolder', function (handler, newFolder) {
            var parentFolder = null;
            if (newFolder.parentId == null) {
                $scope.defaultFolders.unshift(newFolder);
            } else {
                parentFolder = CommonService.SearchItem($scope.defaultFolders, newFolder.parentId);
                if (parentFolder.nodes) {
                    var found = false;
                for (var i = 0; i < parentFolder.nodes.length; i++) {
                    if (parentFolder.nodes[i].guid === newFolder.guid) {
                        found = true;
                        return false;
                    }
                }
                if (!found) {
                	if(parentFolder.nodes.length && parentFolder.nodes[0].nodeType == EnumService.NODE_TYPE.emptyFolder) {
                		parentFolder.nodes.shift();
                	}
                    parentFolder.nodes.unshift(newFolder);
                }
                }
            }             
        });

        // #endregion    
               
        $scope.openImportBooksViewModal = function () {
        	$modal.open({	            
        		templateUrl: 'views/partials/import-userbooks-popup.html',	   
        		controller : 'ImportUserBooksPopUpController',
        		backdrop : 'static',
				keyboard : false
        	});
        }        
        
		$scope.deselectQuestionNode = function (node) {							 
			for (var i = 0; i < $scope.selectedNodes.length; i++) {
				if ($scope.selectedNodes[i].guid == node.guid) {											
						$scope.selectedNodes.splice(i, 1);																			
						$scope.setDeselectedNodeState(node);
						node.isNodeSelected=false;
						break;
					}									
		}
			if($scope.questions){
				for (var i = 0; i < $scope.questions.length; i++) {
					if ($scope.questions[i].guid == node.guid) {
						$scope.questions[i].existInTestframe = false;
						$scope.questions[i].isNodeSelected=false;
						break;
					}
				}
			}
			
			$scope.updateParentNodeStatus(node);
	};			
	
	//#To check whether the any parent node of selected node is used for test creation(edit question/wizard)  
	$scope.updateParentNodeStatus = function(deselectedNode){	
		var parentExistInSelectNodes;
		var nodeIndex=0;
		$scope.selectedNodes.forEach(function(node) {
			if(deselectedNode.parentId === node.guid){
				node.isNodeSelected = false ;
				node.showEditQuestionIcon = false;
				node.showTestWizardIcon = false;		
				parentExistInSelectNodes = true;
				return;
			}
			nodeIndex++;
		});			

		if(parentExistInSelectNodes){
			$scope.selectedNodes.splice(nodeIndex, 1);
			var test = SharedTabService.tests[SharedTabService.currentTabIndex];
			for (var j = 0; j < test.questionFolderNode.length; j++) {
				if (test.questionFolderNode[j].guid == deselectedNode.parentId) {
					test.questionFolderNode.splice(j, 1);
					break;
				}
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
	
	var isDeletedNodeFind=false;
	var findAndUpdateNodeStatus = function(deletedNode){
		//scope.$$childHead.$nodesMap["01E"].node
		var scope = getRootNodesScope();		
		var nodeHeirarchy=[];		
		isDeletedNodeFind=false;
		for (var i = 0; i < scope.$nodesScope.$modelValue.length; i++) {
			nodeHeirarchy=[];
			isDeletedNodeFind=false;
			if(isDeletedNodeFind){
				break;
			}
			var node = scope.$nodesScope.$modelValue[i];
			if(node.nodeType=="question"){
				if(deletedNode.guid==node.guid){					
					nodeHeirarchy.push(node);
					onDeselectNodeUpdateHeirarchyNodeStatus(nodeHeirarchy,node,scope);
					break;
				}

			}else{

				updateFolderNodeStatus(nodeHeirarchy,deletedNode,node,scope);
			}
		}

	}

	var updateFolderNodeStatus = function(nodeHeirarchy,deletedNode,node,scope){	
		if(node.questionBindings){				
			for (var i = 0; i < node.questionBindings.length; i++) {
				if(node.questionBindings[i].questionId == deletedNode.guid){					
					nodeHeirarchy.push(node);						
					onDeselectNodeUpdateHeirarchyNodeStatus(nodeHeirarchy,deletedNode,scope);
					isDeletedNodeFind=true;						
					break;
				}
			}

		}			
		if(node.nodes && !isDeletedNodeFind){
			nodeHeirarchy.push(node);			
			for (var i = 0; i < node.nodes.length; i++) {
				var childNode = node.nodes[i];
				if(childNode.nodeType=="question"){
					if(deletedNode.guid==childNode.guid){						
						onDeselectNodeUpdateHeirarchyNodeStatus(nodeHeirarchy,childNode,scope);
						isDeletedNodeFind=true;
						break;
					}

				}else{
					updateFolderNodeStatus(nodeHeirarchy,deletedNode,childNode,scope);
				}
			}		

		}

	}

	//To change the selection status of the parent node of a node.
	var onDeselectNodeUpdateHeirarchyNodeStatus = function(nodeHeirarchy,currentNode,scope){	
		resetNodeStatus(currentNode);
		removeNodeFromTestQuestionFolders(currentNode.guid);
		removeNodeFromSelectedNodes(currentNode);
		nodeHeirarchy.forEach(function(node) {
			removeNodeFromTestQuestionFolders(node.guid);
			removeNodeFromSelectedNodes(node);
			resetNodeStatus(node);
		});

	}

	var resetNodeStatus = function(node){	
		node.isNodeSelected = false;
		node.showTestWizardIcon = true;
		node.showEditQuestionIcon = false;
		node.existInTestframe=false;
	}

	//Handling the Broadcast event when selected question is removed from the Test creation frame.
	// here need to remove the question node from selected list and need to chnage his state. 
	$scope.$on('handleBroadcast_deselectQuestionNode',
			function(handler, node) {
		findAndUpdateNodeStatus(node);

	});
		
	//Handling the Broadcast event when questions are selected to wizard to create a test
	// here deselect the question nodes which are present in test creation frame.
	$scope.$on('handleBroadcast_questionDeselect', function() {
		$scope.selectedNodes.forEach(function(node) {
			if(node.nodes){
				node.nodes.forEach(function(usedNode) {
					if(usedNode.nodeType == EnumService.NODE_TYPE.question && isNodeInTestFrame(usedNode)){
						usedNode.existInTestframe = true;
						usedNode.isNodeSelected = true;
						usedNode.showEditQuestionIcon = false;
						usedNode.showTestWizardIcon = false;
					}else if (usedNode.nodeType != EnumService.NODE_TYPE.question){
						usedNode.existInTestframe = true;
						usedNode.isNodeSelected = true;				
						usedNode.showTestWizardIcon = true;
					}
				})
				node.existInTestframe = true;
				node.isNodeSelected = true;				
				node.showTestWizardIcon = true;
			}else if(node.nodeType != EnumService.NODE_TYPE.question){
				node.existInTestframe = true;
				node.isNodeSelected = true;				
				node.showTestWizardIcon = true;
			}
		})

	});
	
	
	 /**********************************************************Start**************************************************/
	
	 // To delete the wzard section from wizard Test frame..

	 var deselectWizarChildNode = function (node) {
			for (var i = 0; i < $scope.selectedNodes.length; i++) {
				if ($scope.selectedNodes[i].guid == node.guid) {
					$scope.selectedNodes[i].isNodeSelected = false ;
					$scope.selectedNodes[i].showEditQuestionIcon = false;
					$scope.selectedNodes[i].showTestWizardIcon = false;
					if($scope.selectedNodes[i].nodes){
						$scope.selectedNodes[i].nodes.forEach(function(usedNode) {
							deselectWizarChildNode(usedNode);
						})
					}
				}
			}
		}
	
		var deselectWizarParentNode = function (node) {
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
				deselectWizarParentNode(parentNode);
			}
		}
     
     $scope.$on('handleBroadcast_deselectWizardNode',
				function(handler, node) {
			
			deselectWizarChildNode(node);
			deselectWizarParentNode(node);

		});
     /*******************************************************End*************************************************************/     
     
	
/**********************************************************Start**************************************************/
     
     var enableSelectedNodeStatus = function(node){
    	 node.isNodeSelected = true;
		 node.showTestWizardIcon = true;
		 node.showEditQuestionIcon = true;
		 node.existInTestframe=false;
     }
//This block of code update the wizard node status and test node on Test tab switching.
	
     $scope.$on(
    		 'handleBroadcast_onClickTab',
    		 function(handler, tab) {			

    			 if (tab.isTestWizard) {					
    				 var isTabClicked = true;
    				 if(tab.criterias.length>0){
    					 resetSelectedNodeStatus();
    					 updateTabWizardNodeStatusInTree(tab.criterias,isTabClicked);
    				 }else if (tab.isNewFrameRequest){
    					 $scope.selectedNodes.forEach(function(node) {	
    						 enableSelectedNodeStatus(node);
    					 });
    				 }					
    			 } else {					

    				 if(tab.questions.length>0){
    					 resetSelectedNodeStatus();		
    					 updateTestNodesStatus(tab);    				 
    				 }else if (SharedTabService.tests.length == 1) { 		            
    					 resetSelectedNodeStatus();		
    				 }else if (tab.isNewFrameRequest){
    					 $scope.selectedNodes.forEach(function(node) {	
    						 enableSelectedNodeStatus(node);
    					 });
    				 }else{
    					 resetSelectedNodeStatus();		
    				 }

    			 }
    			 
    			 tab.isNewFrameRequest = false;

    		 });

/*******************************************************End*************************************************************/
		
		$scope.questions = [];
		var addToQuestionsArray = function(item) {
			$scope.questions.push(item);
		};
		
		$scope.$on('handleBroadcast_AddNewTest', function (handler, newTest, containerFolder, isEditMode, oldGuid, editedQuestions, editedMigratedQuestions, createdTab, testCreationFrameScope) {
			
			editedQuestions.forEach(function(editedQuestion) {
				editedQuestion.isQuestion = true;
				editedQuestion.questionXML = true;
				editedQuestion.nodeType = "question";
				editedQuestion.extendedMetadata = editedQuestion.extendedMetadata;
				editedQuestion.showEditQuestionIcon = false;
				editedQuestion.isNodeSelected = true;
				editedQuestion.existInTestframe=true;
				$scope.selectedNodes.push(editedQuestion);				
                editedQuestion.questionType = "userCreatedQuestion";     
                editedQuestion.questnNumber = 1;
                $scope.defaultFolders.forEach(function(question){                	
                		editedQuestion.questnNumber = editedQuestion.questnNumber + ((question['nodeType']=="question")?1:0);
                });                
                
                $scope.defaultFolders.push(editedQuestion);                    
			})			
			
			if(editedQuestions.length>0){
				unselectEditedQuestions();	
			}
			
			 if (createdTab.isSaveAndClose) {
			        SharedTabService.closeTab(createdTab, testCreationFrameScope);
			        SharedTabService.removeMasterTest(createdTab);
			 } else {
			        SharedTabService.removeMasterTest(createdTab);
			        SharedTabService.addMasterTest(createdTab);
			 }
		});
		
		

		var getHierarchyFromSelectedArray = function(
				childNode, hierarchyNodes) {
			var questionsExistInTestFrame = false;
			if (childNode.nodeType == EnumService.NODE_TYPE.question) {
				for (var i = 0; i < $scope.selectedNodes.length; i++) {
					if ($scope.selectedNodes[i].questionBindings
							&& $scope.selectedNodes[i].questionBindings.length > 0) {
						for (var j = 0; j < $scope.selectedNodes[i].questionBindings.length; j++) {
							if ($scope.selectedNodes[i].questionBindings[j].questionId == childNode.guid) {
								hierarchyNodes
								.push($scope.selectedNodes[i]);
								getHierarchyFromSelectedArray(
										$scope.selectedNodes[i],
										hierarchyNodes);
								questionsExistInTestFrame = true;
								break;
							}
						}
					}
					if (questionsExistInTestFrame)
						break;

				}

			} else {

				for (var i = 0; i < $scope.selectedNodes.length; i++) {
					if ($scope.selectedNodes[i].nodes) {
						for (var j = 0; j < $scope.selectedNodes[i].nodes.length; j++) {
							if ($scope.selectedNodes[i].nodes[j].guid == childNode.guid) {
								hierarchyNodes
								.push($scope.selectedNodes[i]);
								getHierarchyFromSelectedArray(
										$scope.selectedNodes[i],
										hierarchyNodes);
								questionsExistInTestFrame = true;
								break;
							}
						}
					}
					if (questionsExistInTestFrame)
						break;

				}

			}

		}
		
		var removeHierarchyFromSelectedArray = function(childNode) {
			var hierarchyNodes = [];
			hierarchyNodes.push(childNode);
			getHierarchyFromSelectedArray(childNode,hierarchyNodes);

			hierarchyNodes.forEach(function(node){				
				removeNodeFromTestQuestionFolders(node.guid);
				removeNodeFromSelectedNodes(node);				
			});

		}
		
		var unselectEditedQuestions=function(){
			var testQuestions=SharedTabService.tests[SharedTabService.currentTabIndex].questions;
			var questionsNotInTest=[];
			var isThisQuestionInTest=false;
			
			$scope.selectedNodes.forEach(function(node){
				var isThisQuestionInTest=false;
				if(node.nodeType == EnumService.NODE_TYPE.question){					
					testQuestions.forEach(function(testQuestion){
						if(testQuestion.guid==node.guid){
							isThisQuestionInTest=true;
						}
					});
					if(!isThisQuestionInTest){
						questionsNotInTest.push(node)
					}
				}else{
					
					if (node.questionBindings && node.questionBindings.length > 0) {
						for (var j = 0; j < node.questionBindings.length; j++) {		
							isThisQuestionInTest = false;
							testQuestions.forEach(function(testQuestion){
								if(testQuestion.guid==node.questionBindings[j].questionId){
									isThisQuestionInTest=true;
								}
							});
							if(!isThisQuestionInTest){
								questionsNotInTest.push(node)
							}
						}
					}
					
					
				}
				
			});

			questionsNotInTest.forEach(function(questionNotinTest){
				$scope.selectedNodes.forEach(function(question,index){
					if(questionNotinTest.guid==question.guid){						
						removeHierarchyFromSelectedArray(question);						
					}
				});
			});
		}
		
		/* 
		 * Method for identify source and destination tree of the event are same or not
		 * 
		 */
		var  isForeign = function(e){
			return e.source.nodeScope.$treeScope != e.dest.nodesScope.$treeScope
		}
		
    }]);