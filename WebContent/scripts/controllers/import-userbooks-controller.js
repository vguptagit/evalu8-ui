angular
.module('e8MyTests')
.controller(
		'ImportUserBooksController',
		[
		 '$scope','UserBookService'	,
		 function($scope,UserBookService) {

			 $scope.selectedAllUserBooks = false;			 

			 UserBookService
			 .getUserBooks(function(userBooks) {
				 if (userBooks.length == 0) {
					 var book = {};
					 book.title = "There are no Instructor Books available for Import";
					 book.emptyRecords = true;
					 userBooks.push(book);
				 }
				 $scope.$parent.userBook.books = userBooks;
				 $scope.userBooks = $scope.$parent.userBook.books;

			 });

			 $scope.selectUserBook = function(bookid, bookTitle) {

				 $scope.isUserSelectedBook = false;

				 $scope.userBooks.forEach(function(book) {
					 if (book.guid == bookid) {
						 book.isSelected = book.isSelected ? !book.isSelected
								 : true;
					 }

					 if (book.isSelected == true) {
						 $scope.isUserSelectedBook = true;
					 }
				 });
			 }

			 $scope.checkAllUserBook = function(bookid) {
				 $scope.selectedAllUserBooks = !$scope.selectedAllUserBooks;
				 $scope.$parent.isUserSelectedBook = $scope.selectedAllUserBooks;
				 $scope.userBooks
				 .forEach(function(book) {
					 book.isSelected = $scope.selectedAllUserBooks;
				 });
			 }

		 } ]);