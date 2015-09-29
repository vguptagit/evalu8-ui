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
		     $scope.isIncludeStudentName=false;
		     
		     $scope.cancel = function () {
		         parentScope.tests[parentScope.currentIndex].isBtnClicked = false;
		         $modalInstance.dismiss('cancel');
		     };
		     $scope.printTest = function () {
		         parentScope.tests[parentScope.currentIndex].isBtnClicked = false;
		         var elementToPrint=$('.testPreviewContainer').clone();
		         $(elementToPrint).find(".printViewLinks").remove();
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
		         
		         if(!$scope.isIncludeStudentName)
		        	 $(elementToPrint).find("#includeStudentName").remove();
		        	 
		         $(elementToPrint).print();
		     };
		     
		     $scope.selectedAnswerArea = $scope.answerAreas[0];
		     
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
