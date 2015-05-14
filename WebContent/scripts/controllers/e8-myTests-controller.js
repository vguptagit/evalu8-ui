'use strict';

angular.module('e8MyTests')

.controller('MyTestsController',
    ['$scope', '$rootScope', '$location', '$cookieStore', '$http', '$sce', '$modal',
     'UserFolderService', 'TestService', 'SharedTabService', 'ArchiveService','EnumService',
     function ($scope, $rootScope, $location, $cookieStore, $http, $sce, $modal,
    		UserFolderService, TestService, SharedTabService, ArchiveService,EnumService) {
    	
        $scope.controller = EnumService.CONTROLLERS.myTest;
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
        	          
  			if(!$scope.dragStarted) {
                return false;
            }
            if(source.node.nodeType==='test' && destParent.controller === EnumService.CONTROLLERS.testCreationFrame){        
                source.node.showEditIcon=false;
                source.node.showArchiveIcon=false;
                $rootScope.$broadcast("dropTest", source, destIndex);
                return false;
            }
            
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
                	var sourceFolder = $scope.removeTestBindingFromSource(sourceParent, item.guid);
                	UserFolderService.saveUserFolder(sourceFolder, function() {
                		$scope.insertTestBindingToDest(mouseOverNode, item.guid);                		
                	});            		              	               	
                }
                
            } else {

            	var item = source.node;
            	var prevSeq = 0.0;
            	var nextSeq = 0.0;
            	$scope.itemSeq = 0.0;
            	
            	// delete empty previous and next node if any
            	$scope.deleteEmptyNode(prev, next, destParent);
            	
            	if(item.nodeType == "test") {
            		var sourceFolder = $scope.removeTestBindingFromSource(sourceParent, item.guid);   
            		UserFolderService.saveUserFolder(sourceFolder, function() {
            			$scope.addTestToDest(destParent);
            		});            		            		
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
        $('.testMessagetip').offset({'top':($(window).height()/2)-$('.testMessagetip').height()});
        $('.testMessagetip').hide();
        $scope.selectTestNode = function ($event,test) {
        	
        	//$('.messagetip').offset({top:$($event.target).offset().top+50});
            if (!test.node.disableEdit) {
                test.node.selectTestNode = !test.node.selectTestNode; 
                if(test.node.selectTestNode && $rootScope.globals.loginCount<=2){
    	        	//$scope.notify=true;
    	        	$('.testMessagetip').show()
    	        	setTimeout(function(){ 
    	        		$('.testMessagetip').hide();
    	        	}, 4000);
            	}
            }
            SharedTabService.showSelectedTestTab(test.node.guid);
        }

        //to disable the edit icon once it clicked  
        $scope.editTest = function (selectedTest) {
        	selectedTest.node.showEditIcon=false;
        	selectedTest.node.showArchiveIcon=false;
        	$rootScope.$broadcast("editTest", selectedTest);
        }

        $scope.getFolders = function(defaultFolder) {
        	if(defaultFolder.node.nodeType == 'folder') {
        		$scope.getUserFolders(defaultFolder);
        	}
        	if(defaultFolder.node.nodeType == 'archiveFolder') {
        		$scope.getArchiveFolders(defaultFolder);
        	}
        	if(defaultFolder.node.nodeType == 'archiveRoot') {
        		$scope.archiveRoot = defaultFolder;
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
        		
        		if(angular.element($('[id=' + archivedFolder.guid + ']')).scope()) {
        			return; // return if archived node is already displayed in Archive Section
        		}
        		        		
        		archivedFolder.nodeType = "archiveFolder";
        		var archivedFolderParent;        		
        		
        		if(archivedFolder.parentId == null) {
        			
        			if($scope.archiveRoot && $scope.archiveRoot.node && $scope.archiveRoot.node.nodes && $scope.archiveRoot.node.nodes.length)
        				if($scope.archiveRoot.node.nodes[0].nodeType == "empty") {
        					$scope.archiveRoot.node.nodes.splice(0,1);
        				}
        				$scope.archiveRoot.node.nodes.unshift(archivedFolder)	        				        				    
        		} else {
        			
        			archivedFolderParent = angular.element($('[id=' + archivedFolder.parentId + ']')).scope()
        			if(archivedFolderParent && archivedFolderParent.node) {
        				if(archivedFolderParent.node.nodes[0] && archivedFolderParent.node.nodes[0].nodeType == "empty") {
        					archivedFolderParent.node.nodes.splice(0,1);
        				}
        				archivedFolderParent.node.nodes.unshift(archivedFolder);
        			}        			
        		}        		        

        	});        	
        }

        $scope.archiveTest = function(test) {
        	var parentFolderId = (test.$parentNodeScope == null) ? null : test.$parentNodeScope.node.guid; 
        	ArchiveService.archiveTest(test.node.guid, parentFolderId, function(archivedFolder) {
        		test.remove();  
        		
        		test.node.nodeType= "archiveTest";
        		
        		if(archivedFolder == null || archivedFolder == "") {
        			if($scope.archiveRoot && $scope.archiveRoot.node && $scope.archiveRoot.node.nodes && $scope.archiveRoot.node.nodes.length)
        				if($scope.archiveRoot.node.nodes[0].nodeType == "empty") {
        					$scope.archiveRoot.node.nodes.splice(0,1);
        				}
        				$scope.archiveRoot.node.nodes.push(test.node);	    
        		} else {
        			
        			var testParent = angular.element($('[id=' + archivedFolder.guid + ']')).scope();
        			if(testParent && testParent.node) {
        				if(testParent.node.nodes[0] && testParent.node.nodes[0].nodeType == "empty") {
        					testParent.node.nodes.splice(0,1);
        				}
        				
        				testParent.node.nodes.push(test.node);
        			}
        		}
        	});        	
        }
        
        $scope.restoreFolder = function(folder) {
        	ArchiveService.restoreFolder(folder.node.guid, function(restoredFolder) {
        		folder.remove();
        		
        		if(angular.element($('[id=' + restoredFolder.guid + ']')).scope()) {
        			return; // return if restored node is already displayed in User Section
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
        				if(restoredFolderParent.node.nodes[0] && restoredFolderParent.node.nodes[0].nodeType == "empty") {
        					restoredFolderParent.node.nodes.splice(0,1);
        				}
        				restoredFolderParent.node.nodes.unshift(restoredFolder);
        			}         				
        		}
        	});        	
        }        
        
        $scope.restoreTest = function(test) {
        	ArchiveService.restoreTest(test.node.guid, test.$parentNodeScope.node.guid, function(restoredFolder) {
        		test.remove();
        		
        		test.node.nodeType= "test";

                test.node.selectTestNode = false;//to show the edit icon
                test.node.disableEdit = false;//to disable the edit icon
                
        		if(restoredFolder == null || restoredFolder == "") {
        			
        			var index = 0, restoreIndex = 0;
        			$scope.defaultFolders.forEach(function(item){

        				if(item.nodeType == "archiveRoot") {
        					restoreIndex = index;        					
        				}
        				index = index + 1;
        			})
        			$scope.defaultFolders.splice(restoreIndex, 0, test.node);	    
        		} else {
        			
        			var testParent = angular.element($('[id=' + restoredFolder.guid + ']')).scope();
        			if(testParent && testParent.node && testParent.node.nodes && testParent.node.nodes.length) {
        				
        				for(var tesstItemIndex=testParent.node.nodes.length-1; tesstItemIndex>=0; tesstItemIndex--) {
        					if(testParent.node.nodes[tesstItemIndex].nodeType == 'test') {
        						testParent.node.nodes.splice(tesstItemIndex, 1);
        					}
        				}
        			}
        			
                    TestService.getTests(restoredFolder.guid, function (tests) {
                        tests.forEach(function (test) {
                            test.selectTestNode = false;//to show the edit icon
                            test.disableEdit = false;//to disable the edit icon

                            testParent.node.nodes.push(test);
                        })
                    });
        		}        		
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

            UserFolderService.saveUserFolder(userFolder, function (userFolder) {

            	//$scope.loadTree();
            	
            	userFolder.nodeType = "folder";
            	$scope.defaultFolders.unshift(userFolder);
                
            	if($scope.defaultFolders.length == 1) {
            		$scope.defaultFolders.push({'guid': null, 'nodeType': 'archiveRoot', "title": "Archive"});
            	}
            	
                $scope.folderName = "";
               
                $scope.showAddFolderPanel = false;
            });

        }
       
      //evalu8-ui : to set Active Resources Tab , handled in ResourcesTabsController
        $rootScope.$broadcast('handleBroadcast_setActiveResourcesTab', EnumService.RESOURCES_TABS.yourtests);
         //TODO : set container height, need revesit
        $('.myTest_scrollbar ').height(($(document).height() - $('.myTest_scrollbar ').offset().top) - 40);

        //#region Save-as test
        $scope.$on('handleBroadcast_AddNewFolder', function (handler, newFolder) {
            var parentFolder = null, parentFolderNodes=null;
            if (newFolder.parentId == null) {
                parentFolderNodes = $scope.defaultFolders
            } else {
                parentFolder = search($scope.defaultFolders, newFolder.parentId);
                parentFolderNodes = parentFolder.nodes;
            }
            
            var numberOfFolders = 0;
            $.each(parentFolderNodes, function (i, item) {
                if (item.nodeType === 'folder') {
                    numberOfFolders++;
                }
            });
            parentFolderNodes.splice(numberOfFolders, 0, newFolder)
        });
        $scope.$on('handleBroadcast_AddNewTest', function (handler, newTest,containerFolder) {
            var parentFolder = null, parentFolderNodes = null;
            if (containerFolder == null) {
                parentFolderNodes = $scope.defaultFolders
            } else {
                parentFolder = search($scope.defaultFolders, containerFolder.guid);
                parentFolderNodes = parentFolder.nodes;
            }
            TestService.getMetadata(newTest.guid, function (test) {
                test.nodeType = "test";
                test.showEditIcon = true;
                test.showArchiveIcon = true;
                if (containerFolder) {
                    test.parentId =  containerFolder.guid;
                    parentFolderNodes.push(test);
                }
                else {
                    test.parentId = null;
                    var position = 0;
                    $.each(parentFolderNodes, function (i,item) {
                        if (item.nodeType == 'archiveRoot') {
                            return false;
                        }
                        position++;
                    });
                    parentFolderNodes.splice(position, 0, test)
                }
            });
        });
        function search(values, id) {
            var parentFolder = null;
		    $.each(values, function (i, v) {
		        if (v.guid == id) {
		            console.log('found', v);
		            parentFolder = v;
		            return false;
		        }
		        if (v.nodes) {
		            search(v.nodes);
		        }
		    });
		    return parentFolder;
        }

        //#endregion

    }]);