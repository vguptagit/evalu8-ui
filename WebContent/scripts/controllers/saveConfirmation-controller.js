angular.module('e8MyTests').controller('SaveConfirmationController', function ($scope, $rootScope, $modalInstance, parentScope) {

    $scope.curresnTest=parentScope.tests[parentScope.currentIndex];
    $scope.isErrorMessage=false;

    $scope.save = function () {
    	if($scope.curresnTest.title == "" || $scope.curresnTest.title == null){
    	    parentScope.showMessage_EmptyTestTitle();
    	    $scope.cancel();
        	return false;
        }
    	parentScope.saveTest();
    	parentScope.tests[parentScope.currentIndex].isSaveAndClose=true;
    	$modalInstance.dismiss('cancel');
    };
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
    $scope.closeTab = function () {
    	parentScope.closeTab($scope.curresnTest);
        $modalInstance.dismiss('cancel');
    };
});
