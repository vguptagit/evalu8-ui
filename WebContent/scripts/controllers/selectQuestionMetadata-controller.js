'use strict';

angular

.module('e8SelectQuestionMetadata', ["checklist-model"])

.controller(
		'SelectQuestionMetadataController',
		[
		 '$scope','$rootScope','$location','$routeParams','$http',
		 'UserService',
		 function($scope, $rootScope, $location, $routeParams, $http, UserService) {

			 var config = {
					 headers : {
						 'x-authorization' : $rootScope.globals.authToken,
						 'content-type' : 'application/json'
					 }
			 };				 
			 
			 $scope.questionMetadata = {
					 all: [
		                   'Difficulty', 'Topic', 'Objective', 
		                   'Multimedia Link', 'National Standard', 'State Standard',
		                   'Notes', 'Page Reference', 'Skill',
		                   'Question ID', 'Local Standard', 'Keywords',
		                   'Miscellaneous'
		                   ],
		              userSelected: []     
			 };		
			 
			 UserService.userQuestionMetadata(function(userQuestionMetadata){
				 $scope.questionMetadata.userSelected = userQuestionMetadata;
			 });
				 			 

			 $scope.savePref = function() {								 
	 
				 UserService.saveUserQuestionMetadata($scope.questionMetadata.userSelected);	
			 };
		 } ]);