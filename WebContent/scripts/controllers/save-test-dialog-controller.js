angular.module('e8MyTests')
.controller('SaveTestDialogController',
		['$scope', '$rootScope', '$modalInstance', 'parentScope', '$modal', 'UserFolderService', 'EnumService',
		 function ($scope, $rootScope, $modalInstance, parentScope, $modal, UserFolderService, EnumService) {

		     $scope.selectedfolder = null;
		     $scope.loadRootFolders = function () {
		         UserFolderService.myTestRootFolder(function (myTestRoot) {
		             $scope.myTestRoot = myTestRoot;
		         });

		         UserFolderService.defaultFolders(function (defaultFolders) {
		             $scope.node = defaultFolders;
		         });
		     }

		     $scope.loadRootFolders();
		     $scope.getFolders = function (defaultFolder) {
		         $scope.selectedfolder = defaultFolder.node;
		         if (defaultFolder.node.nodeType === EnumService.CONTENT_TYPE.folder) {
		             if ($.isArray(defaultFolder.$parent.node)) {
		                 for (var i = 0; i < defaultFolder.$parent.node.length; i++) {
		                     defaultFolder.$parent.node[i].nodes = []
		                 }
		             } else {
		                 for (var i = 0; i < defaultFolder.$parent.node.nodes.length; i++) {
		                     defaultFolder.$parent.node.nodes[i].nodes = []
		                 }
		             }
		             $scope.getUserFolders(defaultFolder);
		         }
		     }
		     $scope.getUserFolders = function (defaultFolder, callback) {
		         UserFolderService.userFolders(defaultFolder.node, function (userFolders) {
		             defaultFolder.node.nodes = userFolders;
		             if (callback) callback();
		         });
		     };
		     $scope.addNewFolder = function (folderName, callback) {
		         if (folderName == null || folderName.trim().length == 0) { return; }
		         var sequence = 1;
		         if ($scope.selectedfolder) {
		             var lastFolder = $scope.selectedfolder.nodes[$scope.selectedfolder.nodes.length - 1];
		             if (lastFolder.nodeType != EnumService.CONTENT_TYPE.emptyFolder) {
		                 sequence = lastFolder.sequence + (lastFolder.sequence / 2);
		             }
		         }

		         var newFolder = {
		             "parentId": $scope.selectedfolder === null ? null : $scope.selectedfolder.guid,
		             "sequence": sequence,
		             "title": folderName
		         };

		         UserFolderService.saveUserFolder(newFolder, function (response) {
		             newFolder.guid = response.guid;
		             newFolder.nodeType = EnumService.CONTENT_TYPE.folder;
		             if ($scope.selectedfolder) {
		                 $scope.selectedfolder.nodes.push(newFolder);
		             }
		             else {
		                 $scope.node.push(newFolder);
		             }
		             $rootScope.$broadcast('handleBroadcast_AddNewFolder', newFolder);

		             if (callback) callback();
		         });
		     }

		     /*****************************************************************************/
		     $scope.currentTest = parentScope.tests[parentScope.currentIndex];
		     $scope.title = "";
		     $scope.isErrorMessage = false;

		     $scope.save = function () {
		         if ($scope.title == "" || $scope.title == null) {
		             $scope.errorMessage = 'please enter the test title.';
		             $scope.isErrorMessage = true;
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
		             size: 'sm',
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
