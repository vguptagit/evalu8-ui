angular.module('e8MyTests').controller('AlertMessageController', 
		function ($scope, $rootScope, $modalInstance, parentScope) {

    $scope.message=parentScope.message;
    $scope.IsConfirmation=parentScope.IsConfirmation;
    
    $scope.Ok = function () {
    	if(parentScope.IsConfirmation){
    		 parentScope.callbackAlert();
    	}    	
    	$modalInstance.dismiss('cancel');    
    };
    
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');      
    };
    
});