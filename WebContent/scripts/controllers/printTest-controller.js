angular.module('e8MyTests')
.controller('PrintTestController',
		['$scope', '$rootScope', '$modalInstance', 'parentScope', 'UserService', 'TestService', '$modal','$sce',
		 function ($scope, $rootScope, $modalInstance, parentScope, UserService, TestService, $modal, $sce) {

		     /**
		      * In parentScope.sharedTabService.masterTests[parentScope.currentIndex].criterias, there is a property called scope which being set
		      * to $scope. This makes angular.copy to throw exception. Hence, since criterias property is not needed for print functionality,
		      * we are removing the criterias property before cloning. Once it is cloned, we are setting back teh criterias to 
		      * parentScope.sharedTabService.masterTests[parentScope.currentIndex].criterias.
		      */
			(function(parentScope,scope){
				var backUpCriterias = parentScope.sharedTabService.masterTests[parentScope.currentIndex].criterias;
				parentScope.sharedTabService.masterTests[parentScope.currentIndex].criterias = null;
				scope.test = angular.copy(parentScope.sharedTabService.masterTests[parentScope.currentIndex]);
			    parentScope.sharedTabService.masterTests[parentScope.currentIndex].criterias = backUpCriterias;
			    scope.test.title = parentScope.tests[parentScope.currentIndex].tabTitle;
			})(parentScope,$scope)
		     
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
		    	 if($("iframe#testPrint").length > 0){
		    		 var frm = document.getElementById("testPrint").contentWindow;
			         frm.focus();
			         frm.print();	 
		    	 }
		     }
		     
		     $scope.selectedAnswerArea = $scope.answerAreas[0];
		     
		     
		     $scope.loadTestIframe =  function(){
		    	 parentScope.tests[parentScope.currentIndex].isBtnClicked = false;
		    	 setTimeout(function(){
		         var elementToPrint=$('.testPreviewContainer').clone();
		         $(elementToPrint).find(".printViewLinks").remove();
		         $(elementToPrint).find("#Essay").empty();	
		         $(elementToPrint).find("[class$='defaultPrintCorrectAnswer']" ).empty().html("&nbsp;");
		         
		         if ($scope.selectedAnswerArea.value == $scope.answerAreas[0].value){
		        	 $(elementToPrint).find("#answerSpace").remove();
		        	 $(elementToPrint).find("#answerSpaceLastPage" ).remove();
		             $(elementToPrint).find("[ng-show='answerAreaOnLeftSide']").remove();
		             $(elementToPrint).find("[ng-show='answerAreaBetweenQuestions']").remove();
		         }else if($scope.selectedAnswerArea.value == $scope.answerAreas[1].value){
			         $(elementToPrint).find("[ng-show='answerAreaOnLeftSide']").remove();
			         $(elementToPrint).find("#answerSpaceLastPage" ).remove();
		         }else if($scope.selectedAnswerArea.value == $scope.answerAreas[2].value){
		        	 $(elementToPrint).find("#answerSpace").remove();
		        	 $(elementToPrint).find("#answerSpaceLastPage" ).remove();
		        	 $(elementToPrint).find("[ng-show='answerAreaBetweenQuestions']").remove();
		         }else if($scope.selectedAnswerArea.value == $scope.answerAreas[3].value){
		        	 $(elementToPrint).find("#answerSpace").remove();
		             $(elementToPrint).find("[ng-show='answerAreaOnLeftSide']").remove();
		             $(elementToPrint).find("[ng-show='answerAreaBetweenQuestions']").remove();
		         }
		         
		         if(!$scope.isIncludeStudentName)
		        	 $(elementToPrint).find("#includeStudentName").remove();
		         $(elementToPrint).print();
		    	 }, 200);
		     }
		     
		     $scope.$watch('$viewContentLoaded', function(event) {
		    		 $scope.loadTestIframe();
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
		    	 $scope.loadTestIframe();	 
		     }
		     
		     $scope.includeStudentNameChange = function(){
		    	 $scope.loadTestIframe();
		     }
		     
		     $scope.getAnswerBlanks = function(node){
		    	 var AnswerBlanks="";
		    	 if(node.quizType=='ShortAnswer'){
	    		 	var singleAnswerBlank="";
					for(var i=0;i<node.qtiModel.BlankSize;i++){
						singleAnswerBlank=singleAnswerBlank+"_"
					}
					for (var j = 0; j < node.qtiModel.Options.length; j++) {
						if(j==node.qtiModel.Options.length-1){
							AnswerBlanks=AnswerBlanks+String.fromCharCode(97 + j).toUpperCase()+") "+singleAnswerBlank;	
						}else{
							AnswerBlanks=AnswerBlanks+String.fromCharCode(97 + j).toUpperCase()+") "+singleAnswerBlank+' <br/><br/> ';
						}
					} 
		    	 }else{
		    		 AnswerBlanks="__________";
		    	 }
		    	 
					
					return $sce.trustAsHtml(AnswerBlanks);
				}

		 }]);
