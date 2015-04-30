angular.module('e8MyTests').controller('AlertMessageController', 
		function ($scope, $rootScope, $modalInstance, parentScope) {

    $scope.message=parentScope.message;
    $scope.IsConfirmation=parentScope.IsConfirmation;
    
    $scope.Ok = function () {    	
    	$modalInstance.close(true);    
    };
    
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');      
    };
    
});