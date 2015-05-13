'use strict';

angular
		.module('e8QuestionBanks')

		.controller(
				'QuestionBanksController',
				[
						'$scope',
						'$rootScope',
						'$location',
						'$cookieStore',
						'$http',
						'$sce',
						'DisciplineService',
						'TestService',
						'SharedTabService',
						'UserQuestionsService',
						'EnumService',
						'$modal',
						function($scope, $rootScope, $location, $cookieStore,
								$http, $sce, DisciplineService, TestService,
								SharedTabService, UserQuestionsService,
								EnumService, $modal) {
							SharedTabService.selectedMenu = SharedTabService.menu.questionBanks;
							$rootScope.globals = $cookieStore.get('globals')
									|| {};
							var config = {
								headers : {
									'x-authorization' : $rootScope.globals.authToken,
									'Accept' : 'application/json;odata=verbose'
								}
							};
							$scope.controller = EnumService.CONTROLLERS.questionBanks;
							$scope.selectedNodes = [];

							$scope.dragStarted = false;

							$scope.$on('dragStarted', function() {
								$scope.dragStarted = true;
							});

							$scope.$on('dragEnd', function(event, destParent,
									source, sourceParent, sourceIndex,
									destIndex) {
								if ($scope.dragStarted) {
									$scope.dragStarted = false;
									$rootScope.$broadcast("dropQuestion",
											source.node, destIndex);
									source.node.showEditQuestionIcon = false;
								}
							});

							$scope.$on('beforeDrop', function(event) {
								$rootScope.$broadcast("beforeDropQuestion");
							});

							$scope.isTestWizard = false;
							// Broadcast from SharedTabService.onClickTab()
							$scope
									.$on(
											'handleBroadcastCurrentTabIndex',
											function() {
												$scope.currentIndex = SharedTabService.currentTabIndex;
												$scope.isTestWizard = SharedTabService.tests[SharedTabService.currentTabIndex].isTestWizard;
											});

							$scope.userQuestions = [];

							// Fetch user disciplines and populate the drop down
							DisciplineService
									.userDisciplines(function(userDisciplines) {

										$scope.disciplines = userDisciplines;

										$scope.disciplines.sort(function(a, b) {
											return a.item.localeCompare(b.item)
										});

										UserQuestionsService
												.userQuestions(function(
														userQuestions) {
													if (userQuestions.length) {
														$scope.userQuestions = userQuestions;
														$scope.disciplines
																.unshift({
																	"item" : "Your Questions (user created)"
																});
													}
												})

										DisciplineService
												.disciplineDropdownOptions(
														userDisciplines,
														"Question Banks",
														function(
																disciplinesOptions,
																selectedValue) {

															$scope.disciplinesOptions = disciplinesOptions;
															$scope.selectedValue = selectedValue;
														});
									});

							$scope.disciplineFilterChange = function(option) {

								$scope.disciplines = DisciplineService
										.disciplineDropdownChange(option);

								if ($scope.userQuestions.length) {
									$scope.disciplines
											.unshift({
												"item" : "Your Questions (user created)"
											});
								}
							}

							$scope.testTitle = "New Test";
							// Function is to save the Test details with the
							// questions.

							// To get books for the given discipline.
							// This method will call the api
							// mytest/books?discipline to get the books
							// and append the collection to input discipline
							// angularjs node
							$scope.getBooks = function(discipline) {
								// var blockLeftpanel =
								// blockUI.instances.get('BlockLeftpanel');

								if ($rootScope.globals.authToken == '') {
									$location.path('/login');
								} else {

									if (!discipline.collapsed) {
										discipline.collapse();
									} else {
										// blockLeftpanel.start();
										discipline.expand();

										var ep;

										if (discipline.node.item == 'Your Questions (user created)') {

											discipline.node.nodes = [];

											// qti player initialisation
											QTI.initialize();

											var yourQuestions = [];
											$scope.userQuestions
													.forEach(function(xmlString) {

														var yourQuestion = {};
														var displayNode = $("<div></div>")
														QTI.play(xmlString,
																displayNode,
																false, false);
														yourQuestion.isQuestion = true;
														yourQuestion.questionXML = true;
														yourQuestion.textHTML = displayNode
																.html();
														yourQuestions
																.push(yourQuestion);
													})

											discipline.node.nodes = yourQuestions;
										} else {
											ep = evalu8config.host
													+ "/books?discipline="
													+ discipline.node.item
													+ "&userBooks=true";

											$http
													.get(ep, config)
													.success(
															function(response) {
																discipline.node.nodes = response;
																// blockLeftpanel.stop();
															});
										}

									}
								}
							}

							// To get the Chapters for the given book
							// This method will call the api
							// mytest/books/{bookid}/nodes.
							// Output collection will be append to input book
							// angularjs node.
							$scope.getNodes = function(book) {
								// $scope.selectedNodes=[];
								$scope.bookID = book.node.guid;
								if ($rootScope.globals.authToken == '') {
									$location.path('/login');
								} else {
									if (!book.collapsed) {
										book.collapse();
										book.$element.find("input").attr("src",
												"images/right_arrow2.png");
									} else {
										book.expand();
										book.$element.find("input").attr("src",
												"images/right_arrow.png");
										$http
												.get(
														evalu8config.host
																+ "/books/"
																+ book.node.guid
																+ "/nodes",
														config)
												.success(
														function(response) {
															book.node.nodes = response;
															angular
																	.forEach(
																			book.node.nodes,
																			function(
																					item) {
																				item.showTestWizardIcon = true;
																				item.isNodeSelected = false;
																				if ($scope.selectedNodes.length > 0)
																					for (var i = 0; i < $scope.selectedNodes.length; i++) {
																						if ($scope.selectedNodes[i].guid == item.guid) {
																							item.showTestWizardIcon = $scope.selectedNodes[i].showTestWizardIcon;
																							item.isNodeSelected = $scope.selectedNodes[i].isNodeSelected;
																							$scope.selectedNodes[i] = item;
																						}
																					}
																				item.nodeType = "chapter";
																			})
														});
									}
								}
							}
							// TODO : need to move this to service.
							$scope.createTestWizardCriteria = function(
									currentNode) {
								if (!SharedTabService.isTestWizardTabPresent) {
									$rootScope
											.$broadcast('handleBroadcast_AddTestWizard');
								}
								if (!SharedTabService.tests[SharedTabService.currentTabIndex].isTestWizard) {
									return false;
								}
								if ($rootScope.globals.authToken == '') {
									$location.path('/login');
									return false;
								}
								if (!currentNode.node.isNodeSelected) {
									$scope.selectedNodes.push(currentNode.node);
									currentNode.node.isNodeSelected = !currentNode.node.isNodeSelected;
								}
								if (SharedTabService.isErrorExist(
										currentNode.node, $scope.selectedNodes)) {
									SharedTabService
											.TestWizardErrorPopup_Open();
									return false;
								}
								var selectedNodesLength = $scope.selectedNodes.length;
								var nodeCounter = 0;
								for (var i = 0; i < $scope.selectedNodes.length; i++) {
									currentNode = $scope.selectedNodes[i];
									if (currentNode.showTestWizardIcon) {
										currentNode.showTestWizardIcon = false;
										getQuestions(
												currentNode,
												function() {
													nodeCounter++;
													if (nodeCounter == selectedNodesLength)
														if (SharedTabService.errorMessages.length > 0)
															SharedTabService
																	.TestWizardErrorPopup_Open();
												});
									}
								}
							}
							function getQuestions(currentNode, callBack) {
								$http
										.get(
												evalu8config.host + "/books/"
														+ currentNode.bookid
														+ "/nodes/"
														+ currentNode.guid
														+ "/questions?flat=1",
												config)
										.success(
												function(response) {
													$rootScope
															.$broadcast(
																	"handleBroadcast_createTestWizardCriteria",
																	response,
																	currentNode);
													callBack()
												})
										.error(
												function() {
													SharedTabService
															.addErrorMessage(
																	currentNode.title,
																	SharedTabService.errorMessageEnum.NoQuestionsAvailable);
													callBack()
													currentNode.showTestWizardIcon = true;
													// currentNode.isNodeSelected
													// = false;
													$scope
															.selectNode(currentNode);
												})
							}

							// To get the topics, subtopics, question for the
							// given chapter.
							// This method will call the api
							// mytest/books/{bookid}/nodes/{nodeid}/nodes
							// and
							// mytest/books/{bookid}/nodes/{nodeid}/questions.
							// Output topic,subtopic and question collection
							// will be append to input chapter angularjs node
							$scope.getNodesWithQuestion = function(currentNode) {
								// var blockLeftpanel =
								// blockUI.instances.get('BlockLeftpanel');
								if ($rootScope.globals.authToken == '') {
									$location.path('/login');
								} else {
									if (!currentNode.collapsed) {
										currentNode.collapse();
										$(currentNode.$element).find(
												".captiondiv").removeClass(
												'iconsChapterVisible');
										currentNode.$element.children(1)
												.removeClass('expandChapter');
										currentNode.$element
												.find("input")
												.attr("src",
														"images/right_arrow2.png");
									} else {
										// blockLeftpanel.start();
										currentNode.expand();
										currentNode.$element
												.find("input")
												.attr("src",
														"images/down_arrow.png");
										currentNode.node.nodes = [];
										$http
												.get(
														evalu8config.host
																+ "/books/"
																+ $scope.bookID
																+ "/nodes/"
																+ currentNode.node.guid
																+ "/nodes",
														config)
												.success(
														function(response) {

															currentNode.node.nodes = currentNode.node.nodes
																	.concat(response);

															angular
																	.forEach(
																			currentNode.node.nodes,
																			function(
																					item) {
																				item.template = 'nodes_renderer.html';
																				item.showTestWizardIcon = true;
																				item.isNodeSelected = false;
																				if ($scope.selectedNodes.length > 0)
																					for (var i = 0; i < $scope.selectedNodes.length; i++) {
																						if ($scope.selectedNodes[i].guid == item.guid) {
																							item.showTestWizardIcon = $scope.selectedNodes[i].showTestWizardIcon;
																							item.isNodeSelected = $scope.selectedNodes[i].isNodeSelected;
																							$scope.selectedNodes[i] = item;
																						}
																					}
																				item.nodeType = "topic";
																			})
															// blockLeftpanel.stop();
														})

										$http
												.get(
														evalu8config.host
																+ "/books/"
																+ $scope.bookID
																+ "/nodes/"
																+ currentNode.node.guid
																+ "/questions",
														config)
												.success(
														function(response) {

															var responseQuestions = response;
															$(
																	currentNode.$element)
																	.find(
																			".captiondiv")
																	.addClass(
																			'iconsChapterVisible');
															currentNode.$element
																	.children(0)
																	.addClass(
																			'expandChapter');

															var sortedNodes = sortNodes(
																	response,
																	currentNode);

															currentNode.node.nodes = currentNode.node.nodes
																	.concat(sortedNodes);

															angular
																	.forEach(
																			responseQuestions,
																			function(
																					item) {
																				item.nodeType = "question";
																				item.showEditQuestionIcon = false;
																				item.isNodeSelected = false;
																				addToQuestionsArray(item);
																				$scope
																						.renderQuestion(item);
																			})
															// blockLeftpanel.stop();

														}).error(function() {
													// blockLeftpanel.stop();
												});
										;
									}
								}
							}

							$scope.getQuestions = function(currentNode) {
								// var blockLeftpanel =
								// blockUI.instances.get('BlockLeftpanel');
								if ($rootScope.globals.authToken == '') {
									$location.path('/login');
								} else {
									if (!currentNode.collapsed) {
										currentNode.collapse();
									} else {
										// blockLeftpanel.start();
										currentNode.expand();
										currentNode.node.nodes = [];

										$http
												.get(
														evalu8config.host
																+ "/books/"
																+ $scope.bookID
																+ "/nodes/"
																+ currentNode.node.guid
																+ "/questions",
														config)
												.success(
														function(response) {

															var responseQuestions = response;

															var sortedNodes = sortNodes(
																	response,
																	currentNode);

															currentNode.node.nodes = currentNode.node.nodes
																	.concat(sortedNodes);

															angular
																	.forEach(
																			responseQuestions,
																			function(
																					item) {
																				item.nodeType = "question";
																				$scope
																						.renderQuestion(item);
																			})
															// blockLeftpanel.stop();

														}).error(function() {
													// blockLeftpanel.stop();
												});
										;
									}
								}
							}

							// This method will be called from callback function
							// of question api.
							// This will call api
							// mytest/books/{bookid}/nodes/{nodeid}/questions/{guid}.
							// Out put of this api will be rendered as html and
							// append to chapter angularjs node.
							$scope.renderQuestion = function(item) {

								// qti player initialisation
								QTI.initialize();

								$http
										.get(
												evalu8config.host
														+ "/questions/"
														+ item.guid, config)
										.success(
												function(response) {
													item.data = response;
													QTI.BLOCKQUOTE.id = 0;
													var displayNode = $("<div></div>")
													QTI.play(response,
															displayNode, false,
															false);

													item.textHTML = displayNode
															.html();
													item.template = 'qb_questions_renderer.html';

												})

							};

							// Converts object to query string
							$scope.o2qs = function(o) {
								var qs = [];
								for ( var x in o) {
									qs.push(x + '=' + o[x]);
								}
								return qs.join('&');
							};

							// Rendering the question as html
							$scope.getHTML = function(datanode) {
								if (datanode.node.length) {
									return $sce
											.trustAsHtml(datanode.node[0].innerHTML);
								} else if (datanode.node) {
									return $sce
											.trustAsHtml(datanode.node.textHTML);
								}
							}

							// Sorting questions based on the questionbindings
							// property of the container
							var sortNodes = function(response, currentNode) {
								var sequenceBindings = currentNode.node.questionBindings;
								var sortedNodes = new Array(
										sequenceBindings.length);
								for (var i = 0; i < sequenceBindings.length; i++) {
									sortedNodes[i] = $.grep(response, function(
											item) {
										return item.guid == sequenceBindings[i]
									})[0]
								}
								return sortedNodes;
							}

							$scope.selectNode = function(node) {
								if (!node.isNodeSelected) {
									$scope.selectedNodes.push(node);
									node.isNodeSelected = !node.isNodeSelected;
									node.showEditQuestionIcon = node.showEditQuestionIcon != undefined ? true
											: node.showEditQuestionIcon;
								} else {
									for (var i = 0; i < $scope.selectedNodes.length; i++) {
										if ($scope.selectedNodes[i].guid == node.guid
												&& (node.showTestWizardIcon || node.showEditQuestionIcon)) {
											$scope.selectedNodes.splice(i, 1);
											node.isNodeSelected = !node.isNodeSelected;
											node.showEditQuestionIcon = node.showEditQuestionIcon != undefined ? false
													: node.showEditQuestionIcon;
											break;
										}
									}
								}
							};

							$scope.$on('handleBroadcast_deselectedNode',
									function(handler, node) {
										$scope.selectNode(node);
									});
							$scope.editQuestion = function(question) {
								for (var i = 0; i < $scope.selectedNodes.length; i++) {
									if ($scope.selectedNodes[i].showEditQuestionIcon) {
										$scope.selectedNodes[i].showEditQuestionIcon = false;
										$rootScope.$broadcast("dropQuestion",
												$scope.selectedNodes[i], 0);
									}
								}
							}
							$scope.questions = [];
							var addToQuestionsArray = function(item) {
								$scope.questions.push(item);
							};
							$scope
									.$on(
											'handleBroadcast_onClickTab',
											function(handler, tab) {
												for (var i = 0; i < $scope.questions.length; i++) {
													$scope.questions[i].isNodeSelected = false;
													$scope.questions[i].showEditQuestionIcon = false;
													for (var j = 0; j < tab.questions.length; j++) {
														if ($scope.questions[i].guid === tab.questions[j].guid) {
															$scope.questions[i].isNodeSelected = true;
															break;
														}
													}
												}
											});
							$scope
									.$on(
											'handleBroadcast_closeTab',
											function(handler, tab) {
												for (var i = 0; i < $scope.questions.length; i++) {
													$scope.questions[i].isNodeSelected = false;
												}
											});
							// evalu8-ui : to set Active Resources Tab , handled
							// in ResourcesTabsController
							$rootScope.$broadcast(
									'handleBroadcast_setActiveResourcesTab',
									EnumService.RESOURCES_TABS.questionbanks);

							// TODO : set container height, need revesit
							$('.question_bank_scrollbar').height(
									($(document).height() - $(
											'.question_bank_scrollbar')
											.offset().top) - 40);

							$scope.openUserSettings = function(step) {
								$modal
										.open({
											templateUrl : 'views/usersettings/usersettingsWizard.html',
											controller : 'usersettingsWizardController',
											size : 'md',
											backdrop : 'static',
											keyboard : false,
											scope : $scope,
											resolve : {
												step : function() {
													return step;
												}
											}
										})
							}

						} ]);