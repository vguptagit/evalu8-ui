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

		     $scope.answerAreaBetweenQuestions=false;
		     $scope.answerAreaOnLeftSide=false;
		     $scope.answerAreaOnLastPage=false;
		     
		     $scope.cancel = function () {
		         parentScope.tests[parentScope.currentIndex].isBtnClicked = false;
		         $modalInstance.dismiss('cancel');
		     };
		     $scope.printTest = function () {
		         parentScope.tests[parentScope.currentIndex].isBtnClicked = false;
		         var elementToPrint=$('.testPreviewContainer').clone();
		         $(elementToPrint).find(".printEditLink").remove();
		         $(elementToPrint).find("#Essay").remove();	
		         $(elementToPrint).find("[class$='defaultPrintCorrectAnswer']" ).remove();
		         
		         if ($scope.selectedAnswerArea.value == $scope.answerAreas[0].value){
		        	 $(elementToPrint).find("#answerSpace").remove();
		        	 $(elementToPrint).find("#answerSpaceLastPage" ).remove();
		             $(elementToPrint).find("[ng-show='answerAreaOnLeftSide']").remove();
		         }else if($scope.selectedAnswerArea.value == $scope.answerAreas[1].value){
			         $(elementToPrint).find("[ng-show='answerAreaOnLeftSide']").remove();
			         $(elementToPrint).find("#answerSpaceLastPage" ).remove();
		         }else if($scope.selectedAnswerArea.value == $scope.answerAreas[2].value){
		        	 $(elementToPrint).find("#answerSpace").remove();
		        	 $(elementToPrint).find("#answerSpaceLastPage" ).remove();
		         }else if($scope.selectedAnswerArea.value == $scope.answerAreas[3].value){
		        	 $(elementToPrint).find("#answerSpace").remove();
		             $(elementToPrint).find("[ng-show='answerAreaOnLeftSide']").remove();
		         }
		         $(elementToPrint).print();
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
		         $scope.answerAreaChange();
		     });
		     
		     $scope.answerAreaChange = function () {
		    	 if ($scope.selectedAnswerArea.value == $scope.answerAreas[0].value){
		    		 $scope.answerAreaBetweenQuestions=false;
		    		 $scope.answerAreaOnLeftSide=false;
		    		 $scope.answerAreaOnLastPage=false;
		    	 }else if($scope.selectedAnswerArea.value == $scope.answerAreas[1].value){
		    		 $scope.answerAreaBetweenQuestions=true;
		    		 $scope.answerAreaOnLeftSide=false;
		    		 $scope.answerAreaOnLastPage=false;
		    	 }else if($scope.selectedAnswerArea.value == $scope.answerAreas[2].value){
		    		 $scope.answerAreaOnLeftSide=true;
		    		 $scope.answerAreaBetweenQuestions=false;
		    		 $scope.answerAreaOnLastPage=false;
		    	 }else if($scope.selectedAnswerArea.value == $scope.answerAreas[3].value){
		    		 $scope.answerAreaOnLastPage=true;
		    		 $scope.answerAreaBetweenQuestions=false;
		    		 $scope.answerAreaOnLeftSide=false;
		    	 }
		     }
		     
		     
		 }]);
