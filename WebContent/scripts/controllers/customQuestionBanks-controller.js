'use strict';

angular.module('e8CustomQuestionBanks')

.controller('CustomQuestionBanksController',
    ['$scope', '$rootScope', '$location', '$cookieStore', '$http', '$sce', 'CustomQuestionBanksService', 'EnumService', 'SharedTabService', '$modal', 'TestService','CommonService',
    function ($scope, $rootScope, $location, $cookieStore, $http, $sce,CustomQuestionBanksService,EnumService,SharedTabService,$modal,TestService,CommonService) {
  
    	
    //binding all Question format template to the "questionTemplates" Model.
    $scope.questionTemplates=CustomQuestionBanksService.questionTemplates();
        
	$scope.editQuestion = function(question) {		
		 $rootScope.blockPage.start();
		 $scope.questionEditAlert(question);
		 $rootScope.blockPage.stop();
	}
	
$scope.treeOptions = {
            
            beforeDrag: function (sourceNodeScope) {
                if(sourceNodeScope.node.hasOwnProperty('draggable') && sourceNodeScope.node.draggable == false) {
                    sourceNodeScope.$$apply = false;
                    return false;
                }    
                return true;
            },
            dragMove: function(e) {
                $scope.dragStarted = true;
            },
            dragStart: function(e) {
            	$('body *').css({'cursor':'url("images/grabbing.cur"), move'});
            },
            dragStop: function(e) {
            	$('body *').css({'cursor':''});
            },
            beforeDrop: function(e) {
                                                 
                var destination = e.dest.nodesScope;

                var editModeQuestions=$(destination.$parent.$element).find("li[printmode=false]");

                if(editModeQuestions.length>0 && destination.$parent.controller =="TestCreationFrameController"){
                    $scope.dragStarted = false;
                    e.source.nodeScope.$$apply = false;
                    $rootScope.$broadcast('beforeDrop');
                }
                
                if (SharedTabService.tests[SharedTabService.currentTabIndex].isTestWizard) {
                    $scope.IsConfirmation = false;
                    $scope.message = "A Custom Question cannot be added to the TEST Wizard.";
                    $modal.open(confirmObject);
                    $scope.dragStarted = false;
                    e.source.nodeScope.$$apply = false;
                }

                var IsTargetAreaInScope=false;     
                if(angular.element(e.target).hasClass('angular-ui-tree')) {
                    IsTargetAreaInScope = true;                  
                }                      

                if( !IsTargetAreaInScope && 
                        (destination.$parent &&  
                                (
                                        $(destination.$parent.$element).find("ol").attr('droppable') == 'false' ||
                                        $(destination.$parent.$element).closest("ol").attr('droppable') == 'false'
                                )                              
                        )
                ) {

                    e.source.nodeScope.$$apply = false;
                }

            },
            dropped: function(e) {
                
                var destParent = e.dest.nodesScope.$parent;
                var source = e.source.nodeScope;
                var sourceParent = e.source.nodeScope.$parentNodeScope;
                var sourceIndex = e.source.index;
                var destIndex = e.dest.index;
                var prev = e.dest.nodesScope.childNodes()[destIndex-1];
                var next = e.dest.nodesScope.childNodes()[destIndex+1];                                        
                
            	if(destParent.controller == "TestCreationFrameController" 
            		&& SharedTabService.tests[SharedTabService.currentTabIndex].questions 
            		&& SharedTabService.tests[SharedTabService.currentTabIndex].questions.length) {
            		SharedTabService.tests[SharedTabService.currentTabIndex].questions.splice(destIndex, 1)
            	}
            	
                $scope.dragEnd(e, destParent, source, sourceParent,
                          sourceIndex, destIndex, prev, next);     
            }
          };
	  
	  $scope.questionEditAlert = function(question){
		  if (SharedTabService.tests[SharedTabService.currentTabIndex].IsAnyQstnEditMode) {
				$scope.IsConfirmation = false;
				$scope.message = "A question is already in Edit mode, save it before adding or reordering questions.";
				$modal.open(confirmObject);
				$scope.dragStarted = false;
			}
		  else if (SharedTabService.tests[SharedTabService.currentTabIndex].isTestWizard) {
				$scope.IsConfirmation = false;
				$scope.message = "A Custom Question cannot be added to the TEST Wizard.";
				$modal.open(confirmObject);
				$scope.dragStarted = false;
			}else{				
				$rootScope.$broadcast("dropQuestion",
						question.node, 0,"CustomQuestions","clickEvnt");				
			}	
	  }

    
	var confirmObject = {
			templateUrl : 'views/partials/alert.html',
			controller : 'AlertMessageController',
			backdrop : 'static',
			keyboard : false,
			resolve : {
				parentScope : function() {
					return $scope;
				}
			}
		};
    
    //Rendering the question as html        
    $scope.getCustomQuestionHTML = function (datanode) {
        if (datanode.node.length) {
            return $sce.trustAsHtml(datanode.node[0].innerHTML);
        } else if (datanode.node) {
            return $sce.trustAsHtml(datanode.node.textHTML);
        }
    }
    
    $scope.dragStarted = false;
    
    $scope.$on('dragStarted', function () {
        $scope.dragStarted = true;
    });
    
    $scope.$on('beforeDrop', function (event) {

    	if (SharedTabService.tests[SharedTabService.currentTabIndex].isTestWizard) {
			$scope.IsConfirmation = false;
			$scope.message = "A Custom Question cannot be added to the TEST Wizard.";
			$modal.open(confirmObject);
			$scope.dragStarted = false;
		}
   });
    
	 //broad casting event when a question template is dropped to the test creation frame.
     $scope.dragEnd = function (event, destParent, source, sourceParent, sourceIndex, destIndex) {
    	 if(source.$treeScope.$element.attr("id")!="Custom-Qstn-tree-root")
    		   return;
     	if($scope.dragStarted) {
    		$scope.dragStarted = false;    		
    		$rootScope.$broadcast("dropQuestion", source.node,  destIndex, "CustomQuestions","dragEvnt");
     	}
     };

   //to set Active Resources Tab , handled in ResourcesTabsController
     $rootScope.$broadcast('handleBroadcast_setActiveResourcesTab', EnumService.RESOURCES_TABS.customquestions);

     $scope.$on('handleBroadcast_AddNewTest', function (handler, newTest, containerFolder, isEditMode, oldGuid, editedQuestions, editedMigratedQuestions, createdTab, testCreationFrameScope) {

         if (isEditMode) {
             if (createdTab.isSaveAndClose) {
                 SharedTabService.closeTab(createdTab, testCreationFrameScope);
                 SharedTabService.removeMasterTest(createdTab);
             } else {
                 SharedTabService.removeMasterTest(createdTab);
                 SharedTabService.addMasterTest(createdTab);
             }
             return false;
         }
         
         TestService.getMetadata(newTest.guid, function (test) {
        	 if(test==null){
        		 CommonService.showErrorMessage(e8msg.error.cantFetchMetadata);
         		return;
        	 }
             test.nodeType = "test";
             createdTab.metadata = TestService.getTestMetadata(test);
             createdTab.treeNode = null;

             if (createdTab.isSaveAndClose) {
                 SharedTabService.closeTab(createdTab, testCreationFrameScope);
                 SharedTabService.removeMasterTest(createdTab);
             } else {
                 SharedTabService.removeMasterTest(createdTab);
                 SharedTabService.addMasterTest(createdTab);
             }
         });
     });
    
}]);
