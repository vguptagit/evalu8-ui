'use strict';

angular

		.module('e8SelectDisciplines', [ "checklist-model" ])

		.controller(
				'SelectDisciplinesController',
				[
						'$scope',
						'$rootScope',
						'$location',
						'$routeParams',
						'$http',
						'UserService',
						'DisciplineService',
						function($scope, $rootScope, $location, $routeParams,
								$http, UserService, DisciplineService) {

							$scope.searched = undefined;
							$scope.disciplines = {
								all : [],
								userSelected : []
							};

							$scope.disciplines.all = DisciplineService
									.allDisciplines();

							UserService
									.userDisciplines(function(userDisciplines) {
										$scope.disciplines.userSelected = userDisciplines;
									});

							$scope.saveDiscpline = function() {
								UserService
										.saveUserDisciplines($scope.disciplines.userSelected);
								$location.path('/questionBanks');
							};

							$scope.selectDiscipline = function(discipline) {
								$scope
										.addToselectedDiscipline(discipline.discipline.item)
							}

							$scope.addToselectedDiscipline = function(
									disciplineName) {
								var index = $scope.disciplines.userSelected
										.indexOf(disciplineName);
								if (index > -1) {
									$scope.disciplines.userSelected.splice(
											index, 1);
								} else {

									if ($scope
											.validateDiscipline(disciplineName)) {
										$scope.disciplines.userSelected
												.push(disciplineName);
									}

								}
							}

							$scope.isSelectedDiscipline = function(discipline) {
								var index = $scope.disciplines.userSelected
										.indexOf(discipline.discipline.item);
								if (index < 0)
									return false;
								else
									return true;
							}

							$scope.searchedDisciplineOnClick = function() {
								if ($scope.searched == undefined
										|| $scope.searched == "") {
									return false;

								}
								$scope.addToselectedDiscipline($scope.searched);
							}

							$scope.searchedDiscipline = function(event) {
								if ($scope.searched == undefined
										|| $scope.searched == "") {
									return false;

								}
								if (event.keyCode === 13) {
									$scope
											.addToselectedDiscipline($scope.searched);
								}
							}

							$scope.validateDiscipline = function(disciplineName) {
								var isDesciplineExists = false;
								$scope.disciplines.all.forEach(function(
										discipline) {
									if (discipline.item == disciplineName) {
										isDesciplineExists = true;
									}
								});
								return isDesciplineExists;

							}

						} ]);