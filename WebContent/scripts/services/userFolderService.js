'use strict';

angular.module('evalu8Demo')

.service('UserFolderService', 
		['$http', '$rootScope', '$location', '$cookieStore', '$cacheFactory',
		 function($http, $rootScope, $location, $cookieStore, $cacheFactory) {
			
			$rootScope.globals = $cookieStore.get('globals') || {};			
			 
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
			
			this.myTestRootFolder = function(callback) {
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

									callback (userFolders[0].sequence);
								})
						.error(
								function(error) {

									callback (0.0);
								})
				
			};
			
			this.getUserFoldersByParentFolderId = function(parentFolderId, callback) {				

				var userFolders = [];

				$http.get(evalu8config.apiUrl + "/my/folders/"+ parentFolderId + "/folders", config)
				.success(
						function(response) {

							response.forEach (function(item) {  
								item.nodeType = "folder";
								item.draggable = true;
								userFolders.push(item);    							    							
							});
							
							callback (userFolders);
						})
				.error(
						function(error) {
							var item = {"nodeType": "empty", "draggable": false, "title": "Empty folder", "sequence": 0};
							userFolders.push(item);
							
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