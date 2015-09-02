'use strict';

angular.module('evalu8Demo')

.service('UserQuestionsService', 
		['$http', '$rootScope', '$location', '$cookieStore', 
	 function($http, $rootScope, $location, $cookieStore) {
		
		$rootScope.globals = JSON.parse(sessionStorage.getItem('globals'));		
		 
		var config = {
				headers : {
					'x-authorization' : $rootScope.globals.authToken,
					'Accept' : 'application/json;odata=verbose'
				}
		};
		
		this.userQuestions = function(callback) {	

			var userQuestions = [];
			$http.get(evalu8config.apiUrl + "/my/questions", config)
				.success(function(response) {
					userQuestions= response;
					callback(userQuestions);
				})
				.error(function(){
					callback(userQuestions);
				})
		};
		
		this.userBookQuestions = function(questionFolderId, callback) {	

			var userQuestions = [];
			$http.get(evalu8config.apiUrl + "/my/questions?folderId=" + questionFolderId, config)
				.success(function(response) {
					userQuestions= response;
					callback(userQuestions)
				})
				.error(function(){
					callback(userQuestions);
				})
		};
		
		this.userQuestionsFolders = function(callback) {	

			var userQuestionsFolders = [];
			$http.get(evalu8config.apiUrl + "/my/questionfolders", config)
				.success(function(response) {
					userQuestionsFolders= response;
					callback(userQuestionsFolders)
				})
				.error(function(){
					callback(userQuestionsFolders);
				})
		};
		
		this.userQuestionsCount = function(callback) {	

			var userQuestionsCount = 0;
			$http.head(evalu8config.apiUrl + "/my/questions", config)
				.success(function(data, status, headers) {
					userQuestionsCount = parseInt(headers("x-return-count"));
					callback(userQuestionsCount)
				})
				.error(function(){
					callback(userQuestionsCount);
				})
		};
		
        this.saveQuestionFolder = function(userQuestionsFolders, callback) {    

            var folder = {
                    parentId: userQuestionsFolders.parentId,
                    sequence: userQuestionsFolders.sequence,
                    title: userQuestionsFolders.title    
            };            
            
            $http.post(evalu8config.apiUrl + '/my/questionfolders', folder, config)
            .success(function(response) {                                    
                if (callback) callback(response);
            })
            .error(function(error, status) {

            })
        };
        
        this.userQuestionsFolderRoot = function(callback) {    

            var userQuestionsFolderRoot = {};
            $http.get(evalu8config.apiUrl + "/my/questionfoldersroot", config)
                .success(function(response) {
                    userQuestionsFolderRoot= response;
                    callback(userQuestionsFolderRoot)
                })
                .error(function(){
                    callback(userQuestionsFolderRoot);
                })
        };

	}
])		