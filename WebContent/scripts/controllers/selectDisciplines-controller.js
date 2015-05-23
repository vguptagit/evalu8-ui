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
							$scope.trackEnterKey = 0;
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
										.addToselectedDiscipline(discipline.discipline)
							}

							$scope.addToselectedDiscipline = function(
									disciplineName) {
								var index = $scope.disciplines.userSelected
										.indexOf(disciplineName);
								if (index > -1) {
									$scope.disciplines.userSelected.splice(
											index, 1);
									$scope.setScroll(disciplineName);
								} else {

									if ($scope
											.validateDiscipline(disciplineName)) {
										$scope.disciplines.userSelected
												.push(disciplineName);
										$scope.setScroll(disciplineName);
									}

								}
							}

							$scope.setScroll = function(disciplineName) {
								var vtop = $(".disciplineContainer").find(
										"div:contains('" + disciplineName
												+ "')").position().top;
								if (vtop > $(".disciplineContainer")[0].clientHeight
										|| vtop < 0) {
									$(".disciplineContainer")[0].scrollTop = vtop;
								}
							}

							$scope.isSelectedDiscipline = function(discipline) {
								var index = $scope.disciplines.userSelected
										.indexOf(discipline.discipline);
								if (index < 0) {
									return false;
								} else {
									return true;
								}
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
									$(".disciplineContainer")[0].scrollTop = 0;
									return false;

								}

								if (event.keyCode === 13) {
									if ($scope.trackEnterKey > 0) {
										$scope
												.addToselectedDiscipline($scope.searched);
									} else {
										$scope.trackEnterKey = 1
									}

								} else {
									$scope.trackEnterKey = 0
								}
							}

							$scope.validateDiscipline = function(disciplineName) {
								var isDesciplineExists = false;
								$scope.disciplines.all.forEach(function(
										discipline) {
									if (discipline == disciplineName) {
										isDesciplineExists = true;
									}
								});
								return isDesciplineExists;

							}

							$scope.isDesciplineEmpty = function() {
								if ($scope.disciplines.userSelected.length > 0)
									return false;
								else
									return true;

							}

						} ]);