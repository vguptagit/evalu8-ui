angular.module('e8MyTests')
.controller('ImportUserBooksPopUpController',
		['$scope', '$rootScope','$location', '$modal',  'UserBookService',
		 'notify',
		 function ($scope, $rootScope,$location, $modal,UserBookService,
				 notify) {

			$scope.userBook = {	books:[] };

			$scope.isUserSelectedBook = false;

			$scope.cancel = function () {
				$scope.$close();						   
			};

			$scope.importUserBooks = function() {		
				var selectedUserBook = [];
				$.grep($scope.userBook.books, function(book) {
					if (book.isSelected && !book.isImported) {								
						delete book.isSelected;
						selectedUserBook.push(book.guid);
					}
				});	

				UserBookService.importUserBooks(selectedUserBook,function(status) {	
					if(status){
                        $rootScope.$broadcast("ImportUserBooks");    
                        $scope.$close();	
					}else {										
						$scope.showErrorMessage();
					}									
				});		
			}

			$scope.showErrorMessage = function(){
				var msg = e8msg.error.importUserBooks;
				var messageTemplate ='<p class="alert-danger"><span class="glyphicon glyphicon-alert"></span><span class="warnMessage">' + msg  + '</p> ';
				$scope.positions = ['center', 'left', 'right'];
				$scope.position = $scope.positions[0];
				notify({
					messageTemplate: messageTemplate,						                
					classes: 'alert alert-danger',	
					position: $scope.position,
					duration: '1500'
				});
			};				


		}]);
