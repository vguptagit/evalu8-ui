'use strict';

angular.module('e8CustomQuestionBanks')

.controller('CustomQuestionBanksController',
    ['$scope', '$rootScope', '$location', '$cookieStore', '$http', '$sce', 'CustomQuestionBanksService', 'EnumService', 'SharedTabService', '$modal', 'TestService',
    function ($scope, $rootScope, $location, $cookieStore, $http, $sce,CustomQuestionBanksService,EnumService,SharedTabService,$modal,TestService) {
  
    	
    //binding all Question format template to the "questionTemplates" Model.
    $scope.questionTemplates=CustomQuestionBanksService.questionTemplates();
        
	$scope.editQuestion = function(question) {		
		 $scope.questionEditAlert(question);
	}
	
	  
	  $scope.questionEditAlert = function(question){
		  if (SharedTabService.tests[SharedTabService.currentTabIndex].IsAnyQstnEditMode) {
				$scope.IsConfirmation = false;
				$scope.message = "A question is already in Edit mode, save it before adding or reordering questions.";
				$modal.open(confirmObject);
				$scope.dragStarted = false;
			}else{
				$rootScope.$broadcast("dropQuestion",
						question.node, 0,"CustomQuestions");				
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
    	if (SharedTabService.tests[SharedTabService.currentTabIndex].IsAnyQstnEditMode) {
			$scope.IsConfirmation = false;
			$scope.message = "A question is already in Edit mode, save it before adding or reordering questions.";
			$modal.open(confirmObject);
			$scope.dragStarted = false;
		}
   });
    
	 //broad casting event when a question template is dropped to the test creation frame.
     $scope.$on('dragEnd', function (event, destParent, source, sourceParent, sourceIndex, destIndex) {
    	 if(source.$treeScope.$element.attr("id")!="Custom-Qstn-tree-root")
    		   return;
     	if($scope.dragStarted) {
    		$scope.dragStarted = false;
    		$rootScope.$broadcast("dropQuestion", source.node,  destIndex, "CustomQuestions");
     	}
     });

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
