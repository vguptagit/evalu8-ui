'use strict';
angular.module('e8MyTests')
.directive("qtiPlayer",['$modal','QtiService','TestService','$sce','$rootScope','$timeout',
                        function($modal,QtiService,TestService,$sce,$rootScope,$timeout) {	
	return {
		template : '<ng-include src="getQtiTemplate()"/>',
		restrict : 'E',
		controller : function($scope) {			

			$scope.imagePanelLoaded = false;

			$scope.getQtiTemplate = function() {
				if((typeof($scope.node.qtiModel)=='undefined') && !(typeof($scope.node.data)=='undefined')){
					$scope.node.qtiModel =  QtiService.getQtiModel($scope.node.data,$scope.node.quizType);
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

			$scope.htmlEditorOptions = {			
					 extraPlugins : 'sharedspace,font,justify,dialog,dialogui,colordialog,button,panelbutton,colorbutton,indent,indentblock,table,tableresize,tabletools,contextmenu,menu',
					 toolbar : [
					           ['FontSize','Bold','Italic','Underline','TextColor','JustifyLeft', 'JustifyCenter', 'JustifyRight','Indent','Outdent','Table', 'Undo', 'Redo' ]
					          ],
					 fontSize_sizes : '8/11px;9/12px;10/13px;11/15px;12/16px;14/19px;16/22px;18/24px;20/26px;22/29px;24/32px;26/35px;28/37px;30/40px;32/42px',
					 font_defaultLabel : 'Helvetica',					
					 allowedContent : true,					
					 title : false,
					 enterMode:CKEDITOR.ENTER_P,
					 language : 'en',
					 sharedSpaces : {  top : 'toolbarPlaceholder'  },
					 coreStyles_bold : { element : 'b', overrides : 'strong' }				
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
					if( ($scope.IsAnswerSelected(node)) && ($scope.IsFibBlankAdded(node)) ){
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
				}else if(node.quizType=='FillInBlanks'){				
					//node.qtiModel.CorrectAnswerHtml = $('#fbAnswerContainer').html();
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
				}else if(node.quizType=='FillInBlanks'){
					node.qtiModel.Caption = QtiService.replaceImage($('#questionCaption').html());
					node.qtiModel.CorrectAnswerHtml = $('#fbAnswerContainer').html();
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
				$scope.targetImageControl = targetIndex + 1 ;
				$scope.targetControlInColumn = optionInColumn ;
				if ($(event.target).parents(targetControlIdentifier).next("#questionUploadImage").length == 1) {
					$scope.imagePanelLoaded=!$scope.imagePanelLoaded;
					return;
				}
				$scope.imagePanelLoaded = true;				
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
				
					if((editor.getData() == "") || (editor.name == "questionCaption")){				
						editor.insertHtml(html);
					}else{						

						var hasImage = (editor.getData().indexOf('<u'));
						if(hasImage!= -1){
							var prevImg = editor.getData().substring((editor.getData().indexOf('<u')),((editor.getData().indexOf('</u>'))+10));	
						}

						editor.insertHtml(html);

						if(prevImg.length > 0){
							var remContent = editor.getData().replace(prevImg,'');					
							editor.setData(remContent);
						}
					}
			
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
							var optionEditor = CKEDITOR.instances[name];		
							var optionRange = new CKEDITOR.dom.range(optionEditor.document);   
							optionRange.moveToElementEditablePosition( optionEditor.editable(), true ); 
							optionEditor.getSelection().selectRanges( [ optionRange ] );		
							optionEditor.focus();	
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
			
			
			/******************************************************************************FB-Question*********************************************/
			
			$scope.captionFocus = false;				

			$scope.focusFIBcaption = function () {
				$('#questionCaption').focus();
				$('#questionCaption').on('focus', function(){
					$scope.captionFocus = false;
					$('#questionCaption').trigger('click');		
				
				});
				
				$('#questionCaption').on('blur', function(){
					$scope.captionFocus = true;	
				});
				
				$('#questionCaption').on('click', function(){
					$scope.captionFocus = false;
				});
			}

			$scope.addBlank = function(scope, event){			

				var textEntryInteraction = '<button  data-ng-if="(caption.type==2)" id="RESPONSE_$index" onkeydown="return getSpanId(this,event)" class="blankFIBButton">'+
				'<span contenteditable="false" class="blankWidth editView"><b contenteditable="false">$charIndex.</b>Fill Blank</span></button> &nbsp;';

				var blankCount = scope.$element.find("#questionCaption").eq(0).find("button").length;
				blankCount = blankCount + 1;
				var qtiCaption = scope.$element.find("#questionCaption").eq(0);

				textEntryInteraction = textEntryInteraction.replace("$index",blankCount);
				textEntryInteraction = textEntryInteraction.replace("$charIndex",String.fromCharCode(65 + blankCount -1));
				var editor = CKEDITOR.instances['questionCaption'];	

				if (editor.mode == 'wysiwyg') {				
					$timeout(function() {
						editor.insertHtml(textEntryInteraction)
					}, 300);

					var htmlEle =scope.$element.find('#crtAns').children().eq(0);
					htmlEle.append($("<div class='editView editablediv crtAnsDiv fbansw' type='text' id='RESPONSE_"+blankCount+"' >"+String.fromCharCode(65 + blankCount-1)+".<div contenteditable='true' class='placeHolderForBlank' data-placeholder='Enter the correct answer for blank "+ String.fromCharCode(65 + blankCount-1 ) +"'></div></div>"));

				}			

			}

			$scope.getPrintModeFbCaption = function(fbCaption){
				var htmlText = fbCaption.trim().replace(/&nbsp;/, " ");
				var element = $('<p></p>');
				$(element).append(htmlText);
				element.find("button").each(	function(i, obj) {
					$(obj).replaceWith("<span class='blank'> _____________________ </span>");
				});			
				return $sce.trustAsHtml( element[0].innerHTML);			
			}

			$scope.getFbAnswerOption = function(){				
				return $sce.trustAsHtml($scope.node.qtiModel.CorrectAnswerHtml);			
			}

			$scope.updateFIBanswer = function(){				
				var blankButtons = $('#questionCaption').find('.blankFIBButton');
				var answers = $('#fbAnswerContainer').find('.crtAnsDiv');
				var difference = [];

				jQuery.grep(answers, function(answ) {		
					var blankPresent = false;					
					blankButtons.each(function(i,blankItem){
						if(blankItem.id == answ.id){
							blankPresent=true;			    			
							return true;
						}
					});		

					if(!blankPresent)
						difference.push(answ.id);
				});

				difference.forEach(function(blankId){
					$('#fbAnswerContainer').find('#'+blankId).remove();
				});		
			}

			$scope.removeFIBblanks = function(spanElement, event){

				var qtiCationElement;
				var blankElement;	
				var spanElement = event.target;
				var elementType = event.target.nodeName;
				var elementID = event.target.id;

				if(event.keyCode == 46 || event.keyCode == 8){
					if(elementType == "BUTTON"){
						qtiCationElement = $(spanElement.parentElement.parentElement);
						blankElement = $(spanElement);			

						event.stopPropagation();	
						$(spanElement).remove();					
					}
					else{
						var cursor = QTI.getCaretPosition(spanElement);
						var val =  $(spanElement).text();

						if($(spanElement).attr("id") == "questionCaption")
							qtiCationElement = $(spanElement)
							else
								qtiCationElement = $(spanElement).parents("#questionCaption").eq(0);
						if(cursor == qtiCationElement.text().length)
							if(spanElement.innerHTML.lastIndexOf("</button>") + "</button>&nbsp;<br></p>".length == spanElement.innerHTML.length)
							{
								blankElement = $(spanElement).find("button:last-child").eq(0);
								$(spanElement).find("button:last-child").eq(0).remove();
							}
						
						if(spanElement.innerHTML.lastIndexOf("</button>") + "</button>&nbsp;</p>".length == spanElement.innerHTML.length)
						{
							blankElement = $(spanElement).find("button:last-child").eq(0);
							$(spanElement).find("button:last-child").eq(0).remove();
						}
					}
					if(blankElement != null)
						if(blankElement.length > 0){
							var index = blankElement.attr("id").substring(9,blankElement.attr("id").length);
							index = parseInt(index);						
							qtiCationElement.parent().parent().find("#crtAns").children().children().eq(index-1).remove();
							for(var i = index-1; i<qtiCationElement.find("button").length; i++)
							{
								var button = qtiCationElement.find("button").eq(i);
								button.attr("id","RESPONSE_" + (i));
								button.find("b").eq(0).text(String.fromCharCode(65 + i ) + ".");

								var crtAnswer = qtiCationElement.parent().parent().find("#crtAns").children().children().eq(i);
								crtAnswer.attr("id","RESPONSE_" + (i+1));
								crtAnswer.children().eq(0).attr("data-placeholder","Enter the correct answer for blank "+String.fromCharCode(65 + i ));
								crtAnswer.html(String.fromCharCode(65 + i ) + "." + crtAnswer.children().get(0).outerHTML);
							}

							if(spanElement.tagName == "BUTTON")
								return false;
							else
								return true;
						}


					var range = window.getSelection().getRangeAt(0);

					if(event.keyCode == 8 && (range.startOffset == 0 || range.startOffset == 1) && range.startContainer.previousSibling)

						if(range.startContainer.previousSibling.tagName == "BUTTON"){
							blankElement = $(range.startContainer.previousSibling);
							var index = blankElement.attr("id").substring(9,blankElement.attr("id").length);
							index = parseInt(index);
							$(blankElement).remove();						
							qtiCationElement.parent().parent().find("#crtAns").children().children().eq(index - 1).remove();
							for(var i = index-1; i<qtiCationElement.find("button").length; i++)
							{
								qtiCationElement.find("button").eq(i).attr("id","RESPONSE_" + (i));
								qtiCationElement.find("button").eq(i).find("b").eq(0).text(String.fromCharCode(65 + i ) + ".");

								var crtAnswer = qtiCationElement.parent().parent().find("#crtAns").children().children().eq(i);
								crtAnswer.attr("id","RESPONSE_" + (i+1));
								crtAnswer.children().eq(0).attr("data-placeholder","Enter the correct answer for blank "+String.fromCharCode(65 + i ));
								crtAnswer.html(String.fromCharCode(65 + i ) + "."+ crtAnswer.children().get(0).outerHTML);
							}
							return false;
						}						

					if(spanElement.tagName == "BUTTON"){
						return false;
					}
				}

			}
			
/****************************************************************************************FbQuestion End **********************************************************/
		}

	};
}] )

.directive('questionMetadata', function() {
	return {
		restrict: 'A',      
		replace: true,
		templateUrl: 'views/partials/question-metadata.html',
		controller : function($scope) {			
			$scope.qstnBlankSize = function(selectedNode,
					blankSize) {
				selectedNode.node.qtiModel.BlankSize = blankSize;
			}
		}
	};
});