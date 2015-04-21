'use strict';

angular

.module('e8SelectDisciplines', ["checklist-model"])

.controller(
		'SelectDisciplinesController',
		[
		 '$scope','$rootScope','$location','$routeParams','$http',
		 'UserService','DisciplineService',
		 function($scope, $rootScope, $location, $routeParams, $http, 
				 UserService, DisciplineService) {

			 $scope.disciplines = {
					 all: [],
					 userSelected: []      
			 };
			 
			 $scope.disciplines.all = DisciplineService.allDisciplines();		

			 UserService.userDisciplines(function(userDisciplines) {
				 $scope.disciplines.userSelected = userDisciplines;
			 });
			 			 

			 $scope.savePref = function() {								 

				 UserService.saveUserDisciplines($scope.disciplines.userSelected);			 

			 };
		 } ]);