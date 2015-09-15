'use strict';

angular.module('evalu8Demo')

.service('TestService', 
		['$http', '$rootScope', '$location', '$cookieStore', '$upload','blockUI',
		 function($http, $rootScope, $location, $cookieStore,$upload,blockUI) {
			
			$rootScope.globals = JSON.parse(sessionStorage.getItem('globals'));
			 
			var config = {
					headers : {
						'x-authorization' : $rootScope.globals.authToken,
						'Accept' : 'application/json;odata=verbose'
					}
			};						
			
			this.saveTestData = function(testData,folderId,callback) {				
				var testResult = null;
				delete testData.metadata.showEditIcon;
				delete testData.metadata.showArchiveIcon;
				delete testData.metadata.draggable;
				delete testData.metadata.folderGuid;
				delete testData.metadata.nodeType;
				delete testData.metadata.selectTestNode;

				$http.post(evalu8config.apiUrl + '/my/folders/'+folderId+'/tests', testData, config)
				.success(function(response) {	
					var testResult = response;
					callback(testResult);
				})
				.error(function(error, status) {
					callback(testResult);
				})				
			};
			
            this.saveQuestions = function(editedQstns, callback) {
            	var questionsResult = null;
                $http.post(evalu8config.apiUrl + '/my/questions', editedQstns, config)
                .success(function(response) {    
                    questionsResult = response;
                    callback(questionsResult);                     
                })
                .error(function(error, status) {
                	callback(questionsResult);
                })                
                
            };
			
	        var confirmObject = {
	                templateUrl: 'views/partials/alert.html',
	                controller: 'AlertMessageController',
	                backdrop: 'static',
	                keyboard: false,
	                resolve: {
	                    parentScope: function () {
	                        return $rootScope;
	                    }
	                }
	            };
				
			this.getTests = function(folderId, callback) {				
				var url = evalu8config.apiUrl + '/my/folders/' + folderId + '/tests';
				
				var tests = [];
				
				$http.get(url, config)
				.success(function(response) {

					response.forEach(function(test){
						test.nodeType = "test";
						test.draggable = true;
						test.droppable = false;
						test.parentId = folderId;
						test.showEditIcon=true;
						test.showArchiveIcon=true;
						
						tests.push(test);
					})
					callback(tests);
				})
				.error(function(error, status) {

					callback(null);
				})
			};
			
			this.getArchiveTests = function(folderId, callback) {				
				$http.get(evalu8config.apiUrl + '/my/archive/folders/' + folderId + '/tests', config)
				.success(function(response) {
					var tests = response;
					tests.forEach(function(test){
						test.nodeType = "archiveTest";
						test.draggable = false;
						test.droppable = false;
						test.parentId = folderId;
					})
					callback(tests)
				})
				.error(function(error, status) {
					callback(null);
				})				
			};
			
            this.getTest = function(testId, callback) {                

                $http.get(evalu8config.apiUrl + '/tests/' + testId, config)
                .success(function(response) {
                    var test = response;
                    callback(test)
                })
                .error(function(error, status) {

                })                
            };

			this.getTestQuestions = function(testId, callback) {				
				var questions=[];
				$http.get(evalu8config.apiUrl + '/test/' + testId + '/questions', config)
				.success(function(response) {
					questions = response;
					callback(questions)
				})
				.error(function(error, status) {
					callback(null);

				})				
			};
			
			this.getPublisherTestsByBookId = function(bookId, callback) {
				$http.get(evalu8config.apiUrl + '/books/' + bookId + '/tests', config)
				.success(function(response) {
					if(response == null) response = [];
					callback(response)
				})
				.error(function(error, status) {
					callback(null);

				})
			}
			
			this.getQuestionById = function(questionGuid, callback) {
				var url=evalu8config.apiUrl + '/questions/' + questionGuid
				this.getQuestion(url,callback);
			};
			
			this.getQuestion = function(questionUrl, callback) {				
				$http.get(questionUrl, config)
				.success(function(response) {
					var question = response;
					callback(question)
					
				})
				.error(function(error, status) {
					
				})				
			};
			

			//Building the meta data of a test,these meta data properties are required for PAF.
			this.getTestMetadata = function (testNode) {
				 var metadata = {				
							guid: testNode.guid,
							modified: testNode.modified,
							title: testNode.title,
							version: testNode.version,
							versionOf: testNode.versionOf,
							extendedMetadata: testNode.extendedMetadata
					};
				 return metadata;
			}
						
			this.createVersions = function (scope, callback) {	
			    $http.post(evalu8config.apiUrl + '/my/tests/' + scope.currentTab.testId + '/versions', scope.versioningOptions, config)
				.success(function (response) {				     
				    callback(scope,response);

				})
				.error(function (error, status) {
					callback(null);
				}) 
			};
			
			this.getMetadata = function (testid ,callback) {			 
			    $http.get(evalu8config.apiUrl + '/test/' + testid + '/metadata', config)
				.success(function (response) {				     
				    callback(response);
				})
				.error(function (error, status) {
					callback(null);
				}) 
			};
			
			this.uploadImage = function(file,element,cursorPosition,callback){
				$upload.upload({
                    url: evalu8config.apiUrl + '/image/upload',
                    headers: {
						'x-authorization' : $rootScope.globals.authToken,
						'Accept' : 'application/json;odata=verbose'
					},
                    file: file
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                }).success(function (data, status, headers, config) {

                    callback(data,element,cursorPosition);
                });
			}
		}
			
			
			
])			