'use strict';

angular.module('evalu8Demo')

.service('TestService', 
		['$http', '$rootScope', '$location', '$cookieStore', '$upload','blockUI','HttpService',
		 function($http, $rootScope, $location, $cookieStore,$upload,blockUI,HttpService) {									
			
			this.saveTestData = function(testData,folderId,callback) {				
				var testResult = null;
				delete testData.metadata.showEditIcon;
				delete testData.metadata.showArchiveIcon;
				delete testData.metadata.draggable;
				delete testData.metadata.folderGuid;
				delete testData.metadata.nodeType;
				delete testData.metadata.selectTestNode;

				HttpService.post(evalu8config.apiUrl + '/my/folders/'+folderId+'/tests', testData)
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
                HttpService.post(evalu8config.apiUrl + '/my/questions', editedQstns)
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
				
				HttpService.get(url)
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
			this.getAllTestsOfFolder = function(folderId, callback) {
				
				var url = evalu8config.apiUrl + "/my/folders/"+ folderId + "/tests?flat=1";
				var tests = [];
				HttpService.get(url)
				.success(function(response) {
					response.forEach(function(test){
						tests.push(test);
					})
					callback(tests);
				}).error(function(error, status) {

					callback(null);
				})
			};
			
			
			this.getArchiveTests = function(folderId, callback) {	
				var tests = [];
				
				HttpService.get(evalu8config.apiUrl + '/my/archive/folders/' + folderId + '/tests')
				.success(function(response) {

					response.forEach(function(test){
						test.nodeType = "archiveTest";
						test.draggable = false;
						test.droppable = false;
						test.parentId = folderId;
						
						tests.push(test);
					})
					callback(tests)
				})
				.error(function(error, status) {
					callback(null);
				})				
			};
			
            this.getTest = function(testId, callback) {                

                HttpService.get(evalu8config.apiUrl + '/tests/' + testId)
                .success(function(response) {
                    var test = response;
                    callback(test)
                })
                .error(function(error, status) {
                	callback(null);
                })                
            };

			this.getTestQuestions = function(testId, callback) {				
				var questions=[];
				HttpService.get(evalu8config.apiUrl + '/test/' + testId + '/questions')
				.success(function(response) {
					questions = response;
					callback(questions)
				})
				.error(function(error, status) {
					callback(null);

				})				
			};
			
			this.getPublisherTestsByBookId = function(bookId, callback) {
				HttpService.get(evalu8config.apiUrl + '/books/' + bookId + '/tests')
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
				HttpService.get(questionUrl)
				.success(function(response) {
					var question = response;
					callback(question)
					
				})
				.error(function(error, status) {
					callback(null);
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
			    HttpService.post(evalu8config.apiUrl + '/my/tests/' + scope.currentTab.testId + '/versions', scope.versioningOptions)
				.success(function (response) {				     
				    callback(scope,response);

				})
				.error(function (error, status) {
					callback(null);
				}) 
			};
			
			this.getMetadata = function (testid ,callback) {			 
			    HttpService.get(evalu8config.apiUrl + '/test/' + testid + '/metadata')
				.success(function (response) {				     
				    callback(response);
				})
				.error(function (error, status) {
					callback(null);
				}) 
			};
			
			this.uploadImage = function(file,element,cursorPosition,callback){
				 HttpService.upload( evalu8config.apiUrl + '/image/upload', file)
				 .progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                }).success(function (data, status, headers, config) {

                    callback(data,element,cursorPosition);
                })
                .error(function(){
                	callback(null);
                });
			}
			
			this.uploadTestPackage=function(file,folderID,callback){
				HttpService.upload(evalu8config.apiUrl + '/my/folders/'+folderID+'/tests/import', file)
                .success(function (data, status) {
                    callback(data, status);
                }).error(function(data, status){
                	callback(data, status);
                });
			} 
		}
			
			
			
])			