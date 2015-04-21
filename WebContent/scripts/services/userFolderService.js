'use strict';

angular.module('evalu8Demo')

.service('UserFolderService', 
		['$http', '$rootScope', '$location', '$cookieStore', 
		 function($http, $rootScope, $location, $cookieStore) {
			
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
					
			this.defaultFolders = function(callback) {				

				var defaultFolders = [];
				$http.get(
						evalu8config.host + "/my/folders", config)
						.success(
								function(response) {
									
									response.forEach (function(item) {
										item.nodeType = "folder";
										defaultFolders.push(item);																								    							    							
									});
									
									callback (defaultFolders);
								})
						.error(
								function(error, status) {
									if(status == 403) $location.path('/login');
									callback(defaultFolders)
								});

				
			};
			
			this.myTestRootFolder = function(callback) {
				var myTestRoot = null;
				$http.get(
						evalu8config.host + "/my/mytestroot", config)
						.success(
								function(response) {									    							    							
									myTestRoot = response
									callback (myTestRoot);
								})
			}
			
			this.userFoldersCount = function(folder, callback) {				

				$http.get(
						evalu8config.host + "/my/folders/"+ folder.guid + "/folders", config)
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
						evalu8config.host + "/my/folders/"+ folder.guid + "/folders", config)
						.success(
								function(userFolders) {

									callback (userFolders[0].sequence);
								})
						.error(
								function(error) {

									callback (0.0);
								})
				
			};
			
			this.userFolders = function(folder, callback) {				

				var userFolders = [];
				$http.get(
						evalu8config.host + "/my/folders/"+ folder.guid + "/folders", config)
						.success(
								function(response) {

									response.forEach (function(item) {  
										item.nodeType = "folder";
										userFolders.push(item);    							    							
									});
									callback (userFolders);
								})
						.error(
								function(error) {
									var item = null;
									item = {"draggable":"NotDraggable","title":"Empty folder", "sequence":0};
									item.nodeType = "empty";
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
				
				
				$http.post(evalu8config.host + '/my/folders', folder, config)
				.success(function(response) {									
					if(callback) callback();
				})
				.error(function(error, status) {

				})				
			};			
						
		}
])			