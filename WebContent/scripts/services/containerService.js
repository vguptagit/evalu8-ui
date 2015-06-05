'use strict';

angular
.module('evalu8Demo')
.service('ContainerService',[
	'$http',
	'$rootScope',
	'$cookieStore',
	function($http, $rootScope, $cookieStore) {

		$rootScope.globals = $cookieStore.get('globals') || {};

		var config = {
			headers : {
				'x-authorization' : $rootScope.globals.authToken,
				'Accept' : 'application/json;odata=verbose'
			}
		};

		this.bookNodes = function(bookId, callback) {

			var bookNodes = [];				
			 
			$http.get(evalu8config.apiUrl + "/books/" + bookId + "/nodes", config)
			.success(function(response) {
				bookNodes = response;
				callback(bookNodes);
			})
			.error(function(){
				callback(bookNodes);
			});
		};
		
		this.containerNodes = function(bookId,containerId, quizTypes ,callback) {
			var url="";
			if(quizTypes==""){
				url=evalu8config.apiUrl+ "/books/"+ bookId+ "/nodes/"+ containerId+ "/nodes"
			}else{
				url=evalu8config.apiUrl+ "/books/"+ bookId+ "/nodes/"+ containerId+ "/nodes?quizTypes="+quizTypes;
			}
			
			$http.get(url, config)
				.success(function(response) {
					callback(response);
				})
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
		
		this.getAllContainers = function(bookids, callback) {

			var cointainers = [];

			var url = evalu8config.apiUrl
					+ "/books/nodes?bookids="
					+ bookids;

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