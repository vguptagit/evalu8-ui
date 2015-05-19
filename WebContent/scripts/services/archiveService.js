'use strict';

angular.module('evalu8Demo')

.service('ArchiveService', 
		['$http', '$rootScope', '$location', '$cookieStore', 'blockUI',
		 function($http, $rootScope, $location, $cookieStore,blockUI) {
			
			$rootScope.globals = $cookieStore.get('globals') || {};
			
			 if ($rootScope.globals.authToken == '') {
				 $location.path('/login');
			 } 
			 
			var config = {
					headers : {
						'x-authorization' : $rootScope.globals.authToken,
						'Accept' : 'application/json;odata=verbose'
					}
			};
							
			
			this.getArchiveFolders = function(folder, callback) {				
				var blockLeftpanel = blockUI.instances.get('Leftpanel');
				blockLeftpanel.start();
				var url;
				if(folder && folder.guid) {
					url = "/my/archive/folders/"+ folder.guid + "/folders"
				} else {
					url = "/my/archive/folders"
				}

				var userFolders = [];
				$http.get(
						evalu8config.host + url, config)
						.success(
								function(response) {

									response.forEach (function(item) {  
										item.nodeType = "archiveFolder";
										userFolders.push(item);    							    							
									});
									callback (userFolders);
									blockLeftpanel.stop();
								})
						.error(
								function(error) {
									var item = null;
									item = {"draggable":"NotDraggable","title":"Empty folder", "sequence":0};
									item.nodeType = "empty";
									userFolders.push(item);
									callback (userFolders);
									blockLeftpanel.stop();
								})				
			};			
			
			this.archiveFolder = function(folderId, callback) {								
				var archiveItem = {"id": folderId};
				$http.post(evalu8config.host + '/my/archive/folders', archiveItem, config)
				.success(function(archivedFolder) {									
					if(callback) callback(archivedFolder);
				})
				.error(function(error, status) {

				})				
			};
			
			this.archiveTest = function(testId,folderId, callback) {								
				var archiveItem = {"id": testId, "folderId": folderId};
				$http.post(evalu8config.host + '/my/archive/tests', archiveItem, config)
				.success(function(archivedFolder) {									
					if(callback) callback(archivedFolder);
				})
				.error(function(error, status) {

				})				
			};
			
			this.restoreFolder = function(folderId, callback) {								
				var archiveItem = {"id": folderId};
				$http.post(evalu8config.host + '/my/restore/folders', archiveItem, config)
				.success(function(restoredFolder) {									
					if(callback) callback(restoredFolder);
				})
				.error(function(error, status) {

				})				
			};
			
			this.restoreTest = function(testId,folderId, callback) {								
				var archiveItem = {"id": testId, "folderId": folderId};
				$http.post(evalu8config.host + '/my/restore/tests', archiveItem, config)
				.success(function(restoredFolder) {									
					if(callback) callback(restoredFolder);
				})
				.error(function(error, status) {

				})				
			};
			
			this.deleteFolder = function(folderId, callback) {								

				$http.delete(evalu8config.host + '/my/delete/folders/' + folderId, config)
				.success(function(response) {									
					if(callback) callback();
				})
				.error(function(error, status) {

				})				
			};
			
            this.deleteTest = function(testId, folderId, callback) {                                

                var url;
                if(folderId) {
                    url = '/my/delete/folders/' + folderId + '/tests/' + testId;
                } else {
                    url = '/my/delete/tests/' + testId;
                }
                
                $http.delete(evalu8config.host + url, config)
                .success(function(response) {                                    
                    if(callback) callback();
                })
                .error(function(error, status) {

                })                
            };
						
		}
])			