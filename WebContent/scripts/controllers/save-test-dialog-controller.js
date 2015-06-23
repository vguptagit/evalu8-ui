angular.module('e8MyTests')
.controller('SaveTestDialogController',
		['$scope', '$rootScope', '$modalInstance', 'parentScope', '$modal', 'UserFolderService', 'EnumService', 'CommonService',
		 function ($scope, $rootScope, $modalInstance, parentScope, $modal, UserFolderService, EnumService, CommonService) {

		     $scope.selectedfolder = null;
		     $scope.loadRootFolders = function () {
		         UserFolderService.testRootFolder(function (myTestRoot) {
		             $scope.myTestRoot = myTestRoot;
		         });

		         UserFolderService.defaultFolders(function (defaultFolders) {
		             $scope.node = defaultFolders;
		         });
		     }

		     $scope.loadRootFolders();

		     //populate the child nodes.
		     $scope.getFolders = function (node, defaultFolder) {
		         $('#scroll').scrollTop(0);
		         var folderState = node.isSelected;
		         clearNodes(node, defaultFolder);
                 
		         $scope.selectedfolder.isSelected = !folderState;   //to select and deselection of folder.
		         if ($scope.selectedfolder.isSelected) {
		             $scope.getUserFolders(node);
		         }
		         else {
		             $scope.selectedfolder = null;
		         }
		     }
		      
		     //clear the previous selection and refresh the grid.
		     //node : is a root folders 
		     //chieldFolder : is a child folders
		     function clearNodes(node, chieldFolder) {
		         $scope.selectedfolder = node;
		         var parentFolder = CommonService.SearchItem($scope.node, node.parentId);
		         if (parentFolder) {
		             for (var i = 0; i < parentFolder.nodes.length; i++) {
		                 parentFolder.nodes[i].nodes = []
		                 parentFolder.nodes[i].isSelected = false;
		             }
		         } else {
		             for (var i = 0; i < chieldFolder.$parent.node.length; i++) {
		                 chieldFolder.$parent.node[i].nodes = []
		                 chieldFolder.$parent.node[i].isSelected = false;
		             }
		         }
		     }
		     
		     $scope.getUserFolders = function (folder, callback) {
		         UserFolderService.getUserFoldersByParentFolderId(folder.guid, function (userFolders) {
		             folder.nodes = userFolders;
		             if (callback) callback();
		         });
		     };
		     
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
		        
		     $scope.addNewFolder = function (folderName, callback) {
		    	 
	    	 	if (folderName == null || folderName.trim().length == 0) { return; }
		         
	    	 	var nodes = [];
				if($scope.selectedfolder && $scope.selectedfolder.nodes) {
					nodes = $scope.selectedfolder.nodes
				} else if($scope.node) {
					nodes = $scope.node;
				}	
				
				var duplicateTitle = false;
				nodes.forEach(function(folder) {
					if(folder.nodeType == EnumService.NODE_TYPE.folder && folder.title == folderName) {
						duplicateTitle = true;	
						
			            $scope.IsConfirmation = false;
			            $scope.message = "A folder already exists with this name. Please save with another name.";
			            $modal.open(confirmObject); 
					}
				});
				
				if(duplicateTitle) return;									
	            
		         var sequence = 1;
		         if ($scope.selectedfolder && $scope.selectedfolder.nodes) {
		             if ($scope.selectedfolder.nodes[0].nodeType === EnumService.NODE_TYPE.emptyFolder) {
		                 sequence = 1;
		             } else {
		                 sequence = ($scope.selectedfolder.nodes[0].sequence / 2);
		             }
		         } else if ($scope.node[0] != null && ($scope.node[0].nodeType !== EnumService.NODE_TYPE.archiveRoot || $scope.node[0].nodeType !== EnumService.NODE_TYPE.emptyFolder)) {
		             sequence = ($scope.node[0].sequence / 2);
		         }

		         var newFolder = {
		             "parentId": $scope.selectedfolder === null ? null : $scope.selectedfolder.guid,
		             "sequence": sequence,
		             "title": folderName
		         };

		         UserFolderService.saveUserFolder(newFolder, function (response) {
		             newFolder.guid = response.guid;
		             newFolder.nodeType = EnumService.NODE_TYPE.folder;
		             if ($scope.selectedfolder) {
		                 $scope.selectedfolder.nodes.unshift(newFolder);
		             }
		             else {
		                 $scope.node.unshift(newFolder);
		             }
		             $rootScope.$broadcast('handleBroadcast_AddNewFolder', newFolder);
                     		             
		         });
		     }

		     $scope.currentTest = parentScope.tests[parentScope.currentIndex];
		     $scope.title = $scope.currentTest.title;
		     $scope.isErrorMessage = false;

		     $scope.save = function () {
		         if ($scope.title == "" || $scope.title == null) {
		             parentScope.showMessage_EmptyTestTitle();
		             return false;
		         }
		         parentScope.saveAs_Test($scope.title, $scope.selectedfolder);
		         $modalInstance.dismiss('cancel');
		     };
		     $scope.cancel = function () {
		         $modalInstance.dismiss('cancel');
		     };

		     $scope.openAddNewFolderPopup = function () {
		         $modal.open({
		             templateUrl: 'addNewFolder.html',
		             controller: 'AddNewFolderController',
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
		 }]);
angular.module('e8MyTests').controller('AddNewFolderController', function ($scope, $modalInstance, parentScope) {

    $scope.folderName = "";
    $scope.selectedfolder = parentScope.selectedfolder;
    $scope.createFolder = function () {
        if ($scope.folderName == null || $scope.folderName.trim().length == 0) { return; }

        parentScope.addNewFolder($scope.folderName, $modalInstance.dismiss('cancel'));
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});
