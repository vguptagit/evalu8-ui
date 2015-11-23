'use strict';

angular.module('e8MyTests')

.controller('MyQuestionsController',
    ['$scope', '$rootScope', '$location', '$cookieStore', '$http', '$sce', '$modal', 'QuestionFolderService', 'UserQuestionsService',
     'UserFolderService', 'TestService', 'SharedTabService', 'ArchiveService', 'EnumService', 'CommonService',
     function ($scope, $rootScope, $location, $cookieStore, $http, $sce, $modal, QuestionFolderService, UserQuestionsService,
    		UserFolderService, TestService, SharedTabService, ArchiveService, EnumService, CommonService) {
    	
        $scope.controller = EnumService.CONTROLLERS.myQuestion;

        $scope.isAddFolderClicked=false;
        $scope.isTestDeleteClicked=false;
        $scope.isFolderDeleteClicked=false;
        $scope.dragStarted = false;
        
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
		
        $scope.loadTree = function() {        	
        	
        	QuestionFolderService.defaultFolders(function (defaultFolders) {
        		if(defaultFolders==null){
        			CommonService.showErrorMessage(e8msg.error.cantFetchFolders)
        			return;
        		}
        		
            	QuestionFolderService.questionRootFolder(function(myTestRoot){
            		if(myTestRoot==null){
            			CommonService.showErrorMessage(e8msg.error.cantFetchRootFolder)
            			return;
            		}
            		$scope.myTestRoot = myTestRoot;
            	            	
	                $scope.defaultFolders = defaultFolders;
	                
	                QTI.initialize();
	                
	                $rootScope.blockLeftPanel.start();
	                UserQuestionsService.userQuestions(function(questions){
	                	if(questions==null){
	                		$rootScope.blockLeftPanel.stop();
	                		CommonService.showErrorMessage(e8msg.error.cantFetchTests)
	            			return;
	                	}
	                	$scope.questionNumber = 0;
	                	questions.forEach(function(userQuestion) {
	                		
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

							//yourQuestion.parentId = $scope.userQuestionsFolderRoot.guid;
							yourQuestion.nodeType = "question";
							yourQuestion.questionType = "userCreatedQuestion";
							yourQuestion.guid = userQuestion.guid;
							yourQuestion.showEditQuestionIcon = false;
							yourQuestion.isNodeSelected = false;
							
							$scope.questionNumber++;
							yourQuestion.questnNumber = $scope.questionNumber;
							//addToQuestionsArray(yourQuestion);

							yourQuestion.data = userQuestion.qtixml;
							yourQuestion.quizType = userQuestion.metadata.quizType;
							yourQuestion.extendedMetadata = userQuestion.metadata.extendedMetadata;
							yourQuestion.textHTML = displayNode
									.html();

							//yourQuestion.template = 'qb_questions_renderer.html';
	                		$scope.defaultFolders.push(yourQuestion);	
	                	});
	                	
	                	$rootScope.blockLeftPanel.stop();
	                });
	                
            	});
                
                
            });
        }
        
        $scope.loadTree();
        
        $scope.$on('ImportUserBooks', function() {		
			$scope.loadTree();								
		})

		
        $scope.$on('dragStarted', function () {
            $scope.dragStarted = true;
        });

        $scope.$on('dragCancel', function () {
            $scope.dragStarted = false;
        });

        $scope.$on('dragEnd', function (event, destParent, source, sourceParent,
  			  sourceIndex, destIndex, prev, next) {
        	          
  			if(!$scope.dragStarted) {
                return false;
            }
  			
  			$scope.dragStarted = false;
  			
			if (!source.node.isNodeSelected) {
				$scope.selectNode(source);
			}

            if(!(destParent.controller === EnumService.CONTROLLERS.myQuestion)){        

                if (SharedTabService.tests[SharedTabService.currentTabIndex].isTestWizard) {
                    $scope.createTestWizardCriteria(source)
                } else {
                    $scope.editQuestion(source.node, destIndex, "dragEvnt");
                }             
            }
            
            $rootScope.blockLeftPanel.start();                        

            if (sourceIndex != destIndex) {
                source.node.selectTestNode = false;
            }


            var mouseOverNode = null;
            if($rootScope.tree)
            	mouseOverNode = $rootScope.tree.mouseOverNode;

            if (mouseOverNode) {
                $rootScope.tree = { mouseOverNode: null };
                mouseOverNode.hover = false;
            }

            if (mouseOverNode && (mouseOverNode != source)) {

                var item = source.node;                                                                                            
                    
                if(item.nodeType == EnumService.NODE_TYPE.folder) {
                    item.parentId = mouseOverNode.node.guid;
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
            	                                        
                
            } else {

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
                        item.parentId = $scope.myTestRoot.guid;
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
            			}
                        $rootScope.blockLeftPanel.stop();
            		});
            	}
                
            }
        });
        
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
        		var destNode = $scope.myTestRoot;    			
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
    			sourceNode = $scope.myTestRoot;
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
        	if(prev && prev.node && "sequence" in prev.node && prev.node.sequence == 0)
        		destParent.node.nodes.splice(0,1);
        	if(next && next.node && "sequence" in next.node && next.node.sequence == 0)
        		destParent.node.nodes.splice(1,1);
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
                node.hover = true;
            }
        };

        $scope.treeNodeMouseLeave = function (node) {

            $rootScope.tree = { mouseOverNode: null };
            node.hover = false;
        }     
        
		$scope.folderNameTextBoxBlur = function() {
			
			if($scope.enterKey == true) {
                $scope.enterKey = false;
                $scope.showAddFolderPanel = false;
                $scope.$digest();
                return;
            }
                
            if(document.getElementById("txtFolderName").value.trim().length==0) {
                $scope.showAddFolderPanel = false;
                $scope.$digest();
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
    	    		}
        		});
            }
        }
		
		var isParentNodeUsed=false;
		$scope.selectNode = function (scope) {
			
			var node = scope.node;
			
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
				}, 5000);
			}
			
			if(node.isNodeSelected && node.showEditQuestionIcon == false ){
				if (node.nodeType === EnumService.NODE_TYPE.question) {
					return;
				}
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
		};
		
		$scope.expandedNodes=[];
		
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
		
		$scope.addSelectedQuestionsToTestTab = function(test, destIndex, eventType,scope) {
        	var selectedScopeNode = typeof scope.node == "undefined" ? scope : scope.node;
        	if(!selectedScopeNode.showEditQuestionIcon)
    		{
        		$scope.isAnyNodeAlreadyAdded = true

    		}
        	
        	$scope.addQuestionsToTestTab(test, destIndex, eventType,$scope.isAnyNodeAlreadyAdded);
        	$scope.isAnyNodeAlreadyAdded = false;

		}
		
		$scope.addQuestionsToTestTab = function (test, destIndex, eventType, isAnyNodeAlreadyAdded) {
		    var httpReqCount = 0,
                httpReqCompletedCount = 0,
                uniqueNodeCount = 0;

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
		
        $scope.createTestWizardMode=false;
        
		// TODO : need to move this to service.
		$scope.createTestWizardCriteria = function(
				currentNode) {
			$scope.createTestWizardMode=true;
			
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
        
        $scope.getUserFolders = function (defaultFolder, callback) {

            defaultFolder.toggle();

            if (!defaultFolder.collapsed) {            	
				
				QuestionFolderService.getFoldersByParentFolderId(defaultFolder.node.guid, function (userFolders) {

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

							//yourQuestion.parentId = $scope.userQuestionsFolderRoot.guid;
							yourQuestion.nodeType = "question";
							yourQuestion.questionType = "userCreatedQuestion";
							yourQuestion.guid = userQuestion.guid;
							yourQuestion.showEditQuestionIcon = false;
							yourQuestion.isNodeSelected = false;
							
							questionNumber++;
							yourQuestion.questnNumber = questionNumber;
							//addToQuestionsArray(yourQuestion);

							yourQuestion.data = userQuestion.qtixml;
							yourQuestion.quizType = userQuestion.metadata.quizType;
							yourQuestion.extendedMetadata = userQuestion.metadata.extendedMetadata;
							yourQuestion.textHTML = displayNode.html();

							defaultFolder.node.nodes.push(yourQuestion);	
	                	});
	                	
                        if (defaultFolder.node.nodes.length > 1 && defaultFolder.node.nodes[0].sequence == 0) {
                            defaultFolder.node.nodes.shift();
                        }
                        
	                	$rootScope.blockLeftPanel.stop();
	                });
                    
                    if(callback) callback();
                });                
            }
        };        
        
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
        
        $scope.archiveFolder = function(folder) {
        	
            	if(isAnyTestInEditMode()){
            		if(checkIfTestIsBeingEdited(folder)){
            			$scope.IsConfirmation = false;
        				$scope.message = e8msg.error.testIsInEditMode;
        				$modal.open(confirmObject);
        				return false;
            		}else if (isAnyNodeCollapsed){
            			$rootScope.blockLeftPanel.start();
            			TestService.getAllTestsOfFolder(folder.node.guid, function (tests) {
                            
            				//"null"is expected only if there is an error
            				if(tests == null) {
                                $rootScope.blockLeftPanel.stop();
                                CommonService.showErrorMessage(e8msg.error.cantFetchTests)
                                return;
                            }
                            
            				//Check if the tests returned from the service is part of the tests being edited
                            if(checkIfTestIsInList(tests)){
                            	$scope.IsConfirmation = false;
                                $rootScope.blockLeftPanel.stop();
                                $scope.message = e8msg.error.testIsInEditMode;
                                $modal.open(confirmObject);
                                return false;                            	
                            }else{ // All good - go ahead and archive
                            	doArchive(folder);
                            }
                            
                            $rootScope.blockLeftPanel.stop();
                        });
            		}
            	}else{
            		doArchive(folder);
            	}
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
        
        
        	function doArchive(folder){
        		$rootScope.blockLeftPanel.start();
        		ArchiveService.archiveFolder(folder.node.guid, function(archivedFolder) {
        			if(archivedFolder == null) {
            			$rootScope.blockLeftPanel.stop();
            			CommonService.showErrorMessage(e8msg.error.cantArchive)
            			return;
            		}
            		folder.remove();        		
            		
            		if(folder.$parentNodeScope && folder.$parentNodeScope.node && folder.$parentNodeScope.node.nodes.length == 0) {
            			folder.$parentNodeScope.node.nodes.push(CommonService.getEmptyFolder());
            		}
            		if(angular.element($('[id=' + archivedFolder.guid + ']')).scope()) {
            			
            			$rootScope.blockLeftPanel.stop();
            			return; // return if archived node is already displayed in
    							// Archive Section
            		}
            		        		
            		archivedFolder.nodeType = EnumService.NODE_TYPE.archiveFolder;
            		archivedFolder.draggable = "false";
            		archivedFolder.droppable = "false";
            		var archivedFolderParent;        		
            		
            		if(archivedFolder.parentId == null) {
            			
            			if($scope.archiveRoot && $scope.archiveRoot.node && $scope.archiveRoot.node.nodes && $scope.archiveRoot.node.nodes.length) {
            				if($scope.archiveRoot.node.nodes[0].nodeType == EnumService.NODE_TYPE.emptyFolder) {
            					$scope.archiveRoot.node.nodes.splice(0,1);
            				}
            				$scope.archiveRoot.node.nodes.unshift(archivedFolder)        				
            			}	        				        				    
            		} else {
            			
            			archivedFolderParent = angular.element($('[id=' + archivedFolder.parentId + ']')).scope()
            			if(archivedFolderParent && archivedFolderParent.node) {
            				if(archivedFolderParent.node.nodes[0] && archivedFolderParent.node.nodes[0].nodeType == EnumService.NODE_TYPE.emptyFolder) {
            					archivedFolderParent.node.nodes.splice(0,1);
            				}
            				archivedFolderParent.node.nodes.unshift(archivedFolder);
            			}else{
           				 	ArchiveService.getArchiveFolders($scope.archiveRoot.node, function (archivedFolders) {
    	    					$scope.archiveRoot.node.nodes=archivedFolders;
    	    					TestService.getArchiveTests($scope.archiveRoot.node.guid, function (tests) {
    	    						if(tests==null){
    	                        		$rootScope.blockLeftPanel.stop();
    	                        		 CommonService.showErrorMessage(e8msg.error.cantFetchArchiveTests);
    	                        		return;
    	                        	}
    	    						 tests.forEach(function (test) {
    	    	                            test.selectTestNode = false;
    	    	                            $scope.archiveRoot.node.nodes.push(test);
    	    	                     });
    	    					 });
    	       				});
            			 }       			
            		}        		        

            		$rootScope.blockLeftPanel.stop();
            	});
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
                                $("#txtFolderNameEdit").focus();
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

                if (rootFolders.length == 1) {
                    rootFolders.push(CommonService.getArchiveRoot());
                }

                $scope.folderName = "";

                userFolder.isEditMode = false;
            });
        }

        $scope.addNewFolder = function (enterKey) {
        	
        	$scope.enterKey = enterKey;
        	
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
                "parentId": $scope.myTestRoot.guid,                
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
            	// $scope.loadTree();
            	
            	userFolder.nodeType = "folder";
            	$scope.defaultFolders.unshift(userFolder);
                
            	if($scope.defaultFolders.length == 1) {
            		$scope.defaultFolders.push(CommonService.getArchiveRoot());
            	}
            	
                $scope.folderName = "";
               
                $scope.showAddFolderPanel = false;
            });
            
            $("#MyTest-tree-root")[0].scrollTop = 0;
            $("#txtFolderName").blur(); 

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
        //Handling the Broadcast event when selected question is removed from the Test creation frame.
        // here need to remove the question node from selected list and need to chnage his state. 
        $scope.$on('handleBroadcast_deselectQuestionNode',
                function(handler, node) {
                    $scope.deselectQuestionNode(node);
                });
        
		$scope.$on(
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
							if($scope.selectedNodes[i].isEditMode){
								$scope.selectedNodes[i].isNodeSelected= true;
								$scope.selectedNodes[i].showTestWizardIcon = true;
								$scope.selectedNodes[i].showEditQuestionIcon = true;
							}else{
								$scope.selectedNodes[i].isNodeSelected = false;
								$scope.selectedNodes[i].showTestWizardIcon = false;
								$scope.selectedNodes[i].showEditQuestionIcon = false;
							}
						}
						//$scope.selectedNodes=[];
					}					
					
				});
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
				//addToQuestionsArray(editedQuestion);
				//editedQuestion.template = 'qb_questions_renderer.html';
					
				$scope.questionNumber++;
                editedQuestion.questnNumber = $scope.questionNumber;
                editedQuestion.questionType = "userCreatedQuestion";                                            
                $scope.defaultFolders.push(editedQuestion);    
                
			})															
			
		});
		
    }]);