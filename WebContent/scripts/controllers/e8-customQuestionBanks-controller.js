'use strict';

angular.module('e8CustomQuestionBanks')

.controller('CustomQuestionBanksController',
    ['$scope', '$rootScope', '$location', '$cookieStore', '$http', '$sce','CustomQuestionBanksService','EnumService', 
    function ($scope, $rootScope, $location, $cookieStore, $http, $sce,CustomQuestionBanksService,EnumService) {
  
    	
    //binding all Question format template to the "questionTemplates" Model.
    $scope.questionTemplates=CustomQuestionBanksService.questionTemplates();
        
    
    
    
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
   		$scope.$broadcast("beforeDropQuestion");     
   });
    
	 //broad casting event when a question template is dropped to the test creation frame.
     $scope.$on('dragEnd', function (event, destParent, source, sourceParent, sourceIndex, destIndex) {
    	 if(source.$treeScope.$element.attr("id")!="Custom-Qstn-tree-root")
    		   return;
     	if($scope.dragStarted) {
    		$scope.dragStarted = false;
    		$scope.$broadcast("dropQuestion", source.node,  destIndex, "CustomQuestions");
     	}
     });

   //to set Active Resources Tab , handled in ResourcesTabsController
   $rootScope.$broadcast('handleBroadcast_setActiveResourcesTab', EnumService.RESOURCES_TABS.customquestions);
     
    
}]);
