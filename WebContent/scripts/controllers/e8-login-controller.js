'use strict';
 
angular.module('e8Login')
 
.controller('LoginController',
    ['$scope', '$rootScope', '$location', 'AuthenticationService', 'SharedTabService',
    function ($scope, $rootScope, $location, AuthenticationService,SharedTabService) {
        // reset login status
        AuthenticationService.ClearCredentials();
        SharedTabService.clear();
        $scope.login = function () {
            $scope.dataLoading = true;
            AuthenticationService.Login($scope.username, $scope.password, function(response) {
                if(response.success) {       
                	
                    AuthenticationService.SetCredentials($scope.username, $scope.password, response.token, response.loginCount);
                    $location.path(evalu8config.welcome);
                } else {
                    $scope.error = response.message;
                    $scope.dataLoading = false;
                    $location.path('/login');
                }
            });
        };
        
        $scope.loginTestGen = function () {
            $scope.dataLoading = true;
            AuthenticationService.Login($scope.username, $scope.password, function(response) {
                if(response.success) {                	
                    
                	AuthenticationService.SetCredentials($scope.username, $scope.password, response.token, response.loginCount);
                    $location.path(evalu8config.welcome);
                } else {
                    $scope.error = response.message;
                    $scope.dataLoading = false;
                    $location.path('/login');
                }
            });
        };
        
    }]);