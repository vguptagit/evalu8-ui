'use strict';

angular
.module('evalu8Demo')
.service('ContainerService',[
	'$http',
	'$rootScope',
	'$cookieStore','HttpService',
	function($http, $rootScope, $cookieStore, HttpService) {

		this.bookNodes = function(bookId, searchCriteria,  callback) {

			var bookNodes = [];				
			var url="";
			if(searchCriteria==""){
				url= evalu8config.apiUrl + "/books/" + bookId + "/nodes";
			}else{
				url= evalu8config.apiUrl + "/books/" + bookId + "/nodes?"+searchCriteria;
			}
			
			HttpService.get(url)
			.success(function(response) {
				bookNodes = response;
				callback(bookNodes);
			})
			.error(function(){
				callback(null);
			});
		};
		
		this.containerNodes = function(bookId,containerId, searchCriteria , includeSelf, isFlat ,callback) {
			var url="";
			var queryStrings = "";
			if(searchCriteria!=""){
				queryStrings=queryStrings+searchCriteria;
			}
			if(includeSelf!=""){
				if(queryStrings!=""){
					queryStrings=queryStrings+"&";
				}
				queryStrings=queryStrings+"includeSelf="+includeSelf;
			}
			
			if(isFlat!=""){
				if(queryStrings!=""){
					queryStrings=queryStrings+"&";
				}
				queryStrings=queryStrings+"flat="+isFlat;
			}
				
			if(queryStrings==""){
				url=evalu8config.apiUrl+ "/books/"+ bookId+ "/nodes/"+ containerId+ "/nodes"
			}else{
				url=evalu8config.apiUrl+ "/books/"+ bookId+ "/nodes/"+ containerId+ "/nodes?"+queryStrings;
			}

			HttpService.get(url)
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
		
		this.getQuestionTypeContainers = function(bookid,searchCriteria, callback) {
			var nodes=[];
			var url = evalu8config.apiUrl + "/books/"+bookid+"/nodes?flat=1&"+searchCriteria;
			HttpService.get(url).success(
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

			HttpService
					.get(url)
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