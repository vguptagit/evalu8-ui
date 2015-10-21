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
    
    /**
     * When any of the ckeditor is in focus and try to do any functionality which shows
     * alert message, we should get the focus out of ckeditor. Since providing focus to
     * some element doesn't work for content editable div, we are removing the contenteditable
     * attribute. Once the use clicks on the ok or cancel button, contenteditable attribute will
     * added again.
     */
    var focusedEditor;
    (function(){
		for(var name in window.CKEDITOR.instances){
			if(window.CKEDITOR.instances[name].focusManager.hasFocus){
				focusedEditor = window.CKEDITOR.instances[name].element.$;
				$(focusedEditor).removeAttr("contenteditable");
				break;
			}
		}
    })();

    $scope.isIEDownload=false;
       if(parentScope.testDownloadLink || parentScope.answerKeyDownloadLink){
       	$scope.isIEDownload=true;	
        $scope.testDownloadLink=parentScope.testDownloadLink;
        $scope.answerKeyDownloadLink=parentScope.answerKeyDownloadLink;
       }
    $scope.Ok = function () {    	
    	$(focusedEditor).attr("contenteditable","true");
    	$modalInstance.close(true);    
    };
    
    $scope.cancel = function () {
    	$(focusedEditor).attr("contenteditable","true");
    	$modalInstance.close(false);
      //$modalInstance.dismiss('cancel');      
    };
    
});