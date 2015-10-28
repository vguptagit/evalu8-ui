'use strict';

angular.module('evalu8Demo')

.service('UserQuestionsService', 
		['$http', '$rootScope', '$location', '$cookieStore', 'HttpService', 
	 function($http, $rootScope, $location, $cookieStore, HttpService) {
		
		this.userQuestions = function(callback) {	

			var userQuestions = [];
			$http.get(evalu8config.apiUrl + "/my/questions", HttpService.getConfig())
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
			$http.get(evalu8config.apiUrl + "/my/questions?folderId=" + questionFolderId, HttpService.getConfig())
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
			$http.get(evalu8config.apiUrl + "/my/questionfolders", HttpService.getConfig())
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
			$http.head(evalu8config.apiUrl + "/my/questions", HttpService.getConfig())
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
            
            $http.post(evalu8config.apiUrl + '/my/questionfolders', folder, HttpService.getConfig())
            .success(function(response) {                                    
                if (callback) callback(response);
            })
            .error(function(error, status) {
            	callback(null);
            })
        };
        
        this.moveQuestion = function(questionFolder, callback) {
            $http.post(evalu8config.apiUrl + '/my/movequestion', questionFolder, HttpService.getConfig())
            .success(function(response) {                                    
                if (callback) callback(true);
            })
            .error(function(error, status) {
            	if (callback) callback(false);
            })
        }
        
        this.userQuestionsFolderRoot = function(callback) {    

            $http.get(evalu8config.apiUrl + "/my/questionfoldersroot", HttpService.getConfig())
                .success(function(response) {
                    callback(response)
                })
                .error(function(){
                    callback(null);
                })
        };

	}
])		