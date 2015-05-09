angular.module('e8MyTests')
.controller('SaveTestDialogController',
		['$scope', '$rootScope', '$modalInstance', 'parentScope', '$modal', 'UserFolderService',
		 function ($scope, $rootScope, $modalInstance, parentScope, $modal, UserFolderService) {
		     //angular.module('e8MyTests').controller('SaveAsPopupController', ['$modal', function ($scope, $rootScope, $modalInstance, $modal, parentScope) {


		     $scope.loadTree = function () {

		         UserFolderService.myTestRootFolder(function (myTestRoot) {
		             $scope.myTestRoot = myTestRoot;
		         });

		         UserFolderService.defaultFolders(function (defaultFolders) {
		             $scope.node = defaultFolders;
		         });
		     }

		     $scope.loadTree();
		     $scope.getFolders = function (defaultFolder) {
		         if (defaultFolder.node.nodeType == 'folder') {
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
		         //defaultFolder.toggle();
		         //if (!defaultFolder.collapsed) {
		         UserFolderService.userFolders(defaultFolder.node, function (userFolders) {
		             defaultFolder.node.nodes = userFolders;
		             if (callback) callback();
		         });
		         //}
		     };

		     /*****************************************************************************/
		     $scope.curresnTest = parentScope.tests[parentScope.currentIndex];
		     $scope.isErrorMessage = false;

		     $scope.save = function () {
		         if ($scope.curresnTest.title == "" || $scope.curresnTest.title == null) {
		             $scope.errorMessage = 'please enter the test title.';
		             $scope.isErrorMessage = true;
		             return false;
		         }
		         parentScope.saveTest();
		         parentScope.tests[parentScope.currentIndex].isSaveAndClose = true;
		         $modalInstance.dismiss('cancel');
		     };
		     $scope.cancel = function () {
		         $modalInstance.dismiss('cancel');
		     };
		     $scope.closeTab = function () {
		         parentScope.closeTab($scope.curresnTest);
		         $modalInstance.dismiss('cancel');
		     };
		     $scope.addNewFolder = function () {
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

    //$scope.items = items;
    //$scope.selected = {
    //    item: $scope.items[0]
    //};

    $scope.ok = function () {
        parentScope.cancel();
        //$modalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});
