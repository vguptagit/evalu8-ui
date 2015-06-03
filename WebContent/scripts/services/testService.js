'use strict';

angular.module('evalu8Demo')

.service('TestService', 
		['$http', '$rootScope', '$location', '$cookieStore', '$upload','blockUI',
		 function($http, $rootScope, $location, $cookieStore,$upload,blockUI) {
			
			$rootScope.globals = $cookieStore.get('globals') || {};
			 
			var config = {
					headers : {
						'x-authorization' : $rootScope.globals.authToken,
						'Accept' : 'application/json;odata=verbose'
					}
			};						
			
			this.saveTestData = function(testData,folderId,callback) {				
				var defaultFolders = [];
				$http.post(evalu8config.apiUrl + '/my/folders/'+folderId+'/tests', testData, config)
				.success(function(response) {	
					var testResult = response;
					callback(testResult);
				})
				.error(function(error, status) {

				})				
			};
			
            this.saveQuestions = function(editedQstns, callback) {
                $http.post(evalu8config.apiUrl + '/my/questions', editedQstns, config)
                .success(function(response) {    
                    var questionsResult = response;
                    callback(questionsResult);
                    $rootScope.blockRightPanel.stop();
                })
                .error(function(error, status) {

                	$rootScope.blockRightPanel.stop();
                })                
                
            };
			
			this.updateTestMetaData = function(testData,folderId,callback) {				
			
				var testMetadata = {
					crawlable: testData.crawlable,
					description: testData.description,
					extendedMetadata: testData.extendedMetadata,
					guid: testData.guid,
					keywords: testData.keywords,
					quizType: testData.quizType,
					subject: testData.subject,
					timeRequired: testData.timeRequired,
					title: testData.title,
					version: testData.version,
					versionOf: testData.versionOf
				}
								
				$http.post(evalu8config.apiUrl + '/my/folders/'+folderId+'/tests/'+testMetadata.guid+'/metadata', testMetadata, config)
				.success(function(response) {	
					var testResult = response;
					if(callback) callback(testResult);
				})
				.error(function(error, status) {

					//if(status == 403)
						//$location.path('/login');
				})				
			};
				
			this.getTests = function(folderId, callback) {				
				var url;
				if(folderId==null) {
					url = evalu8config.apiUrl + '/my/tests';
				} else {
					url = evalu8config.apiUrl + '/my/folders/' + folderId + '/tests';
				}
				
				$http.get(url, config)
				.success(function(response) {
					var tests = response;
					tests.forEach(function(test){
						test.nodeType = "test";
						test.parentId = folderId;
						test.showEditIcon=true;
						test.showArchiveIcon=true;
					})
					callback(tests)
				})
				.error(function(error, status) {
					callback([]);
				})				
			};
			
			this.getArchiveTests = function(folderId, callback) {				
				$http.get(evalu8config.apiUrl + '/my/archive/folders/' + folderId + '/tests', config)
				.success(function(response) {
					var tests = response;
					tests.forEach(function(test){
						test.nodeType = "archiveTest";
						test.parentId = folderId;
					})
					callback(tests)
				})
				.error(function(error, status) {
				})				
			};
			
			this.getTestsMaxSeq = function(folderId, callback) {				

				var maxSeq = 0.0;
				$http.get(evalu8config.apiUrl + '/my/folders/' + folderId + '/tests', config)
				.success(function(response) {
					var tests = response;
					tests.forEach(function(item){
	                	
						item.extendedMetadata.forEach(function(data) {
	                		if(data.name=='sequence') {
	                			maxSeq = data.value;	                			
	                		}
	                	}) 
	                	
					})
					callback(maxSeq)
				})
				.error(function(error, status) {
					callback(0.0);
				})				
			};
			
			this.getTestsMinSeq = function(folderId, callback) {				

				var maxSeq = 0.0;
				$http.get(evalu8config.apiUrl + '/my/folders/' + folderId + '/tests', config)
				.success(function(response) {
					var tests = response;
					tests.every(function(item){
	                	
						item.extendedMetadata.forEach(function(data) {
	                		if(data.name=='sequence') {
	                			maxSeq = data.value;	                			
	                		}
	                	})
	                	return false;	                	
					})
					callback(maxSeq)
				})
				.error(function(error, status) {
					callback(0.0);
				})				
			};
			
			this.getTest = function(testId, callback) {				

				$http.get(evalu8config.apiUrl + '/tests/' + testId, config)
				.success(function(response) {
					var test = response;
					callback(test)
					$rootScope.blockRightPanel.stop();
				})
				.error(function(error, status) {
					$rootScope.blockRightPanel.stop();
				})				
			};
			
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
				    $rootScope.blockRightPanel.stop();
				})
				.error(function (error, status) {
					$rootScope.blockRightPanel.stop();
				}) 
			};
			
			this.getMetadata = function (testid ,callback) {			 
			    $http.get(evalu8config.apiUrl + '/test/' + testid + '/metadata', config)
				.success(function (response) {				     
				    callback(response);
				})
				.error(function (error, status) {

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