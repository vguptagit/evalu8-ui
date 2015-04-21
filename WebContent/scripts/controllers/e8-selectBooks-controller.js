'use strict';

angular

.module('e8SelectBooks', ["checklist-model"])

.controller(
		'SelectBooksController',
		[
		 '$scope','$rootScope','$location','$routeParams','$http',
		 'DisciplineService','BookService','UserService',
		 function($scope, $rootScope, $location, $routeParams, $http, 
				 DisciplineService, BookService, UserService) {

			 var config = {
					 headers : {
						 'x-authorization' : $rootScope.globals.authToken,
						 'content-type' : 'application/json'
					 }
			 };	
			 
		    	//Fetch user disciplines and populate the drop down			
			 $http.get(evalu8config.host + '/settings/disciplines', config)
			 .success(function(response) {
				 
				 $scope.userDisciplines = response;		
				 $scope.getBooks($scope.userDisciplines[0]);
				 $scope.selectedValue = $scope.userDisciplines[0];
			 })	
				
			 UserService.userBookIDs(function(userBookIDs){
				 $scope.userBookIDs = userBookIDs;
			 });
			 

			 $scope.disciplineFilterChange = function(option) {

				 $scope.getBooks(option);	    			
			 }
		    	
			 //To get books for the given discipline.
			 $scope.getBooks = function(discipline){
				 
				 $scope.booksSelected = [];
				 $scope.disciplineBooks = null;
				 
				 BookService.disciplineBooks(discipline, function(disciplineBooks) {
					 
					 $scope.disciplineBooks = disciplineBooks;
					 /*
					 disciplineBooks.forEach( function(item) {
						 if($scope.userBookIDs.indexOf(item.id) > -1) {
							 $scope.booksSelected.push (item.id);
						 }
					 });*/
				 });
				 
			 }		
		 

			 $scope.savePref = function() {								 
				 
				 UserService.saveUserBooks($scope.userBookIDs);

			 };
		 } ]);