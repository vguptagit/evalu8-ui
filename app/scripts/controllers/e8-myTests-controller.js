'use strict';

angular.module('e8MyTests')

.controller('MyTestsController',
    ['$scope', '$rootScope', '$location', '$cookieStore', '$http', '$sce', '$modal',
     'UserFolderService', 'TestService', 'SharedTabService', 'ArchiveService','EnumService',
     function ($scope, $rootScope, $location, $cookieStore, $http, $sce, $modal,
    		UserFolderService, TestService, SharedTabService, ArchiveService,EnumService) {
    	
    	SharedTabService.selectedMenu = SharedTabService.menu.myTest;
        $scope.testTitle = "New Test";

        $scope.dragStarted = false;
        
        $scope.loadTree = function() {
        	
        	UserFolderService.myTestRootFolder(function(myTestRoot){
        		$scope.myTestRoot = myTestRoot;
        	});
        	
        	UserFolderService.defaultFolders(function (defaultFolders) {
            	
                $scope.defaultFolders = defaultFolders;
                
                TestService.getTests(null, function(tests){
                	tests.forEach(function(test) {
                		$scope.defaultFolders.push(test);	
                	});
                	
                	if($scope.defaultFolders.length) {
                		$scope.defaultFolders.push({'guid': null, 'nodeType': 'archiveRoot', "title": "Archive"});
                	} else {
                    	ArchiveService.getArchiveFolders(null, function (userFolders) {
                    		if(userFolders.length && !(userFolders.length==1 && userFolders[0].nodeType=='empty')) {
                				$scope.defaultFolders.push({'guid': null, 'nodeType': 'archiveRoot', "title": "Archive"});	                    			                			
                    		} else {
                    			
                                TestService.getArchiveTests(null, function (tests) {

                                	if(tests.length) {
                            			
                                		$scope.defaultFolders.push({'guid': null, 'nodeType': 'archiveRoot', "title": "Archive"});	                            			                    			
                            		}
                                });
                                
                    		}
                    	});                		
                	}
                });            
            });
        }
        
        $scope.loadTree();
        
        $scope.$on('dragStarted', function () {
            $scope.dragStarted = true;
        });

        $scope.$on('dragCancel', function () {
            $scope.dragStarted = false;
        });

        $scope.$on('dragEnd', function (event, destParent, source, sourceParent,
  			  sourceIndex, destIndex, prev, next) {

            $scope.dragStarted = false;

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
                source.remove();                
                
                if(item.nodeType == "folder") {
                    item.parentId = mouseOverNode.node.guid;
                    UserFolderService.getFoldersMinSeq(mouseOverNode.node, function(minSeq) {
                    	item.sequence = minSeq==0.0 ? 1.0 : (0.0 + minSeq)/2;
                    	UserFolderService.saveUserFolder(item);                	
                    })                	
                }
                else {
            		$scope.removeTestBindingFromSource(sourceParent, item.guid);
            		$scope.insertTestBindingToDest(mouseOverNode, item.guid);            		              	               	
                }

                
            } else {

            	var item = source.node;
            	var prevSeq = 0.0;
            	var nextSeq = 0.0;
            	$scope.itemSeq = 0.0;
            	
            	// delete empty previous and next node if any
            	$scope.deleteEmptyNode(prev, next, destParent);
            	
            	if(item.nodeType == "test") {
            		$scope.removeTestBindingFromSource(sourceParent, item.guid);            		
            		$scope.addTestToDest(destParent);
            	}
            	else if(item.nodeType == "folder") {

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
            		UserFolderService.saveUserFolder(item);
            	}
                
            }

        });
        
        $scope.insertTestBindingToDest = function(destFolder, testId) {
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
        	
        	UserFolderService.saveUserFolder(destNode)
        }
        
        $scope.addTestToDest = function(destFolder) {
        	var destNodes;
    		if(destFolder == null || destFolder.node == null) {
    			destNodes = $scope.defaultFolders;    			
    		} else {
    			destNodes = destFolder.node.nodes;
    		}
    		
        	var testBindings = [];
        	var sequence = 1.0;
        	destNodes.forEach(function(test) {
        		if(test.nodeType == 'test') {
        			sequence = sequence + 1;
            		var testBinding = {
                			testId: test.guid,
                			sequence: sequence  
            		}
                	testBindings.push(testBinding);        			
        		}        		 
        	})
        	
        	var destNode;
        	if(destFolder == null || destFolder.node == null) {
        		var destNode = $scope.myTestRoot;    			
    		} else {
    			destNode = destFolder.node;
    		}
        	
        	destNode.testBindings = testBindings;
        	UserFolderService.saveUserFolder(destNode);
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
        	UserFolderService.saveUserFolder(sourceNode);
    	}
        
        $scope.deleteEmptyNode = function(prev, next, destParent) {
        	if(prev && prev.node && "sequence" in prev.node && prev.node.sequence == 0)
        		destParent.node.nodes.splice(0,1);
        	if(next && next.node && "sequence" in next.node && next.node.sequence == 0)
        		destParent.node.nodes.splice(1,1);
        }
        
        $scope.getFolderNodeSequence = function(node) {
        	$scope.itemSeq = 0.0;
        	if(node.nodeType == "folder") {
        		$scope.itemSeq = node.sequence;
        	}
        }
        
        $scope.getTestNodeSequence = function(node) {
        	$scope.itemSeq = 0.0;
        	if(node.nodeType == "test") {
        		node.extendedMetadata.forEach(function(data) {
            		if(data.name=='sequence') {        			
            			$scope.itemSeq =  data.value;        			
            		}
            	}); 	
        	}
        }        

        $scope.treeNodeMouseEnter = function (node) {
            if ($scope.dragStarted && node.collapsed && node.node.nodeType != 'archiveFolder' && node.node.nodeType != 'empty') {
                $rootScope.tree = { mouseOverNode: node };
                node.hover = true;
            }
        };

        $scope.treeNodeMouseLeave = function (node) {

            $rootScope.tree = { mouseOverNode: null };
            node.hover = false;
        }

        // To show the Edit icon,on click of test
        // node.
        $scope.selectTestNode = function (test) {
            if (!test.node.disableEdit) {
                test.node.selectTestNode = !test.node.selectTestNode;
            }
            SharedTabService.showSelectedTestTab(test.node.guid);
        }

        //to disable the edit icon once it clicked  
        $scope.editTest = function (selectedTest) {
        	selectedTest.node.showEditIcon=false;
        	$scope.$broadcast("editTest", selectedTest);
        }

        $scope.getFolders = function(defaultFolder) {
        	if(defaultFolder.node.nodeType == 'folder') {
        		$scope.getUserFolders(defaultFolder);
        	}
        	if(defaultFolder.node.nodeType == 'archiveFolder') {
        		$scope.getArchiveFolders(defaultFolder);
        	}
        	if(defaultFolder.node.nodeType == 'archiveRoot') {
        		$scope.getArchiveFolders(defaultFolder);
        	}        	
        }
        
        $scope.getUserFolders = function (defaultFolder, callback) {

            defaultFolder.toggle();

            if (!defaultFolder.collapsed) {
            	UserFolderService.userFolders(defaultFolder.node, function (userFolders) {

                    defaultFolder.node.nodes = userFolders;

                    TestService.getTests(defaultFolder.node.guid, function (tests) {
                        tests.forEach(function (test) {
                            test.selectTestNode = false;//to show the edit icon
                            test.disableEdit = false;//to disable the edit icon

                            defaultFolder.node.nodes.push(test);
                        })

                        if (defaultFolder.node.nodes.length > 1 && defaultFolder.node.nodes[0].sequence == 0) {
                            defaultFolder.node.nodes.shift();
                        }

                    });
                    
                    if(callback) callback();
                });                
            }
        };
        
        $scope.getArchiveFolders = function (defaultFolder, callback) {

            defaultFolder.toggle();

            if (!defaultFolder.collapsed) {
                ArchiveService.getArchiveFolders(defaultFolder.node, function (userFolders) {

                    defaultFolder.node.nodes = userFolders;

                    TestService.getArchiveTests(defaultFolder.node.guid, function (tests) {
                        tests.forEach(function (test) {
                            test.selectTestNode = false;//to show the edit icon
                            test.disableEdit = false;//to disable the edit icon

                            defaultFolder.node.nodes.push(test);
                        })

                        if (defaultFolder.node.nodes.length > 1 && defaultFolder.node.nodes[0].sequence == 0) {
                            defaultFolder.node.nodes.shift();
                        }

                    });
                    
                    if(callback) callback();
                });                
            }
        };
        
        $scope.archiveFolder = function(folder) {
        	ArchiveService.archiveFolder(folder.node.guid, function(archivedFolder) {
        		folder.remove();        		
        		
        		archivedFolder.nodeType = "archiveFolder";
        		var archivedNode;
        		
        		$scope.defaultFolders.forEach(function(node) {
        			if(node.nodes) {
            			archivedNode = node.nodes.filter(function( obj ) {  return obj.guid == archivedFolder.parentId; });
            			if(archivedNode.length)
            				archivedNode[0].nodes.push(archivedFolder);        				
        			}
        		})

        	});        	
        }

        $scope.archiveTest = function(test) {
        	var parentFolderId = (test.$parentNodeScope == null) ? null : test.$parentNodeScope.node.guid; 
        	ArchiveService.archiveTest(test.node.guid, parentFolderId, function() {
        		test.remove();
        	});        	
        }
        
        $scope.restoreFolder = function(folder) {
        	ArchiveService.restoreFolder(folder.node.guid, function() {
        		folder.remove();
        	});        	
        }        
        
        $scope.restoreTest = function(test) {
        	ArchiveService.restoreTest(test.node.guid, test.$parentNodeScope.node.guid, function() {
        		test.remove();
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

    		$scope.IsConfirmation = true;        		
    		$scope.message="Are you sure you want to permanently delete this folder. This action cannot be undone. Click OK if you want to delete this folder";
    		
    		$modal.open(confirmObject).result.then(function(ok) {
	    		if(ok) {
        			ArchiveService.deleteFolder(folder.node.guid, function() {
        				folder.remove(); 
	                }); 
	    		}
    		})    		
        };
        
        $scope.deleteTest = function(test) {

    		$scope.IsConfirmation=true;        		    		
    		$scope.message="Are you sure you want to permanently delete this test. This action cannot be undone. Click OK if you want to delete this test";

    		$modal.open(confirmObject).result.then(function(ok) {
	    		if(ok) {
	                ArchiveService.deleteTest(test.node.guid, test.$parentNodeScope.node.guid, function() {
	                    test.remove();
	                }); 
	    		}
    		})
        };                
        
        //Rendering the question as html		
        $scope.getHTML = function (datanode) {
            if (datanode.node.length) {
                return $sce.trustAsHtml(datanode.node[0].innerHTML);
            } else if (datanode.node) {
                return $sce.trustAsHtml(datanode.node.textHTML);
            }
        }

        $scope.addNewFolder = function () {
        	
        	if($scope.folderName == null || $scope.folderName.trim().length==0) { return; }
        	
            var sequence = 1;

            if($scope.defaultFolders 
            		&& $scope.defaultFolders[0] 
            		&& $scope.defaultFolders[0].nodeType == 'folder') {
            	sequence = (0 + $scope.defaultFolders[0].sequence) / 2;
            }
            
            var userFolder = {
                "parentId": null,                
                "sequence": sequence,
                "title": $scope.folderName
            };

            UserFolderService.saveUserFolder(userFolder, function () {

            	$scope.loadTree();
                
                $scope.folderName = "";
               
                $scope.showAddFolderPanel = false;
            });

        }
         
      //evalu8-ui : to set Active Resources Tab , handled in ResourcesTabsController
      $rootScope.$broadcast('handleBroadcast_setActiveResourcesTab', EnumService.RESOURCES_TABS.yourtests);
    }]);