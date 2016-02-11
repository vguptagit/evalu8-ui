'use strict';

angular.module('e8MyTests')

.controller('MyTestsController',
    ['$scope', '$rootScope', '$location', '$cookieStore', '$http', '$sce', '$modal',
     'UserFolderService', 'TestService', 'SharedTabService', 'ArchiveService', 'EnumService', 'CommonService',
     function ($scope, $rootScope, $location, $cookieStore, $http, $sce, $modal,
    		UserFolderService, TestService, SharedTabService, ArchiveService, EnumService, CommonService) {
    	
        $scope.controller = EnumService.CONTROLLERS.myTest;
    	SharedTabService.selectedMenu = SharedTabService.menu.myTest;
        $scope.testTitle = "New Test";
        $scope.isAddFolderClicked=false;
        $scope.isTestDeleteClicked=false;
        $scope.isFolderDeleteClicked=false;
        $scope.dragStarted = false;
        
        $scope.loadTree = function() {        	
        	
        	$scope.defaultFolders = null;
        	
        	UserFolderService.defaultFolders(function (rootLevelFolders) {
        		if(rootLevelFolders==null){
        			CommonService.showErrorMessage(e8msg.error.cantFetchFolders)
        			return;
        		}
        		
        		var allNodes = rootLevelFolders;
        		
            	UserFolderService.testRootFolder(function(myTestRoot){
            		if(myTestRoot==null){
            			CommonService.showErrorMessage(e8msg.error.cantFetchRootFolder)
            			return;
            		}
            		$scope.myTestRoot = myTestRoot;            	            		                
	                
	                $rootScope.blockLeftPanel.start();
	                
	                TestService.getTests($scope.myTestRoot.guid, function(tests){
	                	if(tests==null){
	                		$rootScope.blockLeftPanel.stop();
	                		CommonService.showErrorMessage(e8msg.error.cantFetchTests)
	            			return;
	                	}

	                	tests.forEach(function(test) {
	                		
	                    	if(SharedTabService.tests) {
	                        	SharedTabService.tests.forEach(function(testTab) {
	                        		if(testTab.testId == test.guid) {
	                        			test.showEditIcon = false;
	                        			test.draggable = false;
	                        			test.showArchiveIcon = false;
	                        			testTab.treeNode = test;
	                        		}
	                        	});
	                    	}
	                    	allNodes.push(test);	
	                	});
	                	
	                	if(allNodes.length) {
	                		$scope.defaultFolders = allNodes;
	                		$scope.defaultFolders.push(CommonService.getArchiveRoot());
	                	} else {
	                    	ArchiveService.getArchiveFolders(null, function (userFolders) {
	                    		if(userFolders==null){
			                  		 $rootScope.blockLeftPanel.stop();
			                  		 CommonService.showErrorMessage(e8msg.error.cantFetchArchiveFolders);
			                  		 return;
			                  	}
	                    		if(userFolders.length) {
	                    			$scope.defaultFolders = []
	                    			$scope.defaultFolders.push(CommonService.getArchiveRoot());	                    			                			
	                    		} else {
	                    			
	                                TestService.getArchiveTests(null, function (tests) {
	                                	if(tests==null){
	                                		$rootScope.blockLeftPanel.stop();
	                                		 CommonService.showErrorMessage(e8msg.error.cantFetchArchiveTests);
	                                		return;
	                                	}
	                                	if(tests.length) { 
	                                		$scope.defaultFolders = []
	                                		$scope.defaultFolders.push(CommonService.getArchiveRoot());	                            			                    			
	                            		} else {
	                            			$scope.defaultFolders = [];
	                            		}	                                	
	                                });	                                
	                    		}
	                    	});                		
	                	}
	                	
	                	$rootScope.blockLeftPanel.stop();
	                });
	                
            	});
                
                
            });
        }
        $scope.loadTree();
        
        $scope.$on('ImportUserBooks', function() {		
			$scope.loadTree();								
		})
		
	  $scope.treeOptions = {
                
                beforeDrag: function (sourceNodeScope) {
                    if((sourceNodeScope.node.hasOwnProperty('draggable') && sourceNodeScope.node.draggable == false) || sourceNodeScope.node.isEditMode) {
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
                	if($rootScope.tree && $rootScope.tree.mouseOverNode){
                		if(!isForeign(e)){
    	                	$scope.position.cancel = true;
                    	}
                		var mouseOverNode = $rootScope.tree.mouseOverNode
                		if(mouseOverNode.node.selectTestNode){
                			$scope.selectedMouseOverNode = mouseOverNode.node;
                			mouseOverNode.node.selectTestNode = false;
                		}
                	}
                	
                	CommonService.autoScrollLeftFrame($('div#MyTest-tree-root'), e);
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
                    
                	var destination = e.dest.nodesScope;
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

                    if(source.node && destination.node &&(source.node === destination.node)){
                    	e.source.nodeScope.$$apply = false;
                    	$scope.dragStarted = false;
                    	return;
                    }
                    
                    if (mouseOverNode && (mouseOverNode.node != source.node)) {
                        e.source.nodeScope.$$apply = false;
                        $scope.dropIntoFolder(source, sourceParent, mouseOverNode);
                        return;                        
                    }                    

                    var destIndex = e.dest.index;
                    
                    var prev;
                    if(e.source.index < destIndex) {
                    	prev = destination.childNodes()[destIndex-1];	
                    } 
                    
                    var next;
                    if(e.source.index < destIndex) {
                    	next = destination.childNodes()[destIndex+1];	
                    } else {
                    	next = destination.childNodes()[destIndex];
                    }                                                                

                    if(source.node.nodeType=="test") {
                        if(next && next.node.nodeType == "folder") { 
                            e.source.nodeScope.$$apply = false;
                            $scope.dragStarted = false;
                            return;
                        }                    
                    }  
                    
                    if(source.node.nodeType=="test") {
                    	if(prev && (prev.node.nodeType == "archiveRoot" || prev.node.nodeType == "archiveFolder" || prev.node.nodeType == "archiveTest")) { 
                            e.source.nodeScope.$$apply = false;
                            $scope.dragStarted = false;
                            return;
                        }                    
                    }
                    
                    if(source.node.nodeType=="folder") {
                        if(prev && (prev.node.nodeType == "test" || prev.node.nodeType == "archiveRoot" || prev.node.nodeType == "archiveFolder" || prev.node.nodeType == "archiveTest")) { 
                            e.source.nodeScope.$$apply = false;
                            $scope.dragStarted = false;
                            return;
                        }                    
                    } 


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
                	if( sourceIndex == destIndex && e.dest.nodesScope === e.source.nodesScope){
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
            
            var duplicateTitle = false;
            $rootScope.blockLeftPanel.start();
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
                        var sourceFolder = $scope.removeTestBindingFromSource(sourceParent, item.guid);
                        UserFolderService.saveUserFolder(sourceFolder, function(userFolder) {
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
                            		mouseOverNode.node.nodes.push(item);
                            	}
                                
                                if(sourceParent && sourceParent.node && sourceParent.node.nodes.length==0) {
                                    sourceParent.node.nodes.push(CommonService.getEmptyFolder());
                                }
                                
                                $rootScope.blockLeftPanel.stop();                                    
                            });
                        });
                    }
                });
            });
        };

        $scope.dragEnd = function (event, destParent, source, sourceParent,
  			  sourceIndex, destIndex, prev, next) {
        	          
  			if(!$scope.dragStarted) {
                return false;
            }
  			
  			$scope.dragStarted = false;
  			
            if(source.node.nodeType === EnumService.NODE_TYPE.test && destParent.controller === EnumService.CONTROLLERS.testCreationFrame){        
                source.node.showEditIcon=false;
                source.node.showArchiveIcon=false;
                $rootScope.$broadcast("dropTest", source, destIndex);
                source.node.selectTestNode = true;
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
            	
            	if(item.nodeType == EnumService.NODE_TYPE.test) {
            		                    
            		var sourceFolder = $scope.removeTestBindingFromSource(sourceParent, item.guid);   
            		UserFolderService.updateUserFolder(sourceFolder, function(userFolder) {
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
                        item.parentId = null;
            		}

            		if(prevSeq == 0.0 && nextSeq == 0.0) {
            			item.sequence = 1.0;
            		} else if(prevSeq > 0.0 && nextSeq == 0.0) {
            			item.sequence = prevSeq + 1.0;
            		} else {
            			item.sequence = (parseFloat(prevSeq) + parseFloat(nextSeq)) / 2;	
            		}
            		UserFolderService.updateUserFolder(item, function(userFolder) {
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
        };
        
        $scope.insertTestBindingToDest = function(destFolder, testId, callback) {
        	var destNode = destFolder.node;
        	var testBindings = destNode.testBindings;
        	        	
        	var firstNodeSequence = 0.0, newSequence = 1.0;
        	if(testBindings.length) {
        		firstNodeSequence = testBindings[0].sequence;
        		newSequence = (0.0 + firstNodeSequence) / 2;
        	}
        	
        	var testBinding = {
    			testId: testId, sequence: newSequence
        	}
        	
        	destNode.testBindings.unshift(testBinding);
        	
        	UserFolderService.updateUserFolder(destNode, function(userFolder) {
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
    		
        	var testBindings = [];
        	var sequence = 1.0;
        	destNodes.forEach(function(test) {
        		if(test.nodeType == EnumService.NODE_TYPE.test) {
        			
            		var testBinding = {
                			testId: test.guid,
                			sequence: sequence  
            		}
                	testBindings.push(testBinding);
            		sequence = sequence + 1.0;
        		}        		 
        	})
        	
        	var destNode;
        	if(destFolder == null || destFolder.node == null) {
        		var destNode = $scope.myTestRoot;    			
    		} else {
    			destNode = destFolder.node;
    		}
        	
        	destNode.testBindings = testBindings;
        	UserFolderService.updateUserFolder(destNode, function(userFolder) {
        		if(userFolder==null){
             		CommonService.showErrorMessage(e8msg.error.cantSave);
             		return;
             	}
        		callback();
        	});
        }
        
        $scope.removeTestBindingFromSource = function (sourceFolder, testId) {
        	var sourceNode;
    		if(sourceFolder == null || sourceFolder.node == null) {
    			sourceNode = $scope.myTestRoot;
    		} else {
    			sourceNode = sourceFolder.node;
    		}    		
    		
    		var testBindings = sourceNode.testBindings;
        	var index=0, indexToRemove=0;
        	
        	testBindings.forEach(function(testBinding) {
        		if(testBinding.testId == testId) {
        			indexToRemove = index;
        		}
        		index = index + 1;        		
        	})
        	
        	testBindings.splice(indexToRemove, 1);
        	sourceNode.testBindings = testBindings;
        	
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
            	$scope.selectedMouseOverNode.selectTestNode = true;
            	$scope.selectedMouseOverNode = null;
            }
            	
        }             
		
        // To show the Edit icon,on click of test
        // node.
        $scope.closeTip=function(){
        	$('.testMessagetip').hide();
        }
        $('.testMessagetip').offset({'top':($(window).height()/2)-$('.testMessagetip').height()});
        $('.testMessagetip').hide();
        $scope.selectTestNode = function (event,test) {
        	
        	if(event != null){
        		event.preventDefault(); //Avoids event conflict
        	}
        	
        	if(test.node.nodeType == EnumService.NODE_TYPE.emptyFolder || test.node.isEditMode) {
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
	        	}, evalu8config.messageTipTimeMilliSeconds);
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

        	if (!defaultFolder.collapsed) {
        		defaultFolder.collapse();
        	} else {
        		defaultFolder.expand();
        	}

        	if(defaultFolder.node.nodes && defaultFolder.node.nodes.length > 0 ){
        		return false;
        	}
            if (!defaultFolder.collapsed) {            	
				
				UserFolderService.getUserFoldersByParentFolderId(defaultFolder.node.guid, function (userFolders) {
					if(userFolders==null){
                		$rootScope.blockLeftPanel.stop();
                 		CommonService.showErrorMessage(e8msg.error.cantFetchFolders);
                 		return;
                 	}
                    defaultFolder.node.nodes = userFolders;

                    $rootScope.blockLeftPanel.start();
                    TestService.getTests(defaultFolder.node.guid, function (tests) {
                    	if(userFolders.length == 0 && (tests == null || tests.length == 0)) {

    						userFolders.push(CommonService.getEmptyFolder());
    					}
						if(tests==null){
							$rootScope.blockLeftPanel.stop();
							CommonService.showErrorMessage(e8msg.error.cantFetchTests)
                			return;
						}
                        tests.forEach(function (test) {

                        	if(SharedTabService.tests) {
	                        	SharedTabService.tests.forEach(function(testTab) {
	                        		if(testTab.testId == test.guid) {
	                        			test.showEditIcon = false;
	                        			test.draggable=false;
	                        			test.showArchiveIcon = false;
	                        			testTab.treeNode = test;
	                        		}
	                        	});
                        	}
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
            			angular.element($('[id=' + archivedFolder.guid + ']')).scope().node.nodes = [];
            			angular.element($('[id=' + archivedFolder.guid + ']')).scope().collapse();
            			$rootScope.blockLeftPanel.stop();
            			return; // return if archived node is already displayed in Archive Section
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
            				
            				$scope.insertArchivedFolder($scope.archiveRoot, archivedFolder);
            				
            				/*$scope.archiveRoot.node.nodes.unshift(archivedFolder)*/        				
            			}	        				        				    
            		} else {
            			
            			archivedFolderParent = angular.element($('[id=' + archivedFolder.parentId + ']')).scope()
            			if(archivedFolderParent && archivedFolderParent.node) {
            				if(archivedFolderParent.node.nodes[0] && archivedFolderParent.node.nodes[0].nodeType == EnumService.NODE_TYPE.emptyFolder) {
            					archivedFolderParent.node.nodes.splice(0,1);
            				}
            				
            				$scope.insertArchivedFolder(archivedFolderParent, archivedFolder);
            				
            				/*archivedFolderParent.node.nodes.unshift(archivedFolder);*/
            			}else{
            				$scope.loadAllArchiveItems();
            			}       			
            		}        		        

            		$rootScope.blockLeftPanel.stop();
            	});
        	}
        		
        	
      //}
        /*
         * Method to insert an archived folder in to the archived section
         */
    	$scope.insertArchivedFolder = function(archivedFolderParent, archivedFolder){
    		
    		var pos = 0;
			
			for(var i=0; i< archivedFolderParent.node.nodes.length; i++){
				
				var currentNode = archivedFolderParent.node.nodes[i]; // Save current node.
				
				if(currentNode.nodeType == EnumService.NODE_TYPE.archiveTest){
					break; // No need to continue if archiveTest starts.
				}if(currentNode.nodeType == EnumService.NODE_TYPE.archiveFolder && archivedFolderParent.node.nodes[i].sequence <= archivedFolder.sequence){
					pos = i+1; // Update the position next to the greater sequence node.             						
				}else{
					continue;
				}            						
			}            				
			
			archivedFolderParent.node.nodes.splice(pos,0,archivedFolder);
    	}
    	
    	$scope.loadAllArchiveItems = function(){
        	
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
    	            $scope.message = e8msg.validation.duplicateTestTitleRestoreFolder;
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
        			angular.element($('[id=' + restoredFolder.guid + ']')).scope().node.nodes = [];
        			angular.element($('[id=' + restoredFolder.guid + ']')).scope().collapse();
        			$rootScope.blockLeftPanel.stop();
        			return; // return if restored node is already displayed in
        			// User Section
        		}
        		
        		restoredFolder.nodeType = "folder";
        		
        		var restoredFolderParent;
        		
        		if(restoredFolder.parentId == null) {
        			$scope.insertUserFolder($scope.defaultFolders, restoredFolder);        			  			       				    
        		} else {

        			restoredFolderParent = angular.element($('[id=' + restoredFolder.parentId + ']')).scope()
        			if(restoredFolderParent && restoredFolderParent.node) {
        				if(restoredFolderParent.node.nodes[0] && restoredFolderParent.node.nodes[0].nodeType == EnumService.NODE_TYPE.emptyFolder) {
        					restoredFolderParent.node.nodes.splice(0,1);
        				}
        				$scope.insertUserFolder(restoredFolderParent.node.nodes, restoredFolder);
        				//restoredFolderParent.node.nodes.unshift(restoredFolder);
        			}else{
        				$scope.showParentNodeOnChildrenRestore();
        			}         				
        		}
        		
        		$rootScope.blockLeftPanel.stop();
        	});        	
        }
        
        /*
         * This method inserts a user folder in to the parent folder using sequence.
         */
        $scope.insertUserFolder = function(parentFolder,folder){
        	
        	var restoreIndex = 0;
        	parentFolder.forEach(function(item){
	        	if(item.nodeType == EnumService.NODE_TYPE.folder){
					if(item.sequence <= folder.sequence) {
						restoreIndex = restoreIndex + 1;
						
	    				 if(item.sequence == folder.sequence){ // if sequence are equal, update it with unique one.
	    					
	    					if(parentFolder[restoreIndex] && parentFolder[restoreIndex].nodeType == EnumService.NODE_TYPE.folder){
	    						folder.sequence = (parseFloat(item.sequence) + parseFloat(parentFolder[restoreIndex].sequence))/2;
	        					
	    					}else{
	    						folder.sequence = folder.sequence + 1.0;
	    					}
	    					
	    					UserFolderService.updateUserFolder(folder, function(userFolder) {
	    	        			//console.log(" folder sequence updated : " + userFolder.sequence);
	    	        		});
	    				}
					}
				}
        	});
        	
        	parentFolder.splice(restoreIndex, 0, folder);
        }
        
        
        var isPresentInRootLeveFolders = function(folder){
        	for(var i = 0; i < $scope.defaultFolders.length; i++){
        		if(folder.guid == $scope.defaultFolders[i].guid){
        			return true;
        		}
        	}
        	return false;
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
        			
        			var index = 0, restoreIndex = 0;
        			$scope.defaultFolders.forEach(function(item){

        				if(item.nodeType == EnumService.NODE_TYPE.archiveRoot) {
        					restoreIndex = index;        					
        				}
        				index = index + 1;
        			})        			       			
        				
        			
        			TestService.getTests(null, function (tests) {
        				if(tests==null){
        					$rootScope.blockLeftPanel.stop();
        					CommonService.showErrorMessage(e8msg.error.cantFetchTests)
        					return;
        				}
        				
        				for(var index=0; index<tests.length;index++){
        					if(tests[index].guid == test.node.guid){        						
        						restoreIndex = restoreIndex - tests.length + index + 1;
        						break;
        					}
        				}  
        				
        				$scope.defaultFolders.splice(restoreIndex, 0, test.node);
        			});
        			
        			
                    
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
                    }else{
                    	$scope.showParentNodeOnChildrenRestore();
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
        
        
        $scope.showParentNodeOnChildrenRestore = function(){
        	UserFolderService.defaultFolders(function (rootLevelFolders) {

        		for(var j = 0; j < rootLevelFolders.length; j++){
        			if(!isPresentInRootLeveFolders(rootLevelFolders[j])){
        				$scope.restoredFolderParent = rootLevelFolders[j];
        				break;
        			}
        		}
        		var restoredNodetIndex = 0;
        		$scope.defaultFolders.forEach(function(item){
        			if(item.sequence < $scope.restoredFolderParent.sequence) {
        				restoredNodetIndex = restoredNodetIndex + 1;        					
        			}
        		}) 
        		$scope.defaultFolders.splice(restoredNodetIndex, 0, $scope.restoredFolderParent);
        	});
        }
        $scope.deleteFolder = function(folder) {
        	$scope.isFolderDeleteClicked=true;
    		$scope.IsConfirmation = true;        		
    		$scope.message="Are you sure you want to permanently delete this folder. This action cannot be undone. Click OK if you want to delete this folder";
    		
    		$modal.open(confirmObject).result.then(function(ok) {
	    		if(ok) {
        			ArchiveService.deleteFolder(folder.node.guid, function(response,status) {
        				if(status!=200){
	                		if(status==400){
	                			$scope.IsConfirmation = false;
        			            $scope.message = e8msg.error.cantDeleteFolderBecauseOfTest;
        			            $modal.open(confirmObject);
	                		}else{
	                			CommonService.showErrorMessage(e8msg.error.cantDeleteFolder)	
	                		}
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
	                		if(status==400){
	                			$scope.IsConfirmation = false;
        			            $scope.message = response;
        			            $modal.open(confirmObject);
	                		}else{
	                			CommonService.showErrorMessage(e8msg.error.cantDeleteTest)	
	                		}
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

        $scope.editFolder = function (element,node) {
            var rootFolders= $scope.defaultFolders;
            if (element.node.parentId) {
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
                        
                            $scope.message = e8msg.validation.duplicateFolderTitle;
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
           
            UserFolderService.saveUserFolder(userFolder, function (userFolder) {
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
                        $scope.message = e8msg.validation.duplicateFolderTitle;

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
                "parentId": null,                
                "sequence": sequence,
                "title": $scope.folderName
            };
            $scope.folderName=null;
            UserFolderService.saveUserFolder(userFolder, function (userFolder) {
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
                
            	if($scope.defaultFolders.length == 1) {
            		$scope.defaultFolders.push(CommonService.getArchiveRoot());
            	}
            	
                $scope.folderName = "";
               
                $scope.showAddFolderPanel = false;
            });
            
            $("#MyTest-tree-root")[0].scrollTop = 0; 

        }
        
      // evalu8-ui : to set Active Resources Tab , handled in
		// ResourcesTabsController
        $rootScope.$broadcast('handleBroadcast_setActiveResourcesTab', EnumService.RESOURCES_TABS.yourtests);

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
        $scope.$on('handleBroadcast_AddNewTest', function (handler, newTest, containerFolder, isEditMode, oldGuid, editedQuestions, editedMigratedQuestions, createdTab, testCreationFrameScope) {
            if (isEditMode) {
                var updatedTest = CommonService.SearchItem($scope.defaultFolders, newTest.guid);
             if(updatedTest){
                updatedTest.title = newTest.title;
                updatedTest.modified = newTest.modified;
                if (createdTab.isSaveAndClose) {
                    SharedTabService.closeTab(createdTab, testCreationFrameScope);
                    SharedTabService.removeMasterTest(createdTab);
                } else {
                    SharedTabService.removeMasterTest(createdTab);
                    SharedTabService.addMasterTest(createdTab);
                }
            }else{
            	SharedTabService.removeMasterTest(createdTab);
                SharedTabService.addMasterTest(createdTab);
            }
             return false;
          }
            var parentFolder = null, parentFolderNodes = null,parentTestBindings = null;
            // if containerFolder is null, it considered as root
            if (containerFolder == null) {
            	parentFolderNodes = $scope.defaultFolders;
            } else {
            	parentFolder = CommonService.SearchItem($scope.defaultFolders, containerFolder.guid);
            	parentFolderNodes = parentFolder.nodes;
            	parentTestBindings = parentFolder.testBindings;
            }
            TestService.getMetadata(newTest.guid, function (test) {  
            	if(test==null){
            		CommonService.showErrorMessage(e8msg.error.cantFetchMetadata);
            		return;
           	 	}
            	test.nodeType = EnumService.NODE_TYPE.test;
            	test.draggable = false;

            	if (containerFolder) {// to check whether test belongs to root
										// or any other folder
            		test.parentId = containerFolder.guid;
            		test.selectTestNode = true;
            		if(parentFolderNodes && parentFolderNodes.length > 0){
            				if(parentFolderNodes[0].nodeType == EnumService.NODE_TYPE.emptyFolder) { // checking
																										// whether
																										// first
																										// node
																										// is
																										// empty
																										// or
																										// not
            					parentFolderNodes.shift();
            				}
            				parentFolderNodes.push(test);
            				if(containerFolder.testBindings.length > 0){
            					var testBinding = {
            							testId: newTest.guid,
            							sequence: containerFolder.testBindings[containerFolder.testBindings.length-1].sequence + 1 
            					}
            							parentTestBindings.push(testBinding);
            				}else{
            					var testBinding = {
            							testId: newTest.guid,
            							sequence: 1 
            					}
            					parentTestBindings.push(testBinding);
            				}
            		}else{
            			 parentFolder.nodes=[];
            			var testBinding = {
            					testId: newTest.guid,
            					sequence: 1 
            			}
            			parentTestBindings.push(testBinding);
            			parentFolder.nodes.push(test);
            		}
            	}
            	else {
            		test.parentId = null;
            		var position = 0;
            		$.each(parentFolderNodes, function (i,item) {
            			if (item.nodeType == EnumService.NODE_TYPE.archiveRoot){
            				return false;
            			}
            			position++;
            		});

            		UserFolderService.testRootFolder(function(myTestRoot){
            			if(myTestRoot==null){
                			CommonService.showErrorMessage(e8msg.error.cantFetchRootFolder)
                			return;
                		}
            			$scope.myTestRoot = myTestRoot;
            		});
            		parentFolderNodes.splice(position, 0, test)
            	}
            	createdTab.metadata = TestService.getTestMetadata(test);
            	createdTab.treeNode = test;
            	if (createdTab.isSaveAndClose) {
            		SharedTabService.closeTab(createdTab, testCreationFrameScope);
            		SharedTabService.removeMasterTest(createdTab);
            	} else {
            		SharedTabService.removeMasterTest(createdTab);
            		SharedTabService.addMasterTest(createdTab);
            	}

            	if($scope.defaultFolders.length == 1) {
            		$scope.defaultFolders.push(CommonService.getArchiveRoot());
            	}
            });            
        });
        // #endregion
        $scope.$on('handleBroadcast_CreateVersion', function (handler, test, newTest) {
            var testFolder = CommonService.SearchFolder($scope.defaultFolders, test.folderGuid);
            var treeItems = null;
            if (testFolder==null) {
                treeItems = $scope.defaultFolders;
                UserFolderService.testRootFolder(function(myTestRoot){
                	if(myTestRoot==null){
            			CommonService.showErrorMessage(e8msg.error.cantFetchRootFolder)
            			return;
            		}
        			$scope.myTestRoot = myTestRoot;
        		});
            }
            else {
            	if(!testFolder.nodes){
                 	testFolder.nodes =[];
                 	testFolder.nodes.push(newTest);
                 }
                treeItems = testFolder.nodes;
            }
          if(testFolder != null){  
            var sequence;
            testFolder.testBindings.forEach(function(binding){
            	if(binding.testId==test.id){
            		sequence=binding.sequence;
            	}else{
            		testFolder.nodes.forEach(function(node){
            			if(node.guid==binding.testId && node.versionOf==test.id){
            				sequence=binding.sequence;
            			}
            		});
            	}
            });
            
            var testBinding = {
                    testId: newTest.guid,
                    sequence:  sequence + 0.001 
            }
            testFolder.testBindings.push(testBinding);
          }
            addVersionTest(testFolder, treeItems, test, newTest);
            
        })     
               
        $scope.openImportBooksViewModal = function () {
        	$modal.open({	            
        		templateUrl: 'views/partials/import-userbooks-popup.html',	   
        		controller : 'ImportUserBooksPopUpController',
        		backdrop : 'static',
				keyboard : false
        	});
        }        
        
        var addVersionTest = function (testFolder, treeItems, test, newTest) {
            if (!treeItems) {
                return;
            }
            $.each(treeItems, function (i, v) {
            	if ((v.guid == test.id && (treeItems[i+1]==undefined || treeItems[i+1].versionOf != test.id)) || (v.versionOf == test.id && (treeItems[i+1]==undefined || test.id && treeItems[i+1].versionOf != test.id))) {
            		if(treeItems[i+1] != undefined && treeItems[i+1].versionOf == test.id){
            			i+=1;
            		}
                    treeItems.splice(i + 1, 0, newTest)
                    return false;
                }
            });
        }
        
        /* 
		 * Method for identify source and destination tree of the event are same or not
		 * 
		 */
		var  isForeign = function(e){
			return e.source.nodeScope.$treeScope != e.dest.nodesScope.$treeScope;
		}
        
    }]);