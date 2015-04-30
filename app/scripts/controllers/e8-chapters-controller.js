'use strict';

angular
		.module('e8Chapters', [ 'ui.tree' ])

		.controller(
				'ChapterController',
				[
						'$http',
						'$scope',
						'$rootScope',
						'$cookieStore',
						'$location',
						'$routeParams',
						'$sce',
						function($http, $scope, $rootScope, $cookieStore,
								$location, $routeParams, $sce) {

							$rootScope.globals = $cookieStore.get('globals')
									|| {};

							if ($rootScope.globals.authToken == '') {
								$location.path('/login');
							} else {
								var config = {
									headers : {
										'x-authorization' : $rootScope.globals.authToken,
										'Accept' : 'application/json;odata=verbose'
									}
								};

								$http.get(
										evalu8config.host + "/books/"
												+ $routeParams.bookid
												+ "/nodes", config).success(
										function(response) {
											$scope.data = response;
										});

								$http.get(
										evalu8config.host + "/books/"
												+ $routeParams.bookid
												+ "/tests", config).success(
										function(response) {
											$scope.testData = response;
										});

							}

							QTI.initialize();

							$scope.getNodes = function(currentNode) {

								if (currentNode.node.expand == 1) {
									currentNode.node.expand = 0;
									currentNode.collapse();
								} else {
									currentNode.node.nodes = [];
									currentNode.expand();
									$http
											.get(
													evalu8config.host
															+ "/books/"
															+ $routeParams.bookid
															+ "/nodes/"
															+ currentNode.node.guid
															+ "/nodes", config)
											.success(
													function(response) {
														currentNode.node.nodes = currentNode.node.nodes
																.concat(response);
														currentNode.node.expand = 1;
														angular
																.forEach(
																		currentNode.node.nodes,
																		function(
																				item) {
																			item.template = 'nodes_renderer.html';
																		})
													});

									$http
											.get(
													evalu8config.host
															+ "/books/"
															+ $routeParams.bookid
															+ "/nodes/"
															+ currentNode.node.guid
															+ "/questions"
															+ $scope.queryString,
													config)
											.success(
													function(response) {
														var responseQuestions = response
														currentNode.node.nodes = currentNode.node.nodes
																.concat(response);
														currentNode.node.expand = 1;

														angular
																.forEach(
																		responseQuestions,
																		function(
																				item) {
																			$scope
																					.renderQuestion(
																							item
																							);
																		})

													});
								}

							};

							$scope.renderQuestion = function(item) {

								$http
										.get(evalu8config.host + "/questions/"
												+ item.guid, config)
										.success(
												function(response) {
													var displayNode = $("<div></div>")
													QTI.play(response,
															displayNode);
													item.textHTML = displayNode
															.html();
													item.template = 'questions_renderer.html';

												})

							};

							$scope.toggleFilter = function() {
								$scope.filterview = $scope.filterview == true ? false
										: true;
							};

							$scope.queryString = ""

							$scope.questionFilter = function() {

								var qString = ""
								angular.forEach(document
										.querySelectorAll("input"), function(
										item) {
									if (item.value != "")
										qString = qString + item.guid + "="
												+ item.value + "&";
								});
								if (qString.length != 0)
									$scope.queryString = "?" + qString;

								$scope.filterview = false;
								$http.get(
										evalu8config.host + "/books/"
												+ $routeParams.bookid
												+ "/nodes", config).success(
										function(response) {
											$scope.data = response;
										});
								$scope.clear = true;
							}

							$scope.clearFilter = function() {
								angular.element(
										document.querySelectorAll("input"))
										.val("");
								$scope.queryString = ""
								$scope.clear = false;
								$http.get(
										evalu8config.host + "/books/"
												+ $routeParams.bookid
												+ "/nodes", config).success(
										function(response) {
											$scope.data = response;
										});
							}

							$scope.getHTML = function(datanode) {
								if (datanode.node.textHTML) {
									return $sce
											.trustAsHtml(datanode.node.textHTML);
								}
							}

							$scope.getTestHTML = function(datanode) {
								return $sce.trustAsHtml(datanode.node.html());
							}

							$scope.renderHTML = "views/tests.htm";

							$scope.getTestNode = function(datanode) {
								var testXML;
								$http
										.get(
												evalu8config.host + "/tests/"
														+ datanode.node.guid,
												config)
										.success(
												function(response) {

													$scope
															.renderTest(
																	response,
																	datanode.node.title);
												});

							}

							$scope.renderTest = function(response, title) {

								$scope.testQuestions = [];
								$scope.questionsCount = response.assignmentContents.binding.length;
								$scope.successQuestionCount = 0;
								angular
										.forEach(
												response.assignmentContents.binding,
												function(item) {
													$http
															.get(
																	item.boundActivity,
																	config)
															.success(
																	function(
																			response) {
																		var displayNode = $("<div></div>")
																		QTI
																				.play(
																						response,
																						displayNode
																						);
																		if ($scope.testQuestions.length == 0) {
																			$scope.renderHTML = "testQuestion_renderer.html";
																			$scope.testTitle = title;
																		}
																		$scope.testQuestions = $scope.testQuestions
																				.concat(displayNode);

																	})

												})

							}

							$scope.back = function() {
								$scope.renderHTML = "views/tests.htm";
								$scope.testQuestions = [];
							}

						} ]);
