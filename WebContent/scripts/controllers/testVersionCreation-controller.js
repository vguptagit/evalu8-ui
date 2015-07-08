angular.module('e8MyTests')

.controller('TestVersionCreationController', 
		['$scope', '$rootScope', '$modalInstance', 'parentScope', 'UserService','SharedTabService','TestService','$modal',
		 function ($scope, $rootScope, $modalInstance, parentScope, UserService, TestService, SharedTabService,$modal) {
			
			parentScope.tests[parentScope.currentIndex].isTabClicked=false;
			$scope.sharedTabService = SharedTabService;
			 $scope.cancel = function () {
		            $modalInstance.dismiss('cancel');
		        }; 
		        	
		        $scope.versions= [
		                    		         { number: 1, text: '1 Version' },
		                                     { number: 2, text: '2 Versions' },
		                                     { number: 3, text: '3 Versions' },
		                                     { number: 4, text: '4 Versions' },
		                                     { number: 5, text: '5 Versions' },
		                                     { number: 6, text: '6 Versions' },
		                                     { number: 7, text: '7 Versions' },
		                                     { number: 8, text: '8 Versions' },
		                                     { number: 9, text: '9 Versions' },
		                                     { number: 10, text: '10 Versions' },
		                    		     ];
		        //$scope.versions = SharedTabService.versions;
		        $scope.isQuestions = true;
		        $scope.isAnswers = true;

		        $scope.isViewVersions = true;

		        $scope.selectedVersions = $scope.versions[1];
		        $scope.noOfVersions = $scope.versions[1].number;
		        $scope.selectVersion = function (version) {
		            $scope.noOfVersions = version.number;
		        };
		        
		        $scope.createNewVersion = function () {
		        	
		        	var isValid=	parentScope.createNewVersion($scope);
			        if(isValid){
			        	$modalInstance.dismiss('cancel');
			        }	
		       }
		
		}]);