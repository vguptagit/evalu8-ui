'use strict';

angular.module('evalu8Demo')

.service('QuestionFolderService', 
		['$http', '$rootScope', '$location', '$cookieStore', '$cacheFactory', 'CommonService', 'HttpService','EnumService',
		 function($http, $rootScope, $location, $cookieStore, $cacheFactory, CommonService, HttpService, EnumService) {			
					
			this.defaultFolders = function(callback) {				

				var defaultFolders = [];
				HttpService.get(
						evalu8config.apiUrl + "/my/questionfolders")
						.success(
								function(response) {
									
									response.forEach (function(item) {
										item.nodeType = "folder";
										item.draggable = true;
										item.isNodeSelected = false;
										item.titleTemp = angular.copy(item.title);
										defaultFolders.push(item);																								    							    							
									});
									
									callback (defaultFolders);
								})
						.error(
								function(error, status) {

									callback(null)
								});
				
			};
			
			this.questionRootFolder = function(callback) {
				
				if($rootScope.myQuestionRoot) {
					callback ($rootScope.myQuestionRoot);
				} else {
					HttpService.get(
							evalu8config.apiUrl + "/my/questionfoldersroot")
							.success(
									function(response) {									    							    							

										$rootScope.myQuestionRoot = response;
										callback (response);
									})
							.error(function(error, status) {
										callback(null)
							});
				}
			}
			
			this.userFoldersCount = function(folder, callback) {				

				HttpService.get(
						evalu8config.apiUrl + "/my/folders/"+ folder.guid + "/folders")
						.success(
								function(userFolders) {

									callback (userFolders.length);
								})
						.error(
								function(error) {

									callback (0);
								})
				
			};
			
			this.getFoldersMinSeq = function(folder, callback) {				

				HttpService.get(
						evalu8config.apiUrl + "/my/questionfolders/"+ folder.guid + "/folders")
						.success(
								function(userFolders) {
									if(userFolders.length)
										callback (userFolders[0].sequence);
									else
										callback (0.0);
								})
						.error(
								function(error) {

									callback (0.0);
								})
				
			};
			
			this.getFoldersByParentFolderId = function(parentFolderId, callback) {				

				var userFolders = [];

				HttpService.get(evalu8config.apiUrl + "/my/questionfolders/"+ parentFolderId + "/folders")
				.success(function(response) {

					response.forEach (function(item) {  
						item.nodeType = "folder";
						item.draggable = true;
						item.titleTemp = angular.copy(item.title);
						userFolders.push(item);    							    							
					});
					callback (userFolders);
				})
				.error(function(error, status) {
					callback(null)
				});					
				
			};			
			
			this.saveQuestionFolder = function(userQuestionsFolder, callback) {								
				
	            var folder = {
	            	guid: userQuestionsFolder.guid,
                    questionBindings: userQuestionsFolder.questionBindings,
                    parentId: userQuestionsFolder.parentId,
                    sequence: userQuestionsFolder.sequence,
                    title: userQuestionsFolder.title    
	            };            
            
	            HttpService.post(evalu8config.apiUrl + '/my/questionfolders', folder)
	            .success(function(response) {                                    
	            	if (callback) callback(response);
	            })
	            .error(function(error, status) {
	            	if(status == EnumService.HttpStatus.CONFLICT) {
						callback(EnumService.HttpStatus.CONFLICT);
					} else {
						callback(null);
					}
	            })
			};	
			
			this.updateQuestionFolder = function(userQuestionsFolder, callback) {								
				
	            var folder = {
	            	guid: userQuestionsFolder.guid,
                    questionBindings: userQuestionsFolder.questionBindings,
                    parentId: userQuestionsFolder.parentId,
                    sequence: userQuestionsFolder.sequence,
                    title: userQuestionsFolder.title    
	            };            
            
	            HttpService.put(evalu8config.apiUrl + '/my/questionfolders', folder)
	            .success(function(response) {                                    
	            	if (callback) callback(response);
	            })
	            .error(function(error, status) {
	            	if(status == EnumService.HttpStatus.CONFLICT) {
						callback(EnumService.HttpStatus.CONFLICT);
					} else {
						callback(null);
					}
	            })
			};
						
		}
])			