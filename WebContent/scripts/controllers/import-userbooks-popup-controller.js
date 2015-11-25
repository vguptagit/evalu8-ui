angular.module('e8MyTests')
.controller('ImportUserBooksPopUpController',
		['$scope', '$rootScope','$location', '$modal',  'UserBookService',
		 'notify','TestService','UserFolderService','EnumService','$modalInstance',
		 function ($scope, $rootScope,$location, $modal,UserBookService,notify,TestService,UserFolderService,EnumService,$modalInstance) {

			$scope.activeTab = "questionBankImport";
			
		     $scope.showQuestionBankImport = function() {
				  $scope.activeTab = "questionBankImport";
				  $scope.isFileSelected=false;
				  $scope.selectedFileName="";
				  $scope.warningMsg="";
			  }

			  $scope.showTestImport = function() {
				  $scope.activeTab = "testImport";
				  $scope.userBook.books.forEach(function(book) {
					  if (book.isSelected && !book.isImported) {
						 book.isSelected = false;
					 }
				  });
                  $scope.isUserSelectedItem=false;
			  }
			
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
			
			$scope.testPackage;
			
			$scope.upload = function(file) {
				$scope.isFileSelected=false;
				$scope.selectedFileName="";
				$scope.warningMsg="";
				if(file.length>0){
					if(file[0].size> evalu8config.maxSizeForTestPackage){
						$scope.selectedFileName=file[0].name;
						$scope.warningMsg="File is too big to upload. Maximum file size supported is 4MB.";
						return;
					}
					$scope.isFileSelected=true;
					$scope.selectedFileName=file[0].name;	
					$scope.testPackage=file[0];
				}
			}
			
			$scope.importTestPacakge=function(){
				$rootScope.blockPage.start();
				UserFolderService.testRootFolder(function(myTestRoot){
					TestService.uploadTestPackage($scope.testPackage,myTestRoot.guid,function(response,status){
						$rootScope.blockPage.stop();
						if(status==EnumService.HttpStatus.BADREQUEST){
							$scope.warningMsg="Import unsuccessfull. Please check your Test package format and try again";		
						}else if(status==EnumService.HttpStatus.SUCCESS){
							$modalInstance.dismiss('cancel');
							$rootScope.$broadcast("ImportUserBooks");  
							$scope.$close();
						}else if(status==EnumService.HttpStatus.NOTFOUND){
							$scope.warningMsg="Bad request";
						}else if(status==EnumService.HttpStatus.CONFLICT){
							$scope.warningMsg=window.e8msg.validation.duplicateTestPackage;
						}else if(status==EnumService.HttpStatus.INTERNALEXCEPTION){
							$scope.warningMsg="Error in importing test";
						}
					});
				});
				
			}
			
		}]);
