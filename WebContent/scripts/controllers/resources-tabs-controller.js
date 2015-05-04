'use strict';

angular.module('evalu8Demo')
  .controller('ResourcesTabsController', ['$scope', '$rootScope', function ($scope, $rootScope) {

      $scope.resourcesTabs = [
		                      { active: false, text: 'Your Tests', path: '.yourtests' },
                              { active: false, text: 'Question Banks', path: '.questionbanks' },
                              { active: false, text: 'Custom Questions', path: '.customquestions' }
      ];

      $scope.$on('handleBroadcast_setActiveResourcesTab', function (handler, view) {
          for (var i = 0; i < $scope.resourcesTabs.length; i++) {
              if ($scope.resourcesTabs[i].path == view) {
                  $scope.resourcesTabs[i].active = true;
              } else {
                  $scope.resourcesTabs[i].active = false;
              }
          }
      });

  }]);
