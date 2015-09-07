angular.module('e8MyTests')
.controller('PrintTestController',
		['$scope', '$rootScope', '$modalInstance', 'parentScope', 'UserService', 'TestService', '$modal',
		 function ($scope, $rootScope, $modalInstance, parentScope, UserService, TestService, $modal) {

		     $scope.test = angular.copy(parentScope.sharedTabService.masterTests[parentScope.currentIndex]);

		     $scope.answerAreas = [
                                   { value: 'NONE', isDisabled: false, text: 'None' },	//includeAreaForStudentResponse
                                   { value: 'BETWEENQUESTIONS', isDisabled: false, text: 'Between questions' },
                                   { value: 'LEFTSIDE', isDisabled: false, text: 'Left side of the page' },//leftSide
                                   { value: 'LASTPAGE', isDisabled: true, text: 'Blank last page' },//lastPage
		     ];

		     $scope.cancel = function () {
		         parentScope.tests[parentScope.currentIndex].isBtnClicked = false;
		         $modalInstance.dismiss('cancel');
		     };
		     $scope.selectedAnswerArea = $scope.answerAreas[0];
		     UserService.userPrintSettings(function (printSettings) {


		         if (printSettings.includeAreaForStudentResponse == $scope.answerAreas[0].value)
		             $scope.selectedAnswerArea = $scope.answerAreas[0];
		         if (printSettings.includeAreaForStudentResponse == $scope.answerAreas[1].value)
		             $scope.selectedAnswerArea = $scope.answerAreas[1];
		         if (printSettings.includeAreaForStudentResponse == $scope.answerAreas[2].value)
		             $scope.selectedAnswerArea = $scope.answerAreas[2];
		         if (printSettings.includeAreaForStudentResponse == $scope.answerAreas[3].value)
		             $scope.selectedAnswerArea = $scope.answerAreas[3];
		     });
		 }]);
