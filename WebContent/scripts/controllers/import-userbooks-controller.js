angular
.module('e8MyTests')
.controller(
		'ImportUserBooksController',
		[
		 '$scope','UserBookService'	,'$filter','CommonService',
		 function($scope,UserBookService,$filter,CommonService) {

			 $scope.selectedAllUserBooks = false;			
			 $scope.disableCheckAllBooks = false;			
			 var totalBookCount=0;
			 var selectedBookCount=0;
						 
			 UserBookService
			 .getUserBooks(function(userBooks) {
				 if(userBooks==null){
					 CommonService.showErrorMessage(e8msg.error.cantFetchBooks)
         			 return;
				 }
				 if (userBooks.length == 0) {
					 var book = {};
					 book.title = "There are no Instructor Books available for Import";
					 book.emptyRecords = true;
					 userBooks.push(book);					 
				 }
				 $scope.$parent.userBook.books = userBooks;
				 $scope.userBooks = $scope.$parent.userBook.books;				 
				 
				 totalBookCount = $filter('filter')($scope.userBooks, {isImported: 'false'}).length;
				 if(totalBookCount==0){
					 $scope.disableCheckAllBooks =true
				 }

			 });

			 $scope.selectUserBook = function(bookid, bookTitle) {

				 $scope.$parent.isUserSelectedItem  = false;
				 selectedBookCount = 0;

				 $scope.userBooks.forEach(function(book) {
					 if (book.guid == bookid ) {
						 book.isSelected = book.isSelected ? !book.isSelected
								 : true;
					 }

					 if (book.isSelected == true && !book.isImported) {
						 $scope.$parent.isUserSelectedItem  = true;
						 selectedBookCount = selectedBookCount + 1;
					 }
				 });
				 
				 if(selectedBookCount==totalBookCount){
					 $scope.selectedAllUserBooks =true;
				 }else{
					 $scope.selectedAllUserBooks =false;
				 }
			 }

			 $scope.checkAllUserBook = function(bookid) {
				 $scope.selectedAllUserBooks = !$scope.selectedAllUserBooks;
				 $scope.$parent.isUserSelectedItem = $scope.selectedAllUserBooks;
				 $scope.userBooks.forEach(function(book) {
					 book.isSelected = $scope.selectedAllUserBooks;
				 });
			 }

		 } ]);