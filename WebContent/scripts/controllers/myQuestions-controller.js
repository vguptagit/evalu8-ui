'use strict';

angular.module('e8MyTests')

.controller('MyQuestionsController',
    ['$scope', '$rootScope', '$location', '$cookieStore', '$http', '$sce', '$modal', 'QuestionFolderService', 'UserQuestionsService',
     'UserFolderService', 'TestService', 'SharedTabService', 'ArchiveService', 'EnumService', 'CommonService',
     function ($scope, $rootScope, $location, $cookieStore, $http, $sce, $modal, QuestionFolderService, UserQuestionsService,
    		UserFolderService, TestService, SharedTabService, ArchiveService, EnumService, CommonService) {
    	
        $scope.controller = EnumService.CONTROLLERS.myTest;
    	SharedTabService.selectedMenu = SharedTabService.menu.myTest;
        $scope.testTitle = "New Test";
        $scope.isAddFolderClicked=false;
        $scope.isTestDeleteClicked=false;
        $scope.isFolderDeleteClicked=false;
        $scope.dragStarted = false;
        
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
  			
            if(source.node.nodeType === EnumService.NODE_TYPE.test && destParent.controller === EnumService.CONTROLLERS.testCreationFrame){        
                source.node.showEditIcon=false;
                source.node.showArchiveIcon=false;
                $rootScope.$broadcast("dropTest", source, destIndex);
                return false;
            }
            
            if($rootScope.dropTest && $rootScope.dropTest == "cancel") {
            	$rootScope.dropTest = null;
            	return false;
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
                
                var duplicateTitle = false;
                
                UserFolderService.getUserFoldersByParentFolderId(mouseOverNode.node.guid, function (userFolders) {
                	if(userFolders==null){
                		$rootScope.blockLeftPanel.stop();
                 		CommonService.showErrorMessage(e8msg.error.cantFetchFolders);
                 		return;
                 	}		
                	if(item.nodeType == EnumService.NODE_TYPE.folder) {
                		userFolders.forEach(function(nodeItem) {                            
                    		if(nodeItem.nodeType == EnumService.NODE_TYPE.folder && nodeItem.title == item.title) {
                    			duplicateTitle = true;                			 
                    		}                        
                    	})
                    	
                    	if(duplicateTitle) {
    			            $scope.IsConfirmation = false;
    			            $scope.message = "A folder already exists with this name.";
    			            $modal.open(confirmObject);
    			            
    			            $rootScope.blockLeftPanel.stop();
                    		return false;
                    	}                		
                	}
                	
                	TestService.getTests(mouseOverNode.node.guid, function (tests) {
                		if(tests==null){
                			$rootScope.blockLeftPanel.stop();
                			CommonService.showErrorMessage(e8msg.error.cantFetchTests)
                			return;
                		}
                    	if(item.nodeType == EnumService.NODE_TYPE.test) {
                    		tests.forEach(function(nodeItem) {                        
                        		if(nodeItem.nodeType == EnumService.NODE_TYPE.test && nodeItem.title == item.title) {
                        			duplicateTitle = true;                			 
                            	}                        	                        
                        	})
                        	
                        	if(duplicateTitle) {
        			            $scope.IsConfirmation = false;
        			            $scope.message = "A test already exists with this name.";
        			            $modal.open(confirmObject);
        			            
        			            $rootScope.blockLeftPanel.stop();
                        		return false;
                        	}                		
                    	}
                    	
                        source.remove();                                        
                        
                        if(item.nodeType == EnumService.NODE_TYPE.folder) {
                            item.parentId = mouseOverNode.node.guid;
                            UserFolderService.getFoldersMinSeq(mouseOverNode.node, function(minSeq) {
                            	item.sequence = minSeq==0.0 ? 1.0 : (0.0 + minSeq)/2;
                            	UserFolderService.saveUserFolder(item, function(userFolder) {
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
                            })                	
                        } else {
                        	var sourceFolder = $scope.removeTestBindingFromSource(sourceParent, item.guid);
                        	UserFolderService.saveUserFolder(sourceFolder, function(userFolder) {
                        		if(userFolder==null){
                            		$rootScope.blockLeftPanel.stop();
                             		CommonService.showErrorMessage(e8msg.error.cantSave);
                             		return;
                             	}
                        		$scope.insertTestBindingToDest(mouseOverNode, item.guid, function() {
                        			
                        			if(sourceParent && sourceParent.node && sourceParent.node.nodes.length==0) {
                        				sourceParent.node.nodes.push(CommonService.getEmptyFolder());
                        			}
                        			
                            		$rootScope.blockLeftPanel.stop();                        			
                        		});

                        	});            		              	               	
                        }
                	})                                        
                  
                })
                
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
            		if(item.nodeType == EnumService.NODE_TYPE.test) {
            			$scope.defaultFolders.forEach(function(nodeItem) {
                    		if(nodeItem.nodeType == EnumService.NODE_TYPE.test && nodeItem.title == item.title && nodeItem.$$hashKey != item.$$hashKey) {
                    			duplicateTitle = true;                			 
                    		}                        	
                    	})            			
                    	
                    	if(duplicateTitle) {
    			            $scope.IsConfirmation = false;
    			            $scope.message = "A test already exists with this name.";
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
                	
            		if(item.nodeType == EnumService.NODE_TYPE.test) {
                		destParent.node.nodes.forEach(function(nodeItem) {
                    		if(nodeItem.nodeType == EnumService.NODE_TYPE.test && nodeItem.title == item.title && nodeItem.$$hashKey != item.$$hashKey) {
                    			duplicateTitle = true;                			 
                    		}                        	
                    	})            			
                    	
                    	if(duplicateTitle) {
    			            $scope.IsConfirmation = false;
    			            $scope.message = "A test already exists with this name.";
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
            		QuestionFolderService.saveQuestionFolder(sourceFolder, function(userFolder) {
            			if(userFolder==null){
                    		$rootScope.blockLeftPanel.stop();
                     		CommonService.showErrorMessage(e8msg.error.cantSave);
                     		return;
                     	}
            			$scope.addTestToDest(destParent, function() {
            				
                			if(sourceParent && sourceParent.node && sourceParent.node.nodes.length==0) {
                				sourceParent.node.nodes.push(CommonService.getEmptyFolder());
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
            		QuestionFolderService.saveQuestionFolder(item, function(userFolder) {
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
        	
        	QuestionFolderService.saveQuestionFolder(destNode, function(userFolder) {
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
        	QuestionFolderService.saveQuestionFolder(destNode, function(userFolder) {
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
		
        // To show the Edit icon,on click of test
        // node.
        $scope.closeTip=function(){
        	$('.testMessagetip').hide();
        }
        $('.testMessagetip').offset({'top':($(window).height()/2)-$('.testMessagetip').height()});
        $('.testMessagetip').hide();
        $scope.selectTestNode = function ($event,test) {

        	if(test.node.nodeType == EnumService.NODE_TYPE.emptyFolder) {
        		return;
        	}
            test.node.selectTestNode = !test.node.selectTestNode;
            if(test.node.selectTestNode 
            		&& $rootScope.globals.loginCount <= evalu8config.messageTipLoginCount 
            		&& test.node.nodeType != EnumService.NODE_TYPE.archiveTest 
            		&& test.node.nodeType != EnumService.NODE_TYPE.folder
            		&& test.node.nodeType != EnumService.NODE_TYPE.archiveFolder)
            {
	        	$('.testMessagetip').show()
	        	setTimeout(function(){ 
	        		$('.testMessagetip').hide();
	        	}, 5000);
        	}
            if(test.node.nodeType != EnumService.NODE_TYPE.archiveFolder && test.node.nodeType != EnumService.NODE_TYPE.archiveTest ){
            	SharedTabService.showSelectedTestTab(test.node);
            }
        }

        // to disable the edit icon once it clicked
        $scope.editTest = function (selectedTest) {
        	selectedTest.node.draggable = false;
        	selectedTest.node.showEditIcon=false;
        	selectedTest.node.showArchiveIcon=false;
        	$rootScope.$broadcast("editTest", selectedTest);
        }

        $scope.getFolders = function(defaultFolder) {
        	if($scope.showAddFolderPanel){
        		$scope.showAddFolderPanel = false;
        	}
        	if(defaultFolder.node.nodeType == EnumService.NODE_TYPE.folder) {
        		$scope.getUserFolders(defaultFolder);
        	}
        	if(defaultFolder.node.nodeType == EnumService.NODE_TYPE.archiveFolder) {
        		$scope.getArchiveFolders(defaultFolder);
        	}
        	if(defaultFolder.node.nodeType == EnumService.NODE_TYPE.archiveRoot) {
        		$scope.archiveRoot = defaultFolder;
        		$scope.getArchiveFolders(defaultFolder);
        	}        	
        }
        
        $scope.getUserFolders = function (defaultFolder, callback) {

            defaultFolder.toggle();

            if (!defaultFolder.collapsed) {            	
				
				QuestionFolderService.getFoldersByParentFolderId(defaultFolder.node.guid, function (userFolders) {
					if(userFolders==null){
                		$rootScope.blockLeftPanel.stop();
                 		CommonService.showErrorMessage(e8msg.error.cantFetchFolders);
                 		return;
                 	}
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
							yourQuestion.textHTML = displayNode
									.html();

							//yourQuestion.template = 'qb_questions_renderer.html';
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
        
        $scope.getArchiveFolders = function (defaultFolder, callback) {

            defaultFolder.toggle();

            if (!defaultFolder.collapsed) {            	
            	   $rootScope.blockLeftPanel.start();
                ArchiveService.getArchiveFolders(defaultFolder.node, function (userFolders) {
                	if(userFolders==null){
               		 $rootScope.blockLeftPanel.stop();
               		 CommonService.showErrorMessage(e8msg.error.cantFetchArchiveFolders);
               		 return;
               	}

                    defaultFolder.node.nodes = userFolders;

                    TestService.getArchiveTests(defaultFolder.node.guid, function (tests) {
                    	if(tests==null){
                    		$rootScope.blockLeftPanel.stop();
                    		 CommonService.showErrorMessage(e8msg.error.cantFetchArchiveTests);
                    		return;
                    	}
                    	if(userFolders.length == 0 && tests.length == 0) {
    						 
                    		defaultFolder.node.nodes.push(CommonService.getEmptyFolder());                    		
                    	}
                    	
                        tests.forEach(function (test) {
                            test.selectTestNode = false;// to show the edit icon

                            defaultFolder.node.nodes.push(test);
                        })

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
        		
        	
      //}
        
        
        $scope.archiveTest = function(test) {
        	
        	$rootScope.blockLeftPanel.start();
        	var parentFolderId = (test.$parentNodeScope == null) ? null : test.$parentNodeScope.node.guid; 
        	ArchiveService.archiveTest(test.node.guid, parentFolderId, function(archivedFolder) {
        		
        		if(archivedFolder == null) {
        			$rootScope.blockLeftPanel.stop();
        			
        			CommonService.showErrorMessage(e8msg.error.cantArchive)
        			return;
        		}
        		
        		test.remove(); 
        		
        		if(test.$parentNodeScope && test.$parentNodeScope.node) {
        			$scope.removeTestBindingFromSource(test.$parentNodeScope, test.node.guid);	
        		} 
        		
        		if(test.$parentNodeScope && test.$parentNodeScope.node && test.$parentNodeScope.node.nodes.length == 0) {
        			test.$parentNodeScope.node.nodes.push(CommonService.getEmptyFolder());
        		}
        		
        		test.node.nodeType = "archiveTest";
        		test.node.draggable = false;
        		test.node.selectTestNode= false;// To deselect the test in
												// archive folder when test is
												// archived
        		if(archivedFolder == null || archivedFolder == "") {
        			if($scope.archiveRoot && $scope.archiveRoot.node && $scope.archiveRoot.node.nodes && $scope.archiveRoot.node.nodes.length) {
        				if($scope.archiveRoot.node.nodes[0].nodeType == EnumService.NODE_TYPE.emptyFolder) {
        					$scope.archiveRoot.node.nodes.splice(0,1);
        				}
        				$scope.archiveRoot.node.nodes.push(test.node);
        			}
        		} else {
        			
        			var testParent = angular.element($('[id=' + archivedFolder.guid + ']')).scope();
        			if(testParent && testParent.node) {
        				if(testParent.node.nodes[0] && testParent.node.nodes[0].nodeType == EnumService.NODE_TYPE.emptyFolder) {
        					testParent.node.nodes.splice(0,1);
        				}
        				
        				testParent.node.nodes.push(test.node);
        			}else{
       				 	ArchiveService.getArchiveFolders($scope.archiveRoot.node, function (archivedFolders) {
	       				 	if(archivedFolders==null){
		                  		 $rootScope.blockLeftPanel.stop();
		                  		 CommonService.showErrorMessage(e8msg.error.cantFetchArchiveFolders);
		                  		 return;
		                  	}
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
        
        $scope.restoreFolder = function(folder) {
        	
        	$rootScope.blockLeftPanel.start();
        	ArchiveService.restoreFolder(folder.node.guid, function(restoredFolder) {
        		
        		if(restoredFolder == null) {
        			$rootScope.blockLeftPanel.stop();
        			
        			CommonService.showErrorMessage(e8msg.error.cantRestore)
        			return;
        		} else if(restoredFolder == EnumService.HttpStatus.CONFLICT) {
        			$rootScope.blockLeftPanel.stop();
        			
    	            $scope.IsConfirmation = false;
    	            $scope.message = e8msg.validation.duplicateFolderTitle;
    	            $modal.open(confirmObject);        		
            		return;
        		}
        		
        		folder.remove();
        		
        		if(folder.$parentNodeScope && folder.$parentNodeScope.node && folder.$parentNodeScope.node.nodes.length == 0) {
        			folder.$parentNodeScope.node.nodes.push(CommonService.getEmptyFolder());
        		}
        		
        		if($scope.archiveRoot && $scope.archiveRoot.node && $scope.archiveRoot.node.nodes.length==0) {
        			$scope.archiveRoot.node.nodes.push(CommonService.getEmptyFolder());
        		}
        		
        		if(angular.element($('[id=' + restoredFolder.guid + ']')).scope()) {
        			$rootScope.blockLeftPanel.stop();
        			return; // return if restored node is already displayed in
							// User Section
        		}
        		
        		restoredFolder.nodeType = "folder";
        		var restoredFolderParent;
        		
        		if(restoredFolder.parentId == null) {
        			var restoreIndex = 0;
        			$scope.defaultFolders.forEach(function(item){
        				if(item.sequence < restoredFolder.sequence) {
        					restoreIndex = restoreIndex + 1;        					
        				}
        			}) 
        			$scope.defaultFolders.splice(restoreIndex, 0, restoredFolder);        			       				    
        		} else {

        			restoredFolderParent = angular.element($('[id=' + restoredFolder.parentId + ']')).scope()
        			if(restoredFolderParent && restoredFolderParent.node) {
        				if(restoredFolderParent.node.nodes[0] && restoredFolderParent.node.nodes[0].nodeType == EnumService.NODE_TYPE.emptyFolder) {
        					restoredFolderParent.node.nodes.splice(0,1);
        				}
        				restoredFolderParent.node.nodes.unshift(restoredFolder);
        			}         				
        		}
        		
        		$rootScope.blockLeftPanel.stop();
        	});        	
        }        
        
        $scope.restoreTest = function(test) {
        	
        	var duplicateTitle = false;
        	if(test.$parentNodeScope.node.guid == null) {
        		$scope.defaultFolders.forEach(function(item) {
        			if(item.title == test.node.title) {
        				duplicateTitle = true;
        			}
        		});
        	} 
        	
        	if(duplicateTitle) {
	            $scope.IsConfirmation = false;
	            $scope.message = e8msg.validation.duplicateTestTitle;
	            $modal.open(confirmObject);        		
        		return false;
        	}
        	
        	$rootScope.blockLeftPanel.start();
        	ArchiveService.restoreTest(test.node.guid, test.$parentNodeScope.node.guid, function(restoredFolder) {
        		
        		if(restoredFolder == null) {
        			$rootScope.blockLeftPanel.stop();
        			CommonService.showErrorMessage(e8msg.error.cantRestore)
        			return;
        		} else if(restoredFolder == EnumService.HttpStatus.CONFLICT) {
        			$rootScope.blockLeftPanel.stop();
        			
    	            $scope.IsConfirmation = false;
    	            $scope.message = e8msg.validation.duplicateTestTitle;
    	            $modal.open(confirmObject);        		
            		return;
        		}
        		
        		test.remove();
        		
        		if(test.$parentNodeScope && test.$parentNodeScope.node && test.$parentNodeScope.node.nodes.length == 0) {
        			test.$parentNodeScope.node.nodes.push(CommonService.getEmptyFolder());
        		}
        		
        		if($scope.archiveRoot && $scope.archiveRoot.node && $scope.archiveRoot.node.nodes.length==0) {
        			$scope.archiveRoot.node.nodes.push(CommonService.getEmptyFolder());
        		}
        		
        		test.node.nodeType= "test";
        		test.node.draggable = true;
                test.node.selectTestNode = false;// to show the edit icon
                
        		if(restoredFolder == null || restoredFolder == "") {
        			
                    test.node.showEditIcon = true;
                    test.node.showArchiveIcon = true;

        			var index = 0, restoreIndex = 0;
        			$scope.defaultFolders.forEach(function(item){

        				if(item.nodeType == EnumService.NODE_TYPE.archiveRoot) {
        					restoreIndex = index;        					
        				}
        				index = index + 1;
        			})
        			$scope.defaultFolders.splice(restoreIndex, 0, test.node);	    
        		} else {
        			
        			var testParent = angular.element($('[id=' + restoredFolder.guid + ']')).scope();
        			if(testParent && testParent.node && testParent.node.nodes && testParent.node.nodes.length) {
        				
        				for(var tesstItemIndex=testParent.node.nodes.length-1; tesstItemIndex>=0; tesstItemIndex--) {
        					if(testParent.node.nodes[tesstItemIndex].nodeType == EnumService.NODE_TYPE.test 
        						|| testParent.node.nodes[tesstItemIndex].nodeType == EnumService.NODE_TYPE.emptyFolder) {
        						testParent.node.nodes.splice(tesstItemIndex, 1);
        					}
        				}        				
        			}
        			
                    if(testParent && testParent.node) {
                        TestService.getTests(restoredFolder.guid, function (tests) {
                        	if(tests==null){
    							$rootScope.blockLeftPanel.stop();
    							CommonService.showErrorMessage(e8msg.error.cantFetchTests)
                    			return;
    						}
                            tests.forEach(function (test) {
                                test.selectTestNode = false;// to show the edit
															// icon

                                testParent.node.nodes.push(test);
                            })
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