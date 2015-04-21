'use strict';

/**
 * @ngdoc function
 * @name makemyvisitApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the makemyvisitApp
 */
angular.module('evalu8Demo')
  .controller('HomeController', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    $scope.dogs = ['Bernese', 'Husky', 'Goldendoodle'];
  });
