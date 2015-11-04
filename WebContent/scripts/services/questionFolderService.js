'use strict';

angular.module('evalu8Demo')

.service('QuestionFolderService', 
		['$http', '$rootScope', '$location', '$cookieStore', '$cacheFactory', 'CommonService', 'HttpService',
		 function($http, $rootScope, $location, $cookieStore, $cacheFactory, CommonService, HttpService) {			
					
			this.defaultFolders = function(callback) {				

				var defaultFolders = [];
				$http.get(
						evalu8config.apiUrl + "/my/questionfolders", HttpService.getConfig())
						.success(
								function(response) {
									
									response.forEach (function(item) {
										item.nodeType = "folder";
										item.draggable = true;
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
				var myTestRoot = null;
				$http.get(
						evalu8config.apiUrl + "/my/questionfoldersroot", HttpService.getConfig())
						.success(
								function(response) {									    							    							
									myTestRoot = response
									callback (myTestRoot);
								})
						.error(function(error, status) {
									callback(null)
						});
			}
			
			this.userFoldersCount = function(folder, callback) {				

				$http.get(
						evalu8config.apiUrl + "/my/folders/"+ folder.guid + "/folders", HttpService.getConfig())
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

				$http.get(
						evalu8config.apiUrl + "/my/folders/"+ folder.guid + "/folders", HttpService.getConfig())
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

				$http.get(evalu8config.apiUrl + "/my/questionfolders/"+ parentFolderId + "/folders", HttpService.getConfig())
				.success(function(response) {

					response.forEach (function(item) {  
						item.nodeType = "folder";
						item.draggable = true;
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
            
	            $http.post(evalu8config.apiUrl + '/my/questionfolders', folder, HttpService.getConfig())
	            .success(function(response) {                                    
	            	if (callback) callback(response);
	            })
	            .error(function(error, status) {
	            	callback(null);
	            })
			};			
						
		}
])			