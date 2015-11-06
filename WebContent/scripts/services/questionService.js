'use strict';

angular
		.module('evalu8Demo')

		.service(
				'questionService',
				[
						'$http',
						'$rootScope',
						'$cookieStore','HttpService',
						function($http, $rootScope, $cookieStore, HttpService) {

							this.getQuestionsOfContainer = function(bookid, containerid, filterCriteria, callback) {

                                var url;
                                if(filterCriteria==""){
                                    url = evalu8config.apiUrl + "/books/"+ bookid + "/nodes/" + containerid+ "/questions";    
                                }else{
                                    url = evalu8config.apiUrl + "/books/"+ bookid + "/nodes/" + containerid+ "/questions?"+filterCriteria;
                                }

                                HttpService.get(url)
                                .success(function(response) {
                                    callback(response);
                                 }).error(function(){
                                    callback(null);
                                 });
                            };

                            
                            this.getAllQuestionsOfContainer = function(bookid, containerid, filterCriteria, callback) {

                                var url;
                                if(filterCriteria==""){
                                    url = evalu8config.apiUrl + "/books/"+ bookid + "/nodes/" + containerid+ "/questions?flat=1";
                                }else{
                                    url = evalu8config.apiUrl + "/books/"+ bookid + "/nodes/" + containerid+ "/questions?flat=1&"+filterCriteria;    
                                }
                                    
                                HttpService.get(url)
                                .success(function(response) {
                                    callback(response);
                                 }).error(function() {
                                    callback(null);
                                 });
                            };

						}]);