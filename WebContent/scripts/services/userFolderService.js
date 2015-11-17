'use strict';

angular.module('evalu8Demo')

.service('UserFolderService', 
		['$http', '$rootScope', '$location', '$cookieStore', '$cacheFactory', 'CommonService', 'HttpService','EnumService',
		 function($http, $rootScope, $location, $cookieStore, $cacheFactory, CommonService, HttpService,EnumService) {			
					
			this.defaultFolders = function(callback) {				

				var defaultFolders = [];
				HttpService.get(
						evalu8config.apiUrl + "/my/folders")
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
			
			this.testRootFolder = function(callback) {
				var myTestRoot = null;
				HttpService.get(
						evalu8config.apiUrl + "/my/testroot")
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
						evalu8config.apiUrl + "/my/folders/"+ folder.guid + "/folders")
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

				HttpService.get(evalu8config.apiUrl + "/my/folders/"+ parentFolderId + "/folders")
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
				
				
				HttpService.post(evalu8config.apiUrl + '/my/folders', folder)
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