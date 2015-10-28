angular.module('e8MyTests')
.controller('ExportTestController', 
		['$scope', '$rootScope', '$modalInstance', 'parentScope', 'UserService','TestService','$modal',
		 function ($scope, $rootScope, $modalInstance, parentScope, UserService, TestService,$modal) {
			
	parentScope.tests[parentScope.currentIndex].isBtnClicked=false;
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
                             { value: 'bbpm', text: 'Blackboard Pool manager' },
                             { value: 'bbtm', text: 'Blackboard Test manager' },
                             { value: 'qti21', text: 'QTI 2.1' }
                             
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
                      	 { value: '0.5', text: '0.5 inch' },
                         { value: '1.0', text: '1 inch' },
                         { value: '1.5', text: '1.5 inch' },
     ];
    
    $scope.pageNumbers = [
                     { value: 'BOTTOMMIDDLE', text: 'Bottom middle' },
                     { value: 'BOTTOMRIGHT', text: 'Bottom right' },
                     { value: 'TOPRIGHT', text: 'Top right' },
     ];
    
    
    $scope.isSaveSettingsAsDefault = false;
    $scope.testDownloadLink="";
	$scope.answerKeyDownloadLink="";
	$scope.showMSWordSetting=true;

    $scope.showWaiting=true;
    UserService.userPrintSettings(function(printSettings) {
    	$scope.isIncludeRandomizedTest = printSettings.includeRandomizedTests;
    	$scope.isIncludeStudentName = printSettings.includeStudentName;
    	
    	$scope.selectedFormat = $scope.exportFileFormats[0];
    	if(printSettings.exportFileFormat==$scope.exportFileFormats[2] ||
    			printSettings.exportFileFormat==$scope.exportFileFormats[3] ||
    			printSettings.exportFileFormat==$scope.exportFileFormats[4]){
    		 $scope.showMSWordSetting=false;
    	}
    	
    	
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
    	
    	$scope.showWaiting=false;
    	$scope.format_change();
    })

    $scope.format_change = function () {
        if ($scope.selectedFormat.value == FileFormats.MSWord || $scope.selectedFormat.value == FileFormats.PDF) {
            $scope.showMSWordSetting=true;
            return false;
        }
        $scope.showMSWordSetting=false;
    }
    
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
    
    //TODO : need to implement using $get
    $scope.onclick_exportTest = function () {
    	var isSeperateFileSelected = false;
    	 if($scope.selectedAnswerKey.value == $scope.answerKeys[2].value && ($scope.selectedFormat.value == FileFormats.MSWord || $scope.selectedFormat.value == FileFormats.PDF) && !$scope.isIncludeRandomizedTest){
			downloadFile($scope.answerKeys[0].value, false, isSeperateFileSelected);
			isSeperateFileSelected= true;
		}
		downloadFile($scope.selectedAnswerKey.value,$scope.isSaveSettingsAsDefault,isSeperateFileSelected)
		$modalInstance.dismiss('cancel');
    }
    
    function downloadFile(answerKeyPreference, saveSettingsPreference, isSeperateFileSelected){
    	var apiUrl = evalu8config.apiUrl + "/tests/"
		+ parentScope.tests[parentScope.currentIndex].testId + "/download/"
		+ $scope.selectedFormat.value
		
		var data = "answerKey="
			+ answerKeyPreference
			+ "$answerArea="
			+ $scope.selectedAnswerArea.value
			+ "$includeRandomizedTests="
			+ $scope.isIncludeRandomizedTest
			+ "$includeStudentName="
			+ $scope.isIncludeStudentName
			+ "$saveSettings="
			+ saveSettingsPreference
			+ "$margin="
			+ $scope.selectedMargin.value
			+ "$pageNumberDisplay="
			+ $scope.selectedPageNumber.value
			+ "$AT=" + $rootScope.globals.authToken;
	
			data = btoa(data);
			
			var ua = window.navigator.userAgent;
			var msie = ua.indexOf("Trident/");

			if(msie>-1 && $scope.selectedAnswerKey.value == $scope.answerKeys[2].value){
				if(!isSeperateFileSelected)
					$scope.testDownloadLink= apiUrl + "?data=" + data
					else{
						$scope.answerKeyDownloadLink=apiUrl + "?data=" + data
						$scope.message="Multiple file download is not supported in IE browser. Click below links to download Test and Answer key files"
							$scope.alert();
					}
			        }else{
			        	if($("iframe#dnloadFrame").length > 0 && isSeperateFileSelected == false){
			        		$("iframe#dnloadFrame").remove();
			        	}
			        	var frm = $("<iframe>").attr("src",
			        			apiUrl + "?data=" + data).appendTo(
			        			"body").load(function() {
			        				if(this.contentDocument.body.innerHTML.indexOf("No versions are there for this test") >= 0){
			        					$scope.message="There are no versions for this test.Please uncheck 'Include randomized test' option to export test."
			        						$scope.alert();
			        				}
			        			});
			        	frm.attr("id","dnloadFrame");
			        }
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
