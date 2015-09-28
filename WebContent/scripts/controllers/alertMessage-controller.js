angular.module('e8MyTests').controller('AlertMessageController', 
		function ($scope, $rootScope, $modalInstance, parentScope) {
	
    $scope.message=parentScope.message;
    $scope.IsConfirmation=parentScope.IsConfirmation;
    if(parentScope.isAdvancedSearchClicked){
    	if(parentScope.isSimpleSearchClicked){
            parentScope.isSimpleSearchClicked=false;
    	}
    	parentScope.isAdvancedSearchClicked=false;
    }else if(parentScope.isTestDeleteClicked){
    	parentScope.isTestDeleteClicked=false;
    }else if(parentScope.isFolderDeleteClicked){
        parentScope.isFolderDeleteClicked=false;
    }else if(parentScope.isSimpleSearchClicked){
        parentScope.isSimpleSearchClicked=false;
    }else if(parentScope.isDeleteAnswerClicked){
        parentScope.isDeleteAnswerClicked=false;
    }else if(parentScope.isAddFolderClicked){
        parentScope.isAddFolderClicked=false;
    }else {
        parentScope.isBlockQuoteClicked=false;
    }

    $scope.isIEDownload=false;
       if(parentScope.testDownloadLink || parentScope.answerKeyDownloadLink){
       	$scope.isIEDownload=true;	
        $scope.testDownloadLink=parentScope.testDownloadLink;
        $scope.answerKeyDownloadLink=parentScope.answerKeyDownloadLink;
       }
    $scope.Ok = function () {    	
    	$modalInstance.close(true);    
    };
    
    $scope.cancel = function () {
    	$modalInstance.close(false);
      //$modalInstance.dismiss('cancel');      
    };
    
});