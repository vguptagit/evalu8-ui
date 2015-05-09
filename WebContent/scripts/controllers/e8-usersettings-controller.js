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
	  
	  $scope.books = [];
	  UserService.userDisciplines(function(userDisciplines) {
		 
		  $scope.disciplines = userDisciplines;		  	  		  
	  });
	  
	  BookService.userBooks(function(response) {
		  $scope.books= response;
	  })
	  	  
	  $scope.metadatas = ['Difficulty', 'Topic', 'Objective', 'Page reference', 'Skill', 'Question id (provided by Evalu8)'];
	  
		
	  $scope.edit = function(step) {
		  var modalInstance = $modal.open({
				templateUrl : 'views/usersettings/usersettingsWizard.html',
				controller : 'usersettingsWizardController',
				size : 'md',
				backdrop : 'static',
				keyboard : false,
				resolve: {
			         step: function () {
			           return step;
			         }
			       }
			});
			
		  modalInstance.result.then(function () {
			  UserService.userDisciplines(function(userDisciplines) {
				  //$scope.disciplines = ['Art', 'Law'];
				  $scope.disciplines = userDisciplines;
			  });
		    });
	  }
	  
  }]);