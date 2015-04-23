'use strict';

angular.module('e8QuestionBanks')

.controller('QuestionBanksController',
    ['$scope', '$rootScope', '$location', '$cookieStore', '$http', '$sce', 'DisciplineService', 'TestService', 'SharedTabService','EnumService',
function ($scope, $rootScope, $location, $cookieStore, $http, $sce, DisciplineService, TestService, SharedTabService,EnumService) {
        SharedTabService.selectedMenu = SharedTabService.menu.questionBanks;
        $rootScope.globals = $cookieStore.get('globals') || {};
        var config = {
            headers: {
                'x-authorization': $rootScope.globals.authToken,
                'Accept': 'application/json;odata=verbose'
            }
        };
        $scope.selectedNodes = [];
        $scope.$on('dragEnd', function (event, destParent, source, sourceParent, sourceIndex, destIndex) {
            $scope.$broadcast("dropQuestion", source, destIndex);
        });

        $scope.isTestWizard = false;
        //Broadcast from SharedTabService.onClickTab()
        $scope.$on('handleBroadcastCurrentTabIndex', function () {
            $scope.currentIndex = SharedTabService.currentTabIndex;
            $scope.isTestWizard = SharedTabService.tests[SharedTabService.currentTabIndex].isTestWizard;
        });

        //Fetch user disciplines and populate the drop down			
        DisciplineService.userDisciplines(function (userDisciplines) {

            $scope.disciplines = userDisciplines;

            DisciplineService.disciplineDropdownOptions(userDisciplines, "Question Banks", function (disciplinesOptions, selectedValue) {

                $scope.disciplinesOptions = disciplinesOptions;
                $scope.selectedValue = selectedValue;
            });
        });


        $scope.disciplineFilterChange = function (option) {

            $scope.disciplines = DisciplineService.disciplineDropdownChange(option);
        }

        $scope.testTitle = "New Test";
        //Function is to save the Test details with the questions.

        //To get books for the given discipline.
        //This method will call the api mytest/books?discipline to get the books
        //and append the collection to input discipline angularjs node
        $scope.getBooks = function (discipline) {
            //var blockLeftpanel = blockUI.instances.get('BlockLeftpanel');

            if ($rootScope.globals.authToken == '') {
                $location.path('/login');
            } else {

                if (!discipline.collapsed) {
                    discipline.collapse();
                }
                else {
                    //blockLeftpanel.start();
                    discipline.expand();

                    var ep = evalu8config.host + "/books?discipline=" + discipline.node.item;

                    $http.get(ep, config).success(
							function (response) {
							    discipline.node.nodes = response;
							    //blockLeftpanel.stop();
							});
                }
            }
        }

        //To get the Chapters for the given book
        //This method will call the api mytest/books/{bookid}/nodes.
        //Output collection will be append to input book angularjs node.
        $scope.getNodes = function (book) {
            //$scope.selectedNodes=[];
            $scope.bookID = book.node.guid;
            if ($rootScope.globals.authToken == '') {
                $location.path('/login');
            } else {
                if (!book.collapsed) {
                    book.collapse();
                    book.$element.find("input").attr("src", "images/right_arrow2.png");
                }
                else {
                    book.expand();
                    book.$element.find("input").attr("src", "images/right_arrow.png");
                    $http.get(
							evalu8config.host + "/books/"
									+ book.node.guid
									+ "/nodes", config).success(
							function (response) {
							    book.node.nodes = response;
							    angular
								.forEach(book.node.nodes, function (item) {
								    item.showTestWizardIcon = true;
								    item.isNodeSelected = false;
								    item.nodeType = "chapter";
								})
							});
                }
            }
        }
        //TODO : need to move this to service.
        $scope.createTestWizardCriteria = function (currentNode) {
            if (!SharedTabService.isTestWizardTabPresent) {
                $rootScope.$broadcast('handleBroadcast_AddTestWizard');
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
            if (SharedTabService.isErrorExist(currentNode.node, $scope.selectedNodes)) {
                SharedTabService.TestWizardErrorPopup_Open();
                return false;
            }
            for (var i = 0; i < $scope.selectedNodes.length; i++) {
                currentNode = $scope.selectedNodes[i];
                if (currentNode.showTestWizardIcon) {
                    currentNode.showTestWizardIcon = false;
                    getQuestions(currentNode);
                }
            }
        }
        function getQuestions(currentNode) {
            $http
			.get(
					evalu8config.host
							+ "/books/"
							+ currentNode.bookid
							+ "/nodes/"
							+ currentNode.guid
							+ "/questions?flat=1", config)
			.success(
					function (response) {
					    $scope.$broadcast("handleBroadcast_createTestWizardCriteria", response, currentNode);
					})
			.error(function () {
			    SharedTabService.addErrorMessage(currentNode.title, SharedTabService.errorMessageEnum.NoQuestionsAvailable);
			    SharedTabService.TestWizardErrorPopup_Open();
			    currentNode.showTestWizardIcon = true;
			    currentNode.isNodeSelected = false;
			})
        }

        //To get the topics, subtopics, question for the given chapter.
        //This method will call the api mytest/books/{bookid}/nodes/{nodeid}/nodes
        //and mytest/books/{bookid}/nodes/{nodeid}/questions.
        //Output topic,subtopic and question collection will be append to input chapter angularjs node
        $scope.getNodesWithQuestion = function (currentNode) {
            //var blockLeftpanel = blockUI.instances.get('BlockLeftpanel');
            if ($rootScope.globals.authToken == '') {
                $location.path('/login');
            } else {
                if (!currentNode.collapsed) {
                    currentNode.collapse();
                    $(currentNode.$element).find(".captiondiv").removeClass('iconsChapterVisible');
                    currentNode.$element.children(1).removeClass('expandChapter');
                    currentNode.$element.find("input").attr("src", "images/right_arrow2.png");
                }
                else {
                    //blockLeftpanel.start();
                    currentNode.expand();
                    currentNode.$element.find("input").attr("src", "images/down_arrow.png");
                    currentNode.node.nodes = [];
                    $http
					.get(
							evalu8config.host
									+ "/books/"
									+ $scope.bookID
									+ "/nodes/"
									+ currentNode.node.guid
									+ "/nodes", config)
					.success(
							function (response) {

							    currentNode.node.nodes = currentNode.node.nodes.concat(response);

							    angular
										.forEach(
												currentNode.node.nodes,
												function (item) {
												    item.template = 'nodes_renderer.html';
												    item.showTestWizardIcon = true;
												    item.isNodeSelected = false;
												    item.nodeType = "topic";
												})
							    //blockLeftpanel.stop();
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
							function (response) {

							    var responseQuestions = response;
							    $(currentNode.$element).find(".captiondiv").addClass('iconsChapterVisible');
							    currentNode.$element.children(0).addClass('expandChapter');

							    var sortedNodes = sortNodes(response, currentNode);

							    currentNode.node.nodes = currentNode.node.nodes.concat(sortedNodes);

							    angular
										.forEach(
												responseQuestions,
												function (item) {
												    item.nodeType = "question";
												    $scope
															.renderQuestion(
																	item
																	);
												})
							    //blockLeftpanel.stop();

							})
							.error(function () {
							    //blockLeftpanel.stop(); 
							});;
                }
            }
        }

        //This method will be called from callback function of question api.
        //This will call api mytest/books/{bookid}/nodes/{nodeid}/questions/{guid}.
        //Out put of this api will be rendered as html and append to chapter angularjs node.
        $scope.renderQuestion = function (item) {

            //qti player initialisation
            QTI.initialize();

            $http
					.get(evalu8config.host + "/questions/"
							+ item.guid, config)
					.success(
							function (response) {
								 item.data=response;
							    var displayNode = $("<div></div>")
							    QTI.play(response,
										displayNode,false,false);
							   
							    item.textHTML = displayNode
										.html();
							    item.template = 'questions_renderer.html';

							})

        };

        // Converts object to query string
        $scope.o2qs = function (o) {
            var qs = [];
            for (var x in o) {
                qs.push(x + '=' + o[x]);
            }
            return qs.join('&');
        };

        //Rendering the question as html
        $scope.getHTML = function (datanode) {
            if (datanode.node.length) {
                return $sce.trustAsHtml(datanode.node[0].innerHTML);
            } else if (datanode.node) {
                return $sce.trustAsHtml(datanode.node.textHTML);
            }
        }

        //Sorting questions based on the questionbindings property of the container
        var sortNodes = function (response, currentNode) {
            var sequenceBindings = currentNode.node.questionBindings;
            var sortedNodes = new Array(sequenceBindings.length);
            for (var i = 0; i < sequenceBindings.length; i++) {
                sortedNodes[i] = $.grep(response, function (item) {
                    return item.guid == sequenceBindings[i]
                })[0]
            }
            return sortedNodes;
        }



        $scope.selectNode = function (node) {
            if (!node.isNodeSelected) {
                $scope.selectedNodes.push(node);
                node.isNodeSelected = !node.isNodeSelected;
            }
            else {
                for (var i = 0; i < $scope.selectedNodes.length; i++) {
                    if ($scope.selectedNodes[i].guid == node.guid && node.showTestWizardIcon) {
                        $scope.selectedNodes.splice(i, 1);
                        node.isNodeSelected = !node.isNodeSelected;
                        break;
                    }
                }
            }
        };

        $scope.$on('handleBroadcast_deselectedNode', function (handler, node) {
            $scope.selectNode(node);
        });

        // evalu8-ui new code
        //to set Active Resources Tab , handled in ResourcesTabsController
        $rootScope.$broadcast('handleBroadcast_setActiveResourcesTab', EnumService.RESOURCES_TABS.questionbanks);
    }]);