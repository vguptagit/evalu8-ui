'use strict';

angular
.module('evalu8Demo')
.service('ContainerService',[
	'$http',
	'$rootScope',
	'$cookieStore',
	function($http, $rootScope, $cookieStore) {

		$rootScope.globals = JSON.parse(sessionStorage.getItem('globals'));

		var config = {
			headers : {
				'x-authorization' : $rootScope.globals.authToken,
				'Accept' : 'application/json;odata=verbose'
			}
		};

		this.bookNodes = function(bookId, quizTypes,  callback) {

			var bookNodes = [];				
			var url="";
			if(quizTypes==""){
				url= evalu8config.apiUrl + "/books/" + bookId + "/nodes";
			}else{
				url= evalu8config.apiUrl + "/books/" + bookId + "/nodes?quizTypes="+quizTypes;
			}
			
			$http.get(url, config)
			.success(function(response) {
				bookNodes = response;
				callback(bookNodes);
			})
			.error(function(){
				callback(bookNodes);
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

			$http.get(url, config)
				.success(function(response) {
					if(response == null) {
						response = []
					}
					callback(response);
				});
		};
		
		this.getQuestionTypeContainers = function(bookid,quizTypes, callback) {
			var nodes=[];
			var url = evalu8config.apiUrl + "/books/"+bookid+"/nodes?quizTypes="+quizTypes;
			$http.get(url, config).success(
					function(response) {
						callback(response);
					}).error(function() {
						callback(nodes);
					});
			};
		
		this.getAllContainers = function(bookid, callback) {

			var cointainers = [];

			var url = evalu8config.apiUrl
					+ "/books/"+ bookid +"/nodes?flat=1";

			$http
					.get(url, config)
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
								callback(cointainers);
							});

		};
	}
]);