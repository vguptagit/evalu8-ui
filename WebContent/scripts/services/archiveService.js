'use strict';

angular.module('evalu8Demo')

.service('ArchiveService', 
		['$http', '$rootScope', '$location', '$cookieStore', 'blockUI', 'EnumService', 'HttpService',
		 function($http, $rootScope, $location, $cookieStore, blockUI, EnumService, HttpService) {							
			
			this.getArchiveFolders = function(folder, callback) {				
				var url;
				if(folder && folder.guid) {
					url = "/my/archive/folders/"+ folder.guid + "/folders"
				} else {
					url = "/my/archive/folders"
				}

				var userFolders = [];
				HttpService.get(
						evalu8config.apiUrl + url)
						.success(
								function(response) {

									response.forEach (function(item) {  
										item.nodeType = "archiveFolder";
										item.draggable = false;
										item.droppable = false;
										userFolders.push(item);    							    							
									});
									callback (userFolders);
								})
						.error(
								function(error) {

									callback (null);
								})				
			};			
			
			this.archiveFolder = function(folderId, callback) {								
				var archiveItem = {"id": folderId};
				HttpService.post(evalu8config.apiUrl + '/my/archive/folders', archiveItem)
				.success(function(archivedFolder) {									
					if(callback) callback(archivedFolder);
				})
				.error(function(error, status) {
					if(callback) callback(null);
				})				
			};
			
			this.archiveTest = function(testId,folderId, callback) {								
				var archiveItem = {"id": testId, "folderId": folderId};
				HttpService.post(evalu8config.apiUrl + '/my/archive/tests', archiveItem)
				.success(function(archivedFolder) {									
					callback(archivedFolder);
				})
				.error(function(error, status) {
					callback(null);
				})				
			};
			
			this.restoreFolder = function(folderId, callback) {								
				var archiveItem = {"id": folderId};
				HttpService.post(evalu8config.apiUrl + '/my/restore/folders', archiveItem)
				.success(function(restoredFolder) {									
					callback(restoredFolder);
				})
				.error(function(error, status) {
					if(status == EnumService.HttpStatus.CONFLICT) {
						callback(EnumService.HttpStatus.CONFLICT);
					} else {
						callback(null);
					}
				})				
			};
			
			this.restoreTest = function(testId,folderId, callback) {								
				var archiveItem = {"id": testId, "folderId": folderId};
				HttpService.post(evalu8config.apiUrl + '/my/restore/tests', archiveItem)
				.success(function(restoredFolder) {									
					callback(restoredFolder);
				})
				.error(function(error, status) { 
					if(status == EnumService.HttpStatus.CONFLICT) {
						callback(EnumService.HttpStatus.CONFLICT);
					} else {
						callback(null);
					}					
				})				
			};
			
			this.deleteFolder = function(folderId, callback) {								

				HttpService.delete(evalu8config.apiUrl + '/my/delete/folders/' + folderId)
				.success(function(response) {									
					if(callback) callback(1);
				})
				.error(function(error, status) {
					if(callback) callback(null);
				})				
			};
			
            this.deleteTest = function(testId, folderId, callback) {                                

                var url;
                if(folderId) {
                    url = '/my/delete/folders/' + folderId + '/tests/' + testId;
                } else {
                    url = '/my/delete/tests/' + testId;
                }
                
                HttpService.delete(evalu8config.apiUrl + url)
                .success(function(response,status) {                                    
                    if(callback) callback(response,status);
                })
                .error(function(error, status) {
                	if(callback) callback(error.message,status);
                })                
            };
						
		}
])			