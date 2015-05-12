'use strict';

angular.module('evalu8Demo')
  .controller('UserSettingsController', ['$scope', '$rootScope', '$modalInstance', '$modal', 'UserService', 'BookService',
     function ($scope, $rootScope, $modalInstance, $modal, UserService, BookService) {

	  $scope.activeTab = "questionBanks";
	  
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
		 
		  $scope.disciplines = userDisciplines;		  	  		  
	  });
	  
	  BookService.userBooks(function(response) {
		  $scope.userBooks= response;
	  })
	  	  
	  //$scope.metadatas = ['Difficulty', 'Topic', 'Objective', 'Page reference', 'Skill', 'Question id (provided by Evalu8)'];
	  		
		 
	 $scope.questionMetadata = {
			 all: [
                   'Difficulty', 'Topic', 'Objective',                    
                   'Page Reference', 'Skill', 'Question ID'
                   ],
              userSelected: []     
	 };		
	 
	 UserService.userQuestionMetadata(function(userQuestionMetadata){
		 $scope.questionMetadata.userSelected = userQuestionMetadata;
	 });
	 
	 $scope.savePref = function() {								 
		 
		 UserService.saveUserQuestionMetadata($scope.questionMetadata.userSelected);	
	 };
	 
	  $scope.edit = function(step) {
		  var modalInstance = $modal.open({
				templateUrl : 'views/usersettings/usersettingsWizard.html',
				controller : 'usersettingsWizardController',
				size : 'md',
				backdrop : 'static',
				keyboard : false,
				scope: $scope,
				resolve: {
			         step: function () {
			           return step;
			         }
			       }
			});			
	  }
	  
  }]);