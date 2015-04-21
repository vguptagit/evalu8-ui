angular.module('e8MyTests').controller('TestWizardErrorPopupController',
		function ($scope, $rootScope, $modalInstance, errorMessages) {

		    //$scope.curresnTest=parentScope.sharedTabService.tests[parentScope.sharedTabService.currentTabIndex];
		    $scope.errorMessages = errorMessages;
		    $scope.close = function () {
		        $modalInstance.dismiss('cancel');
		    };

		});