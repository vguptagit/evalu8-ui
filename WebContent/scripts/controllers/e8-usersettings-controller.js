'use strict';

angular.module('evalu8Demo')
  .controller('UserSettingsController', ['$scope', '$rootScope', '$modalInstance', '$modal',
     function ($scope, $rootScope, $modalInstance, $modal) {

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
	  
	  $scope.disciplines = ['Art', 'Law'];
	  
	  $scope.books = [
	                  {'title': 'Algebra 2, 2e (Brown)', 'discipline': 'Art'}, 
	                  {'title': 'Algebra 1, 3e (Smith)', 'discipline': 'Art'},
	                  {'title': 'Numeric 7, 1e (Kej)', 'discipline': 'Law'}
	                  ];
	  
	  $scope.metadatas = ['Difficulty', 'Topic', 'Objective', 'Page reference', 'Skill', 'Question id (provided by Evalu8)'];
	  
		
	  $scope.edit = function(step) {
			$modal
			.open({
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
			})
	  }
	  
  }]);