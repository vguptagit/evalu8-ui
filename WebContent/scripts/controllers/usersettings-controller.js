'use strict';

angular.module('evalu8Demo')
  .controller('UserSettingsController', ['$scope', '$rootScope', '$modalInstance', '$modal', 'UserService', 'BookService','SharedTabService','parentScope','CommonService',
     function ($scope, $rootScope, $modalInstance, $modal, UserService, BookService,SharedTabService,parentScope,CommonService) {
	  $scope.isClicked=false;
	  $scope.activeTab = "questionBanks";
	  parentScope.isSettingsClicked=false;
	  $scope.cancel = function () {
		  $modalInstance.dismiss('cancel');

	  };

	  $scope.showQuestionBank = function() {
		  $scope.activeTab = "questionBanks";
	  }

	  $scope.showMetadata = function() {
		  $scope.activeTab = "metadata";
	  }
	  
	  $scope.userBooks = [];
	  UserService.userDisciplines(function(userDisciplines) {
		  if(userDisciplines==null){
				CommonService.showErrorMessage(e8msg.error.cantFetchDisciplines)
				return;
			}
		  $scope.disciplines = userDisciplines;		  	  		  
	  });
	  
	  BookService.userBooks(function(response) {
		  if(response==null){
				CommonService.showErrorMessage(e8msg.error.cantFetchBooks)
				return;
			}
		  $scope.userBooks= response;
	  })	  	  	  		
		 
	 $scope.questionMetadata = {
			 all: [
                   'Difficulty', 'Topic', 'Objective',                    
                   'PageReference', 'Skill', 'QuestionId'
                   ],
              userSelected: []     
	 };		
	 
	 UserService.userQuestionMetadata(function(userQuestionMetadata){
		 if(userQuestionMetadata==null){
			CommonService.showErrorMessage(e8msg.error.cantFetchMetadata)
 			return;
		}
		 $scope.questionMetadata.userSelected = userQuestionMetadata;
	 });
	 
	 $scope.savePref = function() {								 
		 
		 UserService.saveUserQuestionMetadata($scope.questionMetadata.userSelected, function(success) {
			 if(success) {
				 SharedTabService.userQuestionSettings=$scope.questionMetadata.userSelected;
				 
				 $rootScope.$broadcast("SaveSettings");
				 
				 $modalInstance.close();				 
			 }else{
					CommonService.showErrorMessage(e8msg.error.cantSaveMetadata)
			 }
		 });
	 };
	 
	  $scope.edit = function(step) {
		  $scope.isClicked=true;
		  var modalInstance = $modal.open({
				templateUrl : 'views/usersettings/usersettingsWizard.html',
				controller : 'usersettingsWizardController',
				size : 'md',
				backdrop : 'static',
				keyboard : true,
				scope: $scope,
				resolve: {
					step: function () {
						return step;
					},
					source : function() {
						return "userSettings";
					},
					parentScope : function() {
						return $scope;
					}
				}
			});			
	  }
	  
  }]);