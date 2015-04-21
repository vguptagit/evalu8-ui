'use strict';

angular.module('e8CustomQuestionBanks')

.controller('CustomQuestionBanksController',
    ['$scope', '$rootScope', '$location', '$cookieStore', '$http', '$sce', 'CustomQuestionBanksService', 'EnumService',
    function ($scope, $rootScope, $location, $cookieStore, $http, $sce, CustomQuestionBanksService, EnumService) {
  
    	
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
    
    

	 //broad casting event when a question template is dropped to the test creation frame.
     $scope.$on('dragEnd', function (event, destParent, source, sourceParent, sourceIndex, destIndex) {
     	$scope.$broadcast("dropQuestion", source,  destIndex, "CustomQuestions");
     });

     
        // evalu8-ui new code
        //to set Active Resources Tab , handled in ResourcesTabsController
     $rootScope.$broadcast('handleBroadcast_setActiveResourcesTab', EnumService.RESOURCES_TABS.customquestions);
     
     
    
}]);
