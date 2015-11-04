'use strict';

angular
.module('evalu8Demo')
.service('ContainerService',[
	'$http',
	'$rootScope',
	'$cookieStore','HttpService',
	function($http, $rootScope, $cookieStore, HttpService) {

		this.bookNodes = function(bookId, quizTypes,  callback) {

			var bookNodes = [];				
			var url="";
			if(quizTypes==""){
				url= evalu8config.apiUrl + "/books/" + bookId + "/nodes";
			}else{
				url= evalu8config.apiUrl + "/books/" + bookId + "/nodes?quizTypes="+quizTypes;
			}
			
			$http.get(url, HttpService.getConfig())
			.success(function(response) {
				bookNodes = response;
				callback(bookNodes);
			})
			.error(function(){
				callback(null);
			});
		};
		
		this.containerNodes = function(bookId,containerId, quizTypes , includeSelf ,callback) {
			var url="";
			var queryStrings = "";
			if(quizTypes!=""){
				queryStrings=queryStrings+"quizTypes="+quizTypes;
			}
			if(includeSelf!=""){
				if(queryStrings!=""){
					queryStrings=queryStrings+"&";
				}
				queryStrings=queryStrings+"includeSelf="+includeSelf;
			}
				
			if(queryStrings==""){
				url=evalu8config.apiUrl+ "/books/"+ bookId+ "/nodes/"+ containerId+ "/nodes"
			}else{
				url=evalu8config.apiUrl+ "/books/"+ bookId+ "/nodes/"+ containerId+ "/nodes?"+queryStrings;
			}

			$http.get(url, HttpService.getConfig())
				.success(function(response) {
					if(response == null) {
						response = []
					}
					callback(response);
				})
				.error(function(){
					callback(null);
				});
		};
		
		this.getQuestionTypeContainers = function(bookid,quizTypes, callback) {
			var nodes=[];
			var url = evalu8config.apiUrl + "/books/"+bookid+"/nodes?"+quizTypes;
			$http.get(url, HttpService.getConfig()).success(
					function(response) {
						callback(response);
					}).error(function() {
						callback(null);
					});
			};
		
		this.getAllContainers = function(bookid, callback) {

			var cointainers = [];

			var url = evalu8config.apiUrl
					+ "/books/"+ bookid +"/nodes?flat=1";

			$http
					.get(url, HttpService.getConfig())
					.success(
							function(response) {

								response
										.forEach(function(
												container) {
											cointainers
													.push(container)
										});

								callback(cointainers);
							}).error(function(){
								callback(null);
							});

		};
	}
]);