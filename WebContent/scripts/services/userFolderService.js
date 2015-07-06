'use strict';

angular.module('evalu8Demo')

.service('UserFolderService', 
		['$http', '$rootScope', '$location', '$cookieStore', '$cacheFactory', 'CommonService',
		 function($http, $rootScope, $location, $cookieStore, $cacheFactory, CommonService) {
			
			$rootScope.globals = JSON.parse(sessionStorage.getItem('globals'));			
			 
			var config = {
					headers : {
						'x-authorization' : $rootScope.globals.authToken,
						'Accept' : 'application/json;odata=verbose'
					}
			};
					
			this.defaultFolders = function(callback) {				

				var defaultFolders = [];
				$http.get(
						evalu8config.apiUrl + "/my/folders", config)
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

									callback(defaultFolders)
								});

				
			};
			
			this.testRootFolder = function(callback) {
				var myTestRoot = null;
				$http.get(
						evalu8config.apiUrl + "/my/testroot", config)
						.success(
								function(response) {									    							    							
									myTestRoot = response
									callback (myTestRoot);
								})
			}
			
			this.userFoldersCount = function(folder, callback) {				

				$http.get(
						evalu8config.apiUrl + "/my/folders/"+ folder.guid + "/folders", config)
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
						evalu8config.apiUrl + "/my/folders/"+ folder.guid + "/folders", config)
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
			
			this.getUserFoldersByParentFolderId = function(parentFolderId, callback) {				

				var userFolders = [];

				$http.get(evalu8config.apiUrl + "/my/folders/"+ parentFolderId + "/folders", config)
				.success(function(response) {

					response.forEach (function(item) {  
						item.nodeType = "folder";
						item.draggable = true;
						userFolders.push(item);    							    							
					});
					
					if(userFolders.length == 0) {

						userFolders.push(CommonService.getEmptyFolder());
					}
					callback (userFolders);
				})					
				
			};			
			
			this.saveUserFolder = function(userFolder, callback) {				

				var folder = {
						editable: userFolder.editable,
						guid: userFolder.guid,
						parentId: userFolder.parentId,
						sequence: userFolder.sequence,
						title: userFolder.title,
						userID: userFolder.userID,	
						testBindings: userFolder.testBindings
				};
				
				
				$http.post(evalu8config.apiUrl + '/my/folders', folder, config)
				.success(function(response) {									
				    if (callback) callback(response);
				})
				.error(function(error, status) {

				})				
			};			
						
		}
])			