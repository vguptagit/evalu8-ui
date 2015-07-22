angular.module('e8MyTests').controller('TestWizardErrorPopupController',
		function ($scope, $rootScope, $modalInstance, sharedTabService) {

		    //$scope.curresnTest=parentScope.sharedTabService.tests[parentScope.sharedTabService.currentTabIndex];
		    $scope.errorMessages = sharedTabService.errorMessages;
		    $scope.close = function () {
		    	sharedTabService.errorMessages = [];
		        $modalInstance.dismiss('cancel');
		    };

		});