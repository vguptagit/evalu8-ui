'use strict';
angular.module('e8MyTests')
.directive("qtiPlayer",['$modal','QtiService','TestService','$sce','$rootScope',
                        function($modal,QtiService,TestService,$sce,$rootScope) {	
	return {
		template : '<ng-include src="getQtiTemplate()"/>',
		restrict : 'E',
		controller : function($scope) {			

			$scope.imagePanelLoaded = false;

			$scope.getQtiTemplate = function() {
				if(typeof($scope.node.qtiModel)=='undefined'){
					$scope.node.qtiModel =  QtiService.getQtiModel($scope.node.data,$scope.node.quizType);
				}  

				switch ($scope.node.quizType) {
				case 'MultipleChoice':
					return "scripts/tmpl/mc.html";
					break;
				case 'MultipleResponse':
					return "scripts/tmpl/mr.html";
					break;
				case 'TrueFalse':
					return "scripts/tmpl/tf.html";
					break;
				case 'Matching':
					return "scripts/tmpl/mf.html";
					break;
				case 'FillInBlanks':
					return "scripts/tmpl/fb.html";
					break;
				case 'Essay':
					return "scripts/tmpl/es.html";
					break;
				default:
				}

			}

			$scope.htmlEditorOptions = {			
					 extraPlugins : 'sharedspace,font,justify,dialog,dialogui,colordialog,button,panelbutton,colorbutton,indent,indentblock,table',
					 toolbar : [
					           ['FontSize','Bold','Italic','Underline','TextColor','JustifyLeft', 'JustifyCenter', 'JustifyRight','Indent','Outdent','Table', 'Undo', 'Redo' ]
					          ],
					fontSize_sizes : '8/8px;9/9px;10/10px;11/11px;12/12px;14/14px;16/16px;18/18px;20/20px;22/22px;24/24px;26/26px;28/28px;30/30px;32/32px',
					fontSize_defaultLabel : '12',					
					allowedContent : true,					
					title : false,
					sharedSpaces : {  top : 'toolbarPlaceholder'  }					
			};


			function destroyEditorInstances() {
				for (var name in CKEDITOR.instances){
					var instance = CKEDITOR.instances[name];
					if (instance) {				     
						delete CKEDITOR.instances[instance]; 
					}
				}		
			}


			$scope.toggleEdit = function(node) {

				if(node.IsEditView){
					destroyEditorInstances();			
				}

				if($scope.updateQstnEditState(node.IsEditView)){
					if($scope.IsAnswerSelected(node)){
						$scope.imagePanelLoaded = false;					

						$scope.node.qstnLinkText = node.IsEditView ? "Edit"
								: "View";
						$scope.node.View = node.IsEditView ? "edit"
								: "print";
						$scope.node.IsEditView = !node.IsEditView;
						$scope.node.IsDefaultEditView = node.IsEditView;
						$scope.parseImageUrl(node);			
					};					
				
				}

				if(!node.IsEditView && !node.qstnTemplate){					
					$scope.node.IsEdited = $scope.IsQuestionModified($scope.node);			
				}
			}
						

			$scope.selectQuestion = function (questionNode) {
				questionNode.isNodeSelected = typeof(questionNode.isNodeSelected)=='undefined'?true:!questionNode.isNodeSelected;
			};

			$scope.parseImageUrl = function(node) {
				if (node.IsEditView) {					
					convertImageToURL(node);
				} else if (!node.IsEditView) {
					convertUrlToImage(node);
				}
			}

			var convertImageToURL = function(node){
				node.qtiModel.Caption = jsonReplaceUL(node.qtiModel.Caption);
				if(node.quizType=='Essay'){
					node.qtiModel.RecommendedAnswer = jsonReplaceUL(node.qtiModel.RecommendedAnswer);
				}else if(node.quizType=='Matching'){
					$.each(node.qtiModel.Options,
							function(index,Option) {
						node.qtiModel.Options[index].option = jsonReplaceUL(Option.option);
						node.qtiModel.Options[index].matchingOption = jsonReplaceUL(Option.matchingOption);
					});							
				}else{
					$.each(node.qtiModel.Options,
							function(index,option) {
						node.qtiModel.Options[index] = jsonReplaceUL(option);
					});
				}

			}

			var convertUrlToImage = function(node){
				node.qtiModel.Caption = QtiService.replaceImage(node.qtiModel.Caption);
				if(node.quizType=='Essay'){
					node.qtiModel.RecommendedAnswer = QtiService.replaceImage(node.qtiModel.RecommendedAnswer);
				}else if(node.quizType=='Matching'){
					$.each(node.qtiModel.Options,
							function(index,Option) {
						node.qtiModel.Options[index].option = QtiService.replaceImage(Option.option);
						node.qtiModel.Options[index].matchingOption = QtiService.replaceImage(Option.matchingOption);
					});						
				}else{					
					$.each(node.qtiModel.Options,
							function(index,option) {
						node.qtiModel.Options[index] = QtiService.replaceImage(option);
					});
				}	

			}

			var jsonReplaceUL = function(content) {
				var htmlText = content.trim().replace(/&nbsp;/, " ");
				var element = $('<p></p>');
				$(element).append(htmlText);

				element.find("img").each(	function(i, obj) {
					var srcUri = $(this).attr("src");
					var slashAarray = srcUri.split('/');
					var file = slashAarray[slashAarray.length - 1];
					var imageAarray = file.split('?');
				//	$(obj).replaceWith($('<a href="'	+ srcUri + '">' + imageAarray[0]	+ '</a>'));
					$(obj).replaceWith($("<u contenteditable='false' url='"	+ srcUri	+ "'><i>"+ imageAarray[0]+ "</i></u>&nbsp;"));
				});

				return element[0].innerHTML;
			}


			var confirmObject = {
					templateUrl : 'views/partials/alert.html',
					controller : 'AlertMessageController',
					windowClass: 'alert-Modal',
					backdrop : 'static',
					keyboard : false,
					resolve : {
						parentScope : function() {
							return $scope;
						}
					}
			};



			$scope.getQuestionIndex = function($index){
				return QtiService.getQuestionIndex($index);
			}


			/** * *************************************************Image Upload ************************************************************/

			$scope.showUploadImage = function(selectedNode,event,targetControlIdentifier) {					
				$scope.imageClicked.imageLoaded=!$scope.imageClicked.imageLoaded;
				if($scope.imageClicked.imageLoaded)
				{
					var p = $(angular.element(document.querySelector("#questionUploadImage"))).detach();
					p.show();
					$(event.target).parents('div.captionContainer').after(p);
				}
			}

			$scope.showUploadImagePanel = function(selectedNode,event,targetControlIdentifier,targetIndex,optionInColumn) {	
				$scope.targetImageControl = 0;
				$scope.targetControlInColumn = '';
				if ($(event.target).parents(targetControlIdentifier).next("#questionUploadImage").length == 1) {
					$scope.imagePanelLoaded=!$scope.imagePanelLoaded;
					return;
				}
				$scope.imagePanelLoaded = true;				
				$scope.targetImageControl = targetIndex + 1 ;
				$scope.targetControlInColumn = optionInColumn ;
				var imagePanel = $(angular.element(document.querySelector("#questionUploadImage"))).detach();
				imagePanel.show();
				$(event.target).parents(targetControlIdentifier).after(imagePanel);		
			}

			$scope.upload = function(files) {
				if (files && files.length) {
					$rootScope.blockPage.start();
					for (var i = 0; i < files.length; i++) {
						var file = files[i];
						TestService
						.uploadImage(file,Option,'CursorPosition',
								function(data,element,cursorPosition) {

							//var html = "<a  href='"	+ data	+ "'>"	+ file.name	+ "</a>";
							var html = "<u contenteditable='false' url='"	+ data	+ "'><i>"+ file.name+ "</i></u>&nbsp;";
						
							$scope.imagePanelLoaded = false;

							var editorData = getEditorContent(html);

							if ($scope.targetImageControl > 0) {							
								if ($scope.node.quizType == "Matching") {
									if ($scope.targetControlInColumn == "ColumnA") {
										$scope.node.qtiModel.Options[$scope.targetImageControl - 1].option = editorData;
									} else if ($scope.targetControlInColumn == "ColumnB") {
										$scope.node.qtiModel.Options[$scope.targetImageControl - 1].matchingOption = editorData;
									}
								} else {
									$scope.node.qtiModel.Options[$scope.targetImageControl - 1] = editorData;
								}

							} else {
								$scope.node.qtiModel.Caption = editorData;
							}
							$rootScope.blockPage.stop();

						});

					}
				}

			}


			function getEditorContent(html){					
				var editor ;
				var i = 0;
				var instanceIndex = 0;
				var name ='';

				if ($scope.targetControlInColumn == "ColumnA") {
					instanceIndex	= ($scope.targetImageControl * 2)  ;
				}else if ($scope.targetControlInColumn == "ColumnB"){
					instanceIndex	= ($scope.targetImageControl * 2) + 1 ;
				}else{
					instanceIndex = $scope.targetImageControl +1;
				}

				if ($scope.targetImageControl > 0) {
					for (var name in CKEDITOR.instances){
						i++;
						if(i==instanceIndex){
							editor = CKEDITOR.instances[name];
							break;			
						}

					}
				}else{
					name = 'questionCaption' ;
					editor = CKEDITOR.instances[name];
				}


				if (editor.mode == 'wysiwyg') {
				
					editor.insertHtml(html);
			
					var range = new CKEDITOR.dom.range(editor.document);				
					range.moveToElementEditablePosition(element, true);
					editor.getSelection().selectRanges([range]);
				}

				return	editor.getData();
			}			


			/** * ***************************************End Image Upload ****************************************************************/			

			// Called when the editor is completely ready.
			$scope.onReady = function (focuseditorindex) {				
				if(focuseditorindex==undefined || focuseditorindex=="0"){					
					var editor = CKEDITOR.instances['questionCaption'];					
					var range = new CKEDITOR.dom.range(editor.document);   
					range.moveToElementEditablePosition( editor.editable(), true ); // bar.^</p>
					editor.getSelection().selectRanges( [ range ] );		
					editor.focus();
				}else{
					var i = 0;	
					var focusIndex = parseInt(focuseditorindex);     			
					for (var name in CKEDITOR.instances){		     				
						if(i==focusIndex){
							CKEDITOR.instances[name].focus();     							
							break;			
						}
						i++;
					}
				}
			};

			// adding options
			$scope.addOption = function($index, node) {
				var optionss = node.qtiModel.Options.length;
				if(node.quizType!='Matching'){
					$scope.node.qtiModel.Options.splice($index + 1, 0, "");
					$scope.focusEditorIndex = $index + 2;
				}else{
					var matchingOptions={option:"",matchingOption:"",optionPlaceHolder:'Enter item '+ String.fromCharCode(65 + $index) +'in column',matchingOptionPlaceHolder:'Enter match in column B for A '+($index+2)};
					$scope.node.qtiModel.Options.splice($index + 1, 0, matchingOptions);
					$scope.focusEditorIndex = (($index * 2) + 1) + 2;						
				}

			}


			// removing options
			$scope.removeOption = function($index,IsCorrectAnswer) {

				if ($scope.node.qtiModel.Options.length > 3
						&& !IsCorrectAnswer) {
					$scope.IsConfirmation = true;
					$scope.message = "Are you sure you want to delete this answer?";
					$modal.open(confirmObject).result
					.then(function(ok) {
						if (ok) {
							
							if($scope.imagePanelLoaded){
								var imagePanel = $(angular.element(document.querySelector("#questionUploadImage"))).detach();
								$scope.$element.find('.questionEditContainer').append(imagePanel);		
							}
							
							$scope.node.qtiModel.Options
							.splice(
									$index,
									1);
							if (jQuery
									.isArray($scope.node.qtiModel.CorrectAnswer)) {
								$scope.node.qtiModel.CorrectAnswer
								.splice(
										$index,
										1);
							} else {
								var correctAnswer = parseInt($scope.node.qtiModel.CorrectAnswer);
								if (correctAnswer > $index) {
									$scope.node.qtiModel.CorrectAnswer = parseInt($scope.node.qtiModel.CorrectAnswer) - 1;
								}

							}

							$scope.onReady(0); 
						
						};
					});
				} else {
					$scope.IsConfirmation = false;
					$scope.message = "Minimum answer required is 3."
						$modal.open(confirmObject);
				}

			}

			$scope.getFbCorrectAnswer = function(node) {
				var textEntryInteraction = [];
				var FbCaption = node.qtiModel.FbCaption;
				var substrings = FbCaption.split("<button");
				var ll = substrings.length - 1;
				for (var i = 1; i < substrings.length; i++) {						
					textEntryInteraction.push(i);
				}
				/*	var $FbCaption1 = FbCaption;
					var FbCaption = $(FbCaption).find("button");

					 (fbCaption).forEach(function (item) {
						if(item.type==2)
						textEntryInteraction.push(1);
					});*/
				return textEntryInteraction;
			}
			// to render Caption of Fill in the blank which contains html content
			$scope.getFbCaptionHTML = function(node) {
				var FbCaption = "";

				var textEntryInteraction1 = '<button data-ng-if="(caption.type==2)" id="$index" onkeydown="return getSpanId(this,event)" class="blankFIBButton">'+
				'<span contenteditable="false" class="blankWidth editView"><b contenteditable="false">$charIndex.</b>Fill Blank</span></button>';

				var textEntryInteraction = '<button data-ng-if="(caption.type==2)" id="$index" onkeydown="return getSpanId(this,event)" class="blankFIBButton">'+
				'<span contenteditable="false" class="blankWidth editView"><b contenteditable="false">$charIndex.</b>Fill Blank</span></button>';

				var textEntryInteractionIndex=0;

				$.each(node.qtiModel.Caption,function(index,captionElement) {
					if(captionElement.type==1){							
						FbCaption = FbCaption + jsonReplaceUL(captionElement.content);
					}else{						
						var textEntry = textEntryInteraction;
						textEntry = textEntry.replace("$index",textEntryInteractionIndex)
						textEntry=textEntry.replace("$charIndex",String.fromCharCode(65 + textEntryInteractionIndex));
						FbCaption = FbCaption + textEntry;
						textEntryInteractionIndex = textEntryInteractionIndex + 1;
					}

				});

				var editor = CKEDITOR.instances['fbCaption'];
				node.qtiModel.FbCaption = FbCaption;
				if (editor.mode == 'wysiwyg') {
					//editor.insertHtml(FbCaption);
				}			


				var fg = editor.getData();
				return editor.getData();

			}
		}

	};
}] )

.directive('questionMetadata', function() {
	return {
		restrict: 'A',      
		replace: true,
		templateUrl: 'views/partials/question-metadata.html'
	};
});