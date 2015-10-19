'use strict';
angular.module('e8MyTests')
.directive("printQtiPlay",['QtiService','$sce',
                        function(QtiService,$sce) {	
	return {
		template : '<ng-include src="getPrintQtiTemplate()"/>',
		restrict : 'E',
		controller : function($scope) {			

			$scope.imagePanelLoaded = false;

			$scope.getTrustedHTML = function(html_code) {
			    return $sce.trustAsHtml(html_code);
			}
			
			
			$scope.getPrintQtiTemplate = function() {
				if((typeof($scope.node.qtiModel)=='undefined') && !(typeof($scope.node.data)=='undefined')){
				    $scope.node.qtiModel = QtiService.getQtiModel($scope.node.data, $scope.node.quizType);
				}  

				switch ($scope.node.quizType) {
				case 'MultipleChoice':
					return "views/editortmpl/mc.html";
					break;
				case 'MultipleResponse':
					return "views/editortmpl/mr.html";
					break;
				case 'TrueFalse':
					return "views/editortmpl/tf.html";
					break;
				    case 'Matching':
				        randomizeChoice($scope.node.qtiModel);
					return "views/editortmpl/mf.html";
					break;
				case 'FillInBlanks':
					return "views/editortmpl/fb.html";
					break;
				case 'Essay':
					return "views/editortmpl/es.html";
					break;
				default:
				}

			}
			var randomizeChoice = function (qtiModel) {
			    if (!qtiModel.isRandomize) {
			        var options = angular.copy(qtiModel.Options);
			        options.sort(function (a, b) { return Math.random() - 0.5; });
			        for (var i = 0; i < qtiModel.Options.length; i++) {
			            qtiModel.Options[i].matchingOption = options[i].matchingOption;
			        }
			        qtiModel.isRandomize = true;
			    }
			}
			$scope.getQuestionIndex = function ($index) {
			    return QtiService.getQuestionIndex($index);
			}
			$scope.getPrintModeFbCaption = function (fbCaption) {
			    var htmlText = fbCaption.trim().replace(/&nbsp;/, " ");
			    var element = $('<p></p>');
			    $(element).append(htmlText);
			    element.find("button").each(function (i, obj) {
			    	var blankSpace;
			    	switch($scope.node.qtiModel.BlankSize){
			    	case "100":
			    		blankSpace = "____________________________________________________________________________________________________";
			    		break;
			    	case "50":
			    		blankSpace = "__________________________________________________";
			    		break;
			    	default:
			    		blankSpace = "____________________";
			    	}
			        $(obj).replaceWith(blankSpace);
			    });
			    return $sce.trustAsHtml(element[0].innerHTML);
			}

			$scope.getFbAnswerOption = function () {
			    return $sce.trustAsHtml($scope.node.qtiModel.CorrectAnswerHtml);
			}
			
			$scope.setEssayPageSize = function (qtiModel) {
			    var EssayPageSize = parseInt(qtiModel.EssayPageSize) * 20;
			    return {"padding-bottom": EssayPageSize}
			}
		}

	};
}] )