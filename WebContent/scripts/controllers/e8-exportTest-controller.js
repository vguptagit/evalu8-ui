angular.module('e8MyTests')
.controller('ExportTestController', 
		['$scope', '$rootScope', '$modalInstance', 'testId', 'UserService','TestService','$modal',
		 function ($scope, $rootScope, $modalInstance, testId, UserService, TestService,$modal) {

    var FileFormats = {
        MSWord: 'doc',
        PDF: 'pdf',
        BlackboardPoolManager: 'pool',
        BlackboardTestManager: 'test',
        BlackboardVista: 'vista',
        QTI: 'qti'
    };
         
    $scope.exportFileFormats = [
                             { value: 'doc', text: 'MS Word' },
                             { value: 'pdf', text: 'PDF' },
                             { value: 'pool', text: 'Blackboard Pool manager' },
                             { value: 'test', text: 'Blackboard Test manager' },
                             { value: 'vista', text: 'Blackboard Vista (WebCT)' },
                             { value: 'qti', text: 'QTI 2.1' }
    ];

    $scope.answerAreas = [
                        { value: 'NONE', isDisabled: false, text: 'None' },	//includeAreaForStudentResponse
                        { value: 'BETWEENQUESTIONS', isDisabled: false, text: 'Between questions' },
                        { value: 'LEFTSIDE', isDisabled: false, text: 'Left side of the page' },//leftSide
                        { value: 'LASTPAGE', isDisabled: true, text: 'Blank last page' },//lastPage
    ];
    
    $scope.answerKeys = [
                        { value: 'NONE', text: 'None' },
                        { value: 'SAMEFILE', text: 'Same file' },
                        { value: 'SEPARATEFILE', text: 'Separate file' },
    ];
    
    $scope.margins = [
                      	 { value: '0.5', text: '.5 inch' },
                         { value: '1.0', text: '1 inch' },
                         { value: '1.5', text: '1.5 inch' },
     ];
    
    $scope.pageNumbers = [
                     { value: 'BOTTOMMIDDLE', text: 'Bottom middle' },
                     { value: 'BOTTOMRIGHT', text: 'Bottom right' },
                     { value: 'TOPRIGHT', text: 'Top right' },
     ];
    
    
    $scope.isSaveSettingsAsDefault = false;
    $scope.disableAnsAreaAndKey = '';

    UserService.userPrintSettings(function(printSettings) {
	
    	$scope.isIncludeRandomizedTest = printSettings.includeRandomizedTests;
    	$scope.isIncludeStudentName = printSettings.includeStudentName;
    	
    	$scope.selectedFormat = $scope.exportFileFormats[0];
    	
    	if(printSettings.exportFileFormat == null) {
    		$scope.selectedFormat = $scope.exportFileFormats[0];
    	} else {
    		$scope.exportFileFormats.forEach(function(format) {
    			if(format.value == printSettings.exportFileFormat) {
    				$scope.selectedFormat = format;
    			}
    		});
    	}
        
    	$scope.selectedAnswerArea = $scope.answerAreas[0];
    	
        if(printSettings.includeAreaForStudentResponse == $scope.answerAreas[0].value)         	
        	$scope.selectedAnswerArea = $scope.answerAreas[0];                	
        if(printSettings.includeAreaForStudentResponse == $scope.answerAreas[1].value)
        	$scope.selectedAnswerArea = $scope.answerAreas[1];
        if(printSettings.includeAreaForStudentResponse == $scope.answerAreas[2].value)
        	$scope.selectedAnswerArea = $scope.answerAreas[2];        
        if(printSettings.includeAreaForStudentResponse == $scope.answerAreas[3].value)
        	$scope.selectedAnswerArea = $scope.answerAreas[3];        	
    
        	
        $scope.selectedAnswerKey = $scope.answerKeys[0];        

    	if(printSettings.includeAnswerKeyIn == $scope.answerKeys[0].value)
    		$scope.selectedAnswerKey = $scope.answerKeys[0];
    	if(printSettings.includeAnswerKeyIn == $scope.answerKeys[1].value) 
    		$scope.selectedAnswerKey = $scope.answerKeys[1];
    	if(printSettings.includeAnswerKeyIn == $scope.answerKeys[2].value) 
    		$scope.selectedAnswerKey = $scope.answerKeys[2];
    	
    	$scope.selectedMargin = $scope.margins[1];
    	
    	if(printSettings.topMargin == $scope.margins[0].value)
    		$scope.selectedMargin = $scope.margins[0];
    	if(printSettings.topMargin == $scope.margins[1].value) 
    		$scope.selectedMargin = $scope.margins[1];
    	if(printSettings.topMargin == $scope.margins[2].value) 
    		$scope.selectedMargin = $scope.margins[2];
    	
    	$scope.selectedPageNumber = $scope.pageNumbers[0];
    	
    	if(printSettings.pageNumberDisplay == $scope.pageNumbers[0].value)
    		$scope.selectedPageNumber = $scope.pageNumbers[0];
    	if(printSettings.pageNumberDisplay == $scope.pageNumbers[1].value) 
    		$scope.selectedPageNumber = $scope.pageNumbers[1];
    	if(printSettings.pageNumberDisplay == $scope.pageNumbers[2].value) 
    		$scope.selectedPageNumber = $scope.pageNumbers[2];
    	
       
        $scope.format_change();
        
    })
    
    //$scope.isError=false;
    //$scope.ErrorMessage='';

    $scope.onclick_exportTest = function () {

    	if($scope.isIncludeRandomizedTest){
    		var format="zip";
    		var fileExtention=".zip";
    	}else{
    		if ($scope.selectedFormat.value == FileFormats.MSWord){
    	        var format = "msword";
    			var fileExtention=".doc"; 
    	
    		}
            else if ($scope.selectedFormat.value == FileFormats.PDF){
            	var format = "pdf";
            	var fileExtention=".pdf";
            }
                	
    	}
    		
        
        var apiUrl = evalu8config.apiUrl + "/tests/" + testId + "/download/" + $scope.selectedFormat.value 
        	+ "?answerKey=" + $scope.selectedAnswerKey.value + "&answerArea=" + $scope.selectedAnswerArea.value 
        	+ "&includeRandomizedTests=" + $scope.isIncludeRandomizedTest + "&includeStudentName=" + $scope.isIncludeStudentName
        	+ "&saveSettings=" + $scope.isSaveSettingsAsDefault+"&margin="+$scope.selectedMargin.value+"&pageNumberDisplay="+$scope.selectedPageNumber.value;
        
        TestService.getMetadata(testId,function(result){
         	download(result.title,fileExtention,format, apiUrl);
         });
    }

    $scope.format_change = function () {
        if ($scope.selectedFormat.value == FileFormats.MSWord || $scope.selectedFormat.value == FileFormats.PDF) {
            $scope.disableAnsAreaAndKey = '';
            return false;
        }
        $scope.disableAnsAreaAndKey = 'disabled';
    }
    
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
    
    //TODO : need to implement using $get
    function download(title,fileExtention,format, apiUrl, isSameFile) {
    	if(isSameFile || $scope.selectedAnswerKey.value != "SEPARATEFILE" || $scope.isIncludeRandomizedTest)
    		var filename=title+fileExtention;	
    	else 
    		var filename=title+"_AnswerKeys"+fileExtention;
    	
        var xhr = new XMLHttpRequest;
        xhr.addEventListener("load", function () {
        	
            if (this.status === 417) {
            	$scope.alert();
               return false;
            }
            
            if (this.status === 500) {
                return false;
            }
            
            var data = toBinaryString(this.responseText);
            var element = angular.element('<a/>');
            element.attr({
                href: "data:application/" + format + ";base64," + btoa(data),
                target: '_blank',
                download: filename
            })[0].click();
            
            if (!isSameFile && $scope.selectedAnswerKey.value == $scope.answerKeys[2].value && !$scope.isIncludeRandomizedTest) {
                var apiUrl = evalu8config.apiUrl + "/tests/" + testId + "/download/" + $scope.selectedFormat.value 
                	+ "?answerKey=" + $scope.answerKeys[0].value + "&answerArea=" + $scope.selectedAnswerArea.value
                	+ "&includeRandomizedTests=" + $scope.isIncludeRandomizedTest + "&includeStudentName=" + $scope.isIncludeStudentName 
                	+ "&saveSettings=false&margin="+$scope.selectedMargin.value+"&pageNumberDisplay="+$scope.selectedPageNumber.value;
                
                
               download(title,fileExtention,format, apiUrl,true);	
                 
            }
        }, false);

        xhr.overrideMimeType("application/" + format + "; charset=x-user-defined;");
        xhr.open("GET", apiUrl);
        xhr.setRequestHeader("x-authorization", $rootScope.globals.authToken);
        xhr.send(null);
        $modalInstance.dismiss('cancel');
    }

    function toBinaryString(data) {
        var ret = [];
        var len = data.length;
        var byte;
        for (var i = 0; i < len; i++) {
            byte = (data.charCodeAt(i) & 0xFF) >>> 0;
            ret.push(String.fromCharCode(byte));
        }
        return ret.join('');
    }
    
    $scope.message="There are no versions for this test.Please uncheck 'Include randomized test' option to export test."
    $scope.alert = function (size) {
        $modal.open({
            templateUrl: 'views/partials/alert.html',
            controller: 'AlertMessageController',
            size: size,
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
