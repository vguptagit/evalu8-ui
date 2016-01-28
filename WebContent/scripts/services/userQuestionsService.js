'use strict';

angular.module('evalu8Demo')

.service('UserQuestionsService', 
		['$http', '$rootScope', '$location', '$cookieStore', 'HttpService', 
	 function($http, $rootScope, $location, $cookieStore, HttpService) {
		
		this.userQuestions = function(callback) {	

			var userQuestions = [];
			HttpService.get(evalu8config.apiUrl + "/my/questions")
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
			HttpService.get(evalu8config.apiUrl + "/my/questions?folderId=" + questionFolderId)
				.success(function(response) {
					userQuestions= response;
					callback(userQuestions)
				})
				.error(function(){
					callback(userQuestions);
				})
		};
		
		this.allFolderQuestions = function(questionFolderId, callback) {	

			var userQuestions = [];
			HttpService.get(evalu8config.apiUrl + "/my/questions?flat=1&folderId=" + questionFolderId)
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
			HttpService.get(evalu8config.apiUrl + "/my/questionfolders")
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
			HttpService.head(evalu8config.apiUrl + "/my/questions")
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
            
            HttpService.post(evalu8config.apiUrl + '/my/questionfolders', folder)
            .success(function(response) {                                    
                if (callback) callback(response);
            })
            .error(function(error, status) {
            	callback(null);
            })
        };
        
        this.moveQuestion = function(questionFolder, callback) {
            HttpService.post(evalu8config.apiUrl + '/my/movequestion', questionFolder)
            .success(function(response) {                                    
                if (callback) callback(true);
            })
            .error(function(error, status) {
            	if (callback) callback(false);
            })
        }        

	}
])		