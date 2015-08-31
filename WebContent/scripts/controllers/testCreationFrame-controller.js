'use strict';

angular
		.module('e8MyTests')

		.controller(
				'TestCreationFrameController',
				[
						'$scope',
						'$rootScope',
						'$location',
						'$cookieStore',
						'$http',
						'$sce',
						'TestService',
						'SharedTabService',
						'$modal',
						'notify',
						'$compile',
						'directiveQtiService', 'EnumService', 'UserService', 'CommonService','blockUI','QtiService',
						function($scope, $rootScope, $location, $cookieStore,
								$http, $sce, TestService, SharedTabService,
								$modal, notify, $compile, directiveQtiService, EnumService, UserService, CommonService,blockUI,QtiService) {

							// $scope.tree2 =
							// SharedTabService.tests[SharedTabService.currentTabIndex].questions;
							$scope.isDeleteAnswerClicked=false;
							$scope.isBlockQuoteClicked=false;
							$scope.controller = EnumService.CONTROLLERS.testCreationFrame;
							$scope.tests = SharedTabService.tests;							
							
							$scope.currentIndex = SharedTabService.currentTabIndex;
							$scope.criterias = SharedTabService.tests[SharedTabService.currentTabIndex].criterias;
							$scope.captionFocus = true;
							
							if (SharedTabService.userQuestionSettings.length == 0){
								UserService.userQuestionMetadata(function(userQuestionMetadata){
									if(userQuestionMetadata==null){
										CommonService.showErrorMessage(e8msg.error.cantFetchMetadata)
				            			return;
									}
										$.each(userQuestionMetadata, function(index, item){	
												SharedTabService.userQuestionSettings.push(item);						

										});
							
								});
						}

							
							// $scope.isTestWizardTabPresent = false;
							$scope.sharedTabService = SharedTabService;
							$scope.enumService = EnumService;

							/**
							 * ***************************************Start
							 * Question edit
							 * ***************************************
							 */
							$scope.showQstnEditIcon = false;
							$scope.closeQstnBtn = false;
							
							/**************************** Begin Html Editor Changes **********************************/
							$scope.updateQstnEditState = function(qstnState) {								
								if(!qstnState && SharedTabService.tests[SharedTabService.currentTabIndex].IsAnyQstnEditMode){
									$scope.IsConfirmation = false;
									$scope.message = "A question is already in Edit mode, save it before editing another question.";

									$modal.open(confirmObject);

									return false;
									
								}else if(qstnState) { //switching from View to Edit mode
									SharedTabService.tests[SharedTabService.currentTabIndex].IsAnyQstnEditMode = false;
									return true;
								}else if(!qstnState) { //switching from Edit to View mode
									SharedTabService.tests[SharedTabService.currentTabIndex].IsAnyQstnEditMode = true;
									return true;
								}								
								
							}
							
							$scope.getTrustedHTML = function(html_code) {
							    return $sce.trustAsHtml(html_code);
							}
							
							/**************************** End of Html Editor Changes **********************************/

							$scope.hoverIn = function(selectedQstn) {
								this.showQstnEditIcon = true;
								this.closeQstnBtn = true;
							};
							$scope.hoverOut = function() {
								this.showQstnEditIcon = false;
								this.closeQstnBtn = false;
							};
							
							$scope.selectQuestionNode = function (selectedQstn) {
								selectedQstn.isNodeSelected = typeof(selectedQstn.isNodeSelected)=='undefined'?true:!selectedQstn.isNodeSelected;
							};
							
							$scope.showChoiceSelectionAlert = function(selectedQstnNode) {
								var isAnswerChoiceSelected=false;
								var qstnHTML = $(selectedQstnNode.$element);
								var optionsHtmlControl = qstnHTML.find("input[type='checkbox'][name='RESPONSE']");
								for (var index = 0; index < optionsHtmlControl.length; index++) {
									if (optionsHtmlControl[index].checked == true) {
										isAnswerChoiceSelected=true;										
									}
								}									
								if(!isAnswerChoiceSelected){		
									selectedQstnNode.node.IsEditView = true;
									$scope.IsConfirmation = false;
									$scope.message = "Atleast one correct Answer should be defined."
									$modal.open(confirmObject);			
									return true;
									
								}
							};
							
							$scope.showBlankAdditionAlert = function(selectedQstnNode) {
								
								var qstnHTML = $(selectedQstnNode.$element);
								var blankLen = qstnHTML.find('#qtiCaption').find('button').length;
																	
								if(blankLen<=0){		
									selectedQstnNode.node.IsEditView = true;
									$scope.IsConfirmation = false;
									$scope.message = "Atleast One Blank should be defined."
									$modal.open(confirmObject);			
									return true;
									
								}
							};
							

							$scope.showQstnPrintOrEditMode = function(
									selectedQstnNode) {
								if (SharedTabService.tests[SharedTabService.currentTabIndex].IsAnyQstnEditMode
										&& !selectedQstnNode.node.IsEditView) {
									$scope.IsConfirmation = false;
									$scope.message = "A question is already in Edit mode, save it before editing another question.";

									$modal.open(confirmObject);

									return;
								}
								
								if(selectedQstnNode.node.quizType == "FillInBlanks"  &&  selectedQstnNode.node.IsEditView){
									if($scope.showBlankAdditionAlert(selectedQstnNode))
										return;
									
								}else if(selectedQstnNode.node.quizType == "MultipleResponse" && selectedQstnNode.node.IsEditView){
									if($scope.showChoiceSelectionAlert(selectedQstnNode))
										return;
								}
								
								var qstnHtml = selectedQstnNode.node.textHTML;
								this.showQstnEditIcon = !this.showQstnEditIcon;
								this.closeQstnBtn = !this.closeQstnBtn;
								selectedQstnNode.node.qstnLinkText = selectedQstnNode.node.IsEditView ? "Edit"
										: "View";
								selectedQstnNode.node.qstnLinkTitle = selectedQstnNode.node.IsEditView ? "View Question in edit mode"
										: " View Question in print mode";
								if (selectedQstnNode.node.IsEditView) {
									$scope.imageClicked = false;
									convertHtmlToXmlNode(selectedQstnNode);
									SharedTabService.tests[SharedTabService.currentTabIndex].IsAnyQstnEditMode = false;
								} else {
									SharedTabService.tests[SharedTabService.currentTabIndex].IsAnyQstnEditMode = true;
								}
								selectedQstnNode.node.IsEditView = !selectedQstnNode.node.IsEditView;
								selectedQstnNode.node.IsDefaultEditView = selectedQstnNode.node.IsEditView;								
							}

							function convertHtmlToXmlNode(selectedQstnNode) {
								//Removing the image place holder from custom question html section
								//and place it in bottom of test area.
								var p = $(
										angular
												.element(document
														.querySelector("#uploadImage")))
										.detach();
								$("#qstnArea").append(p);
								
								
								var xml = jQuery
								.parseXML(selectedQstnNode.node.data);
								var qstnHTML = $(selectedQstnNode.$element);
								var qstnCaption = replaceImage(qstnHTML
										.find('#qtiCaption'));
		
								if(qstnHTML.find('#qtiCaption').find("button").length > 0){
									qstnCaption = QTI.replaceBlank(qstnHTML.find('#qtiCaption'),qstnCaption);
									/*$(xml).find('itemBody').find('p').eq(0).html(qstnCaption)*/
									$(xml).find('itemBody').find('p').eq(0).empty();
									QTI.appendHTMLNodes($(xml).find('itemBody').find('p').eq(0),qstnCaption);
								}
								else{
									
									QTI.appendNodes($(xml).find('itemBody').find('p').eq(0),"<![CDATA[" +qstnCaption + "]]>");
								}
								

								if($(xml).find('responseDeclaration').find('correctResponse').find('value').length >= 1){
									 $(xml).find('responseDeclaration').find('correctResponse').find('value').html("<![CDATA[" + replaceImage(qstnHTML.find('div.valueView')) + "]]>");
									 }
								else if(qstnHTML.find('div.qti-correctResponse div.valueView').length > 0 && $(xml).find('responseDeclaration').find('correctResponse').length == 0){
									var responseDeclaration = $(xml).find('responseDeclaration');
									var response = responseDeclaration.append("<correctResponse></correctResponse>").children();
									var value = response.append("<value></value>").children();
									value.html("<![CDATA[" + replaceImage(qstnHTML.find('div.valueView')) + "]]>")
								}
								
								$(xml).find('assessmentItem').attr(
										'identifier', 'QUESTION-X');
								selectedQstnNode.node.quizType = QTI.getQuestionType($(xml),selectedQstnNode.node.quizType);
								
								if(selectedQstnNode.node.quizType =="FillInBlanks"){
									var htmlTextEntry = qstnHTML.find('#crtAns').children();
									
									var optionText = '';
									
									var TextArray= htmlTextEntry.find('.placeHolderForBlank');
									
									var responseDeclaration = $(xml).find('responseDeclaration');
									
									responseDeclaration.remove();
									
									var responseTagTemplate = ' <responseDeclaration identifier="@RESPONSE" cardinality="single" baseType="string">'
								        +'<mapping defaultValue="0"><mapEntry mapKey="@RESP" mappedValue="1" caseSensitive="false"/></mapping></responseDeclaration>';
									
									for (var i = 0; i < htmlTextEntry.length; i++) {
										optionText = replaceImage(TextArray.eq(i));
										var responseTag = responseTagTemplate
										responseTag = responseTag.replace(
												'@RESPONSE', 'RESPONSE_'+(i+1));
										
										responseTag = responseTag.replace(
												'@RESP',  optionText );
										
										var item = $.parseXML(responseTag); 
									
									
										if(i==0)
										$(xml).find( "assessmentItem" ).prepend($(item).children(0));
										else
											$(xml).find( "responseDeclaration").eq(i-1).after($(item).children(0));
										
									}								
								}
								
								if (selectedQstnNode.node.quizType =="Matching"){
									
									var htmlBlockquote = qstnHTML.find('blockquote');
									
									var responseDeclaration = $(xml).find('responseDeclaration');
									
									var responseTag = ' <responseDeclaration identifier="@RESPONSE" cardinality="single" baseType="identifier">'
								        +'<mapping defaultValue="0"><mapEntry mapKey="@RESP" mappedValue="1"/></mapping></responseDeclaration>';	
																		
									for (var i = responseDeclaration.length; i < htmlBlockquote.length; i++) {
										
									
										responseTag = responseTag.replace(
												'@RESPONSE', 'RESPONSE_'+(i+1));
										
										responseTag = responseTag.replace(
												'@RESP', 'RESP_'+(i+1));
										
										var item = $.parseXML(responseTag); 
									
										$(xml).find( "responseDeclaration:last" ).after($(item).children(0));
										
									}
									
									$(xml).find('itemBody').find('blockquote').remove();
									
									
									
									var matchArray= htmlBlockquote.find('.matchOptionTextEditablediv');
									var optionArray= htmlBlockquote.find('.optionTextBoxContainer');
									
									var optionText = '';
									
									var optionTag = '<blockquote><p>@p<inlineChoiceInteraction xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1" responseIdentifier="@RESPONSE" shuffle="true">'
										+'</inlineChoiceInteraction></p></blockquote>';	
									
									var inlineChoiceTags = '<inlineChoiceInteraction responseIdentifier="@RESPONSE" shuffle="true">'
										+'</inlineChoiceInteraction>';	
									
									var inlineChoiceTag = '<inlineChoice identifier="@RESP">@RESP_Val</inlineChoice>';   
									
									var xmlDoc = $.parseXML( inlineChoiceTags )
									inlineChoiceTags = $( xmlDoc )
									
									for (var i = 0; i < htmlBlockquote.length; i++) {
										optionText = replaceImage(matchArray.eq(i))
										
										var optionTagAppend = inlineChoiceTag.replace(
												'@RESP', 'RESP_' + (i + 1));
										
										optionTagAppend = optionTagAppend.replace(
												'@RESP_Val', "<![CDATA[" + optionText + "]]>");
										
										var item = $.parseXML(optionTagAppend); 
									
										inlineChoiceTags.find( "inlineChoiceInteraction" ).append($(item).children(0));
										
									}
									
									for (var i = 0; i < htmlBlockquote.length; i++) {
													
										optionText = replaceImage(optionArray.eq(i));
										
										var optionTagAppend = (optionTag).replace(
												'@RESPONSE', 'RESPONSE_' + (i + 1));
										optionTagAppend = optionTagAppend.replace(
												'@p', "<![CDATA[" + optionText + "]]>");										
										
										var item = $.parseXML(optionTagAppend); 
										
										QTI.appendHTMLNodes($(item).find("inlineChoiceInteraction"),QTI.getSerializedXML(inlineChoiceTags.find("inlineChoiceInteraction")));	
										
										$(xml).find('itemBody').append(
										$(item).children(0));
									}
												
								
									var qstnModifiedData = getMatchingQstn_Details($(xml));
									qstnModifiedData.questionMetadata = selectedQstnNode.node.questionMetadata;
									selectedQstnNode.node.IsEdited = !angular
											.equals(
													selectedQstnNode.node.qstnMasterData,
													qstnModifiedData);
									
									
								}else{
									
								var optionVew = selectedQstnNode.node.optionsView == true ? 'Vertical'
										: 'Horizontal';
								$(xml).find('itemBody').find(
										'choiceInteraction').attr(
										'orientation', optionVew);
								
								if($(xml).find('itemBody').find("extendedTextInteraction").length > 0)
									$(xml).find('itemBody').find("extendedTextInteraction").eq(0).attr("expectedLines",qstnHTML.find(".EssaySpaceDiv input[type=radio]:checked").attr("pageSize"))

																		
								if($(xml).find('itemBody').find("textEntryInteraction").length > 0)
									$(xml).find('itemBody').find("textEntryInteraction").attr("expectedLength",qstnHTML.find(".BlankSizeDiv input[type=radio]:checked").attr("blanksize"))
									

								$(xml).find('itemBody').find(
										'choiceInteraction').find(
										"simpleChoice").remove();
								var htmlOptions = qstnHTML
										.find('.qti-simpleChoice');
								var optionText = '';
								var optionTag = '<simpleChoice identifier="@RESPONSE" fixed="false">@val</simpleChoice>';

								for (var i = 0; i < htmlOptions.length; i++) {
									optionText = replaceImage(htmlOptions.eq(i)
											.find("div.optionTextEditablediv"));

									var optionTagAppend = optionTag.replace(
											'@RESPONSE', 'RESPONSE_' + (i + 1));
									optionTagAppend = optionTagAppend.replace(
											'@val', "<![CDATA[" + optionText + "]]>");
									var item = $.parseXML(optionTagAppend); // returns
																			// DOM
																			// element
									$(xml).find('itemBody').find(
											'choiceInteraction').append(
											$(item).children(0));
								}

								var maxChoices = $(xml).find('itemBody').find(
										'choiceInteraction').attr('maxChoices');
								
								maxChoices = (typeof(selectedQstnNode.node.quizType)!='undefined') ? (selectedQstnNode.node.quizType == 'MultipleResponse' ? 2 : 1) : maxChoices;
								
								appendResponseProcessingTag(xml,
										htmlOptions.length);
								var optionCntrol = (maxChoices == 1 ? 'radio'
										: 'checkbox');
								var optionsHtmlControl = qstnHTML
										.find("input[type='" + optionCntrol
												+ "'][name='RESPONSE']");

								if (maxChoices == 2) {
									updateMapEntryTag(xml, optionsHtmlControl);
								} else {
									setIdentifierScore(xml, optionsHtmlControl);
								}

								var qstnModifiedData = getMultipleChoiceQstn_MasterDetails($(xml),selectedQstnNode.node.quizType);
								qstnModifiedData.questionMetadata = selectedQstnNode.node.questionMetadata;
								selectedQstnNode.node.IsEdited = !angular
										.equals(
												selectedQstnNode.node.qstnMasterData,
												qstnModifiedData);
								
							}
								
								var serializer = new XMLSerializer();
								var editedXML = serializer
										.serializeToString(xml);
								selectedQstnNode.node.data = editedXML;
								
								QTI.initialize();
								QTI.Attribute.id = 1;
								QTI.BLOCKQUOTE.id = 0;
								QTI.id = 1;
								var displayNode = $("<div></div>")
								QTI.play(xml, displayNode, true, true,
										selectedQstnNode.node.quizType);
								selectedQstnNode.node.textHTML = displayNode
										.html();

								

								var attrs = {};
								attrs.bindQti = "getEditedHTML(this)";
								var Qtiscope = angular.element(
										$(selectedQstnNode.$element).find(
												"div[class*='questionList']"))
										.scope();
								var element = Qtiscope.$element.children();
								directiveQtiService.bindNewQti(Qtiscope,
										element, attrs);

							}

							var appendResponseProcessingTag = function(xml,
									htmlOptionsCnt) {
								$(xml).find('responseCondition').children()
										.slice(3).remove();

								var $responseElseIf = '<responseElseIf><match><variable identifier=\"RESPONSE\"/><baseValue baseType=\"identifier\">RESPONSE_1</baseValue></match><setOutcomeValue identifier=\"SCORE\"><baseValue baseType=\"float\">0</baseValue></setOutcomeValue><setOutcomeValue identifier=\"FEEDBACK\"><baseValue baseType=\"identifier\">FEEDBACK_1</baseValue></setOutcomeValue></responseElseIf>';
								for (var i = 3; i < htmlOptionsCnt; i++) {
									
									var item = $.parseXML($responseElseIf.replace(
	                                        "RESPONSE_1", "RESPONSE_" + (i + 1))); 

									$(xml).find("responseCondition").append(item.childNodes[0]);
								}
							}

							var updateMapEntryTag = function(xml,
									optionsHtmlControl) {
								var $mapEntry = '<mapEntry mapKey=\"RESPONSE_1\" mappedValue=\"0\" />';
								$(xml).find("responseDeclaration mapping")
										.children().slice(3).remove();
								for (var i = 3; i < optionsHtmlControl.length; i++) {
									
									var item = $.parseXML($mapEntry.replace(
											"RESPONSE_1","RESPONSE_"+ (i + 1)));
									
									$(xml).find("responseDeclaration mapping")
											.append(item.childNodes[0]);
								}

								$(xml).find('responseDeclaration mapEntry')
										.attr("mappedValue", "0");
								for (var index = 0; index < optionsHtmlControl.length; index++) {
									if (optionsHtmlControl[index].checked == true) {
										$(xml).find(
												'responseDeclaration mapEntry')
												.eq(index).attr("mappedValue",
														"1");
									}
								}

							}

							var setIdentifierScore = function(xml,
									optionsHtmlControl) {
								$(xml)
										.find(
												'setOutcomeValue[identifier="SCORE"] baseValue')
										.text("0");
								for (var index = 0; index < optionsHtmlControl.length; index++) {
									if (optionsHtmlControl[index].checked == true) {
										$(xml)
												.find(
														'setOutcomeValue[identifier="SCORE"] baseValue')
												.eq(index).text("1");
									}

								}
							}

							var replaceImage = function(textBox) {
								var htmlText = textBox.html().replace(/&nbsp;/,
										" ");
								var images = textBox.find("u[contenteditable]");
								images.each(function() {
									var url = $(this).attr("url");
									htmlText = htmlText.replace(
											$(this).get(0).outerHTML,
											"<img class='questionImage' src='" + url
													+ "' \/>")
								})
								return htmlText;
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

							$scope.removOption = function(selectedNode, event) {
								$scope.isDeleteAnswerClicked=true;
								var qstnOptionContainer = $(
										selectedNode.$element).find(
										'form.qti-choiceInteraction');
								var tagCnt = qstnOptionContainer
										.find('div.qti-simpleChoice').length;
								if (tagCnt > 3
										&& !$(event.currentTarget).parents(
												".qti-simpleChoice").eq(0)
												.attr("checked")) {
									$scope.selectedNode = selectedNode;
									$scope.event = event;
									$scope.IsConfirmation = true;

									$scope.message = "Are you sure you want to delete this answer?";
									$modal.open(confirmObject).result
											.then(function(ok) {
												if (ok) {

													var SelectedRadio = $(
															$scope.event.currentTarget)
															.parents(
																	".qti-simpleChoice")
															.find(
																	'Input[type=radio]:checked').length == 1 ? true
															: false;
													qstnOptionContainer.find(
															'#uploadImage')
															.hide();

													$($scope.event.currentTarget)
															.parents(
																	".qti-simpleChoice")
															.eq(0).remove();
													if (SelectedRadio == true) {
														qstnOptionContainer
																.find(
																		'Input[type=radio]')
																.eq(0)
																.prop(
																		"checked",
																		true);
													}
												}
												;
											});
								} else {
									$scope.IsConfirmation = false;
									$scope.message = "Minimum answer required is 3."
									$modal.open(confirmObject);
								}
							}

							$scope.qstnOptionsView = function(selectedNode,
									qstnOptionView) {
								selectedNode.node.optionsView = qstnOptionView;
							}
							
							$scope.qstnEssayPageSize = function(selectedNode,
									pageSize) {
								selectedNode.node.qtiModel.EssayPageSize = pageSize;
							}
							
							

							$scope.addOptions = function(selectedOption, event) {
								var htmlOptionCnt = selectedOption.$element
										.find('.qti-simpleChoice').find('div')
										.find('div[contenteditable=true]').length;
								var cloneOption = $(event.currentTarget)
										.parents(".qti-simpleChoice").clone();
								cloneOption.find("input[type='radio']").attr(
										"checked", false).attr("id",
										"simpleChoice" + htmlOptionCnt);
								cloneOption.find(".optionTextEditablediv")
										.attr("data-placeholder",
												"Enter Answer").attr("NewRow",
												"1").attr("id",
												"simpleChoice" + htmlOptionCnt)
										.text("");
								$(event.currentTarget).parents(
										".qti-simpleChoice").eq(0).after(
										cloneOption)

								selectedOption.node.textHTML = selectedOption.$element
										.children().html();
								
								if (selectedOption.node.length) {
									selectedOption.node[0].innerHTML = selectedOption.$element
									.children().html();									
								}									
								
								var attrs = {};
								attrs.bindQti = "getHTML1(this)";
								var qstnHTML = $(selectedOption.$element);
								var options = qstnHTML
										.find("input[type='radio'][name='RESPONSE']");
								var selectedIndex = options.index(options
										.filter(':checked'));
								directiveQtiService.bindNewQti(selectedOption,
										selectedOption.$element, attrs);
								setTimeout(
										function() {
											qstnHTML
													.find(
															"input[type='radio'][name='RESPONSE']")
													.eq(selectedIndex).attr(
															"checked",
															"checked");

										}, 50);

							}
							
							
							$scope.deleteBlockquote = function(selectedNode, event) {
								$scope.isBlockQuoteClicked=true;
								var qstnBlockquote = $(selectedNode.$element).find('blockquote');
								var tagCnt = qstnBlockquote.length;
								
								if (tagCnt > 3) {
									$scope.selectedNode = selectedNode;
									$scope.event = event;
									$scope.IsConfirmation = true;
									$scope.message = "Are you sure you want to delete this Options/Match pair?";
									$modal.open(confirmObject).result
											.then(function(ok) {
												if (ok) {
													
													var index = $(qstnBlockquote).index($($scope.event.currentTarget).parents("blockquote").eq(0).next())
													
													var iterator = $($scope.event.currentTarget).parents("blockquote").eq(0);
													var placeHolder;
													
									
													while(iterator.next().length == 1){
														iterator = iterator.next();
														placeHolder = iterator.find(".optionTextBoxContainer").attr("data-placeholder")
														iterator.find(".optionTextBoxContainer").attr("data-placeholder",placeHolder.replace((index+1), (index)));
														placeHolder = iterator.find(".matchOptionTextEditablediv").attr("data-placeholder")
														iterator.find(".matchOptionTextEditablediv").attr("data-placeholder",placeHolder.replace((index+1), (index)));
														
														placeHolder = iterator.find(".mainOptionIndexdiv").html();
														iterator.find(".mainOptionIndexdiv").html(placeHolder.replace((index+1), (index)));
														
														placeHolder = iterator.find(".matchOptionIndexdiv").html();
														iterator.find(".matchOptionIndexdiv").html(placeHolder.replace((index+1), (index)));
														
														index = index + 1;														
													}													
													
													$($scope.event.currentTarget).parents("blockquote").eq(0).remove();													
													
												}
												;
											});
								} else {
									$scope.IsConfirmation = false;
									$scope.message = "Minimum Options/Match pairs required is 3."
									$modal.open(confirmObject);
								}	
								
							}
							
							
							
							$scope.addBlockquote = function(selectedOption, event) {
								
								var cloneOption = $(event.currentTarget)
										.parents("blockquote").clone();
								
								cloneOption.find(".optionTextBoxContainer").html('');
								cloneOption.find(".matchOptionTextEditablediv").html('');
								
								var BLOCKQUOTE_ID = QTI.BLOCKQUOTE.getId();		
								var optionText = CustomQuestionTemplate["Matching"].editOption_Column_A + "A"
								
								$(event.currentTarget).parents(
										"blockquote").eq(0).after(
										cloneOption)
								
								var htmlOptionCnt = selectedOption.$element.find('blockquote');
								var index = $(htmlOptionCnt).index($(event.currentTarget).parents("blockquote").eq(0).next())
								var iterator = $(event.currentTarget).parents("blockquote").eq(0);
								var placeHolder;
								
								while(iterator.next().length == 1){
									iterator = iterator.next();
									placeHolder = iterator.find(".optionTextBoxContainer").attr("data-placeholder")
									iterator.find(".optionTextBoxContainer").attr("data-placeholder",placeHolder.replace(index, (index + 1)));
									placeHolder = iterator.find(".matchOptionTextEditablediv").attr("data-placeholder")
									iterator.find(".matchOptionTextEditablediv").attr("data-placeholder",placeHolder.replace(index, (index + 1)));
									
									placeHolder = iterator.find(".mainOptionIndexdiv").html();
									iterator.find(".mainOptionIndexdiv").html(placeHolder.replace(index, (index + 1)));
									
									placeHolder = iterator.find(".matchOptionIndexdiv").html();
									iterator.find(".matchOptionIndexdiv").html(placeHolder.replace(index, (index + 1)));
									
									index = index + 1;
								}
								
								selectedOption.node.textHTML = selectedOption.$element
										.children().html();
								var attrs = {};
								attrs.bindQti = "getHTML1(this)";
								var qstnHTML = $(selectedOption.$element);
								
								directiveQtiService.bindNewQti(selectedOption,
										selectedOption.$element, attrs);
								

							}

							$scope.imageClicked = false;
							var Option = null;
							var CursorPosition = 0;
							$scope.addImage = function(selectedOption, event,
									parentText) {
								Option = $(event.target).parents(parentText)
										.find("div[contenteditable='true']")
										.eq(0);
								CursorPosition = QTI.getCaretPosition(Option
										.get(0));
								if ($(event.target).parents(parentText).next(
										"#uploadImage").length == 1) {
									$scope.imageClicked = !$scope.imageClicked;
									return;
								}
								$scope.imageClicked = true;
								// angular.element("#uploadImage").css("top")
								var p = $(
										angular.element(document
												.querySelector("#uploadImage")))
										.detach();
								p.show();
								$(event.target).parents(parentText).after(p);
							}

							
							$scope.addBlank = function(scope, event){
								
								var qtiCaption = scope.$element.find("#qtiCaption").eq(0);
								var cursorPosition = QTI.getCaretPosition(qtiCaption.get(0));
								if(cursorPosition > 0){
									qtiCaption = QTI.getCursorElement(qtiCaption)
									cursorPosition = QTI.getCaretPosition(qtiCaption.get(0));
								}
								var optionText = qtiCaption.html().replace(/&nbsp;/g," ");
																
								cursorPosition = QTI.getActualCursorPosition1(cursorPosition,qtiCaption,optionText);
								var htmlEle =scope.$element.find('#crtAns').eq(0);
								var htmlOptionCnt = scope.$element.find('#crtAns').find('div').length;
								var lastId = scope.$element.find('#crtAns').find('div').length;

								var blankCount = scope.$element.find("#qtiCaption").eq(0).find("button").length;
								blankCount = blankCount + 1;
								qtiCaption.html(qtiCaption.html().replace(/&nbsp;/g," "))
//								qtiCaption.html(optionText.substring(0,cursorPosition) + "<button contenteditable='false'><span class='blankWidth editView'>"+alphaArray[htmlOptionCnt]+"<span contenteditable='true' id='"+alphaArray[htmlOptionCnt]+"' onkeydown='QTI.getSpanId(this,event)' placeHolder='Blank Space' ></span></span></button>" + optionText.substring(cursorPosition + 1, optionText.length));
								if(qtiCaption.html().length == 0)
									qtiCaption.html("Blank");
								qtiCaption.html(optionText.substring(0,cursorPosition) + "<button id='RESPONSE_"+ blankCount +" ' onkeydown='return QTI.getSpanId(this,event)' class='blankFIBButton '><span contenteditable='false' class='blankWidth editView'><b contenteditable='false'>" + String.fromCharCode(65 + blankCount - 1 ) + ".</b>Fill Blank</span></button>&nbsp;" + optionText.substring(cursorPosition, optionText.length));
									
								qtiCaption.html(qtiCaption.html().replace(/<\/button> /g,"</button>&nbsp;"));
								
								htmlEle.append($("<div class='editView editablediv crtAnsDiv' type='text' id='RESPONSE_"+blankCount+"' >"+String.fromCharCode(65 + blankCount - 1 )+".<div contenteditable='true' class='placeHolderForBlank' data-placeholder='Enter the correct answer for blank "+ String.fromCharCode(65 + blankCount - 1 ) +"'></div></div>"));
							}
							
							$scope.upload = function(files) {
								var returnValue;
								if (files && files.length) {
									CursorPosition = QTI
											.getCaretPosition(Option.get(0));
									for (var i = 0; i < files.length; i++) {
										var file = files[i];
										returnValue = TestService
												.uploadImage(
														file,
														Option,
														CursorPosition,
														function(data, element,
																cursorPosition) {
															if (element
																	.attr("id")
																	.indexOf(
																			"simpleChoice") == 0) {
																if (element
																		.find("u[contenteditable='false']").length == 1) {
																	element
																			.find(
																					"u[contenteditable='false']")
																			.eq(
																					0)
																			.attr(
																					"url",
																					data);
																	element
																			.find(
																					"u[contenteditable='false'] i")
																			.eq(
																					0)
																			.text(
																					file.name);
																	$scope.imageClicked = false;
																	return;
																}
															}
															if(cursorPosition > 0){
																element = QTI.getCursorElement(element)
																cursorPosition = QTI.getCaretPosition(element.get(0));
															}
															var optionText = element
																	.html()
																	.replace(
																			/&nbsp;/g,
																			" ");
															cursorPosition = QTI.getActualCursorPosition1(cursorPosition,element,optionText);
															if(element.get(0).tagName.toUpperCase() == "BR")
															{
																element.after(optionText
																		.substring(
																				0,
																				cursorPosition)
																		+ "<u contenteditable='false' url='"
																		+ data
																		+ "'><i>"
																		+ file.name
																		+ "</i></u>&nbsp;"
																		+ optionText
																				.substring(
																						cursorPosition,
																						optionText.length));
															}
															else{
																if(element.html().length == 0)
																	element.html("Image");
																element
																		.html(optionText
																				.substring(
																						0,
																						cursorPosition)
																				+ "<u contenteditable='false' url='"
																				+ data
																				+ "'><i>"
																				+ file.name
																				+ "</i></u>&nbsp;"
																				+ optionText
																						.substring(
																								cursorPosition,
																								optionText.length))
															}
															
															$scope.imageClicked = false;
														});

									}

								}

							}
							/**
							 * ***************************************End
							 * Question edit
							 * ***************************************
							 */

							if (SharedTabService.currentTab
									&& SharedTabService.currentTab.testId) {
								$scope.newVersionBtnCss = "";
								$scope.exportBtnCss = "";
							} else {
								$scope.newVersionBtnCss = "disabled";
								$scope.exportBtnCss = "disabled";
							}

							$scope.addNewTest = function () {							   
								
								$scope.testType = 'Test';

								SharedTabService.addNewTest($scope);
							}

							$scope.addTestWizard = function() {
								$scope.isApplySameCriteriaToAll = false;
								SharedTabService.addTestWizard($scope);
							}
							$scope.addTestWizardCriteria = function(response,
									currentNode) {
							    
								SharedTabService
										.addTestWizardCriteria(
												$scope,
												SharedTabService.tests[SharedTabService.currentTabIndex],
												response, currentNode);
							}

							$scope.onClickTab = function(test) {							

								SharedTabService.onClickTab(test, $scope);
								if (SharedTabService.tests[SharedTabService.currentTabIndex].testId) {
									$scope.newVersionBtnCss = "";
									$scope.exportBtnCss = "";
									
									$scope.setTestType();									
								} else {
									$scope.newVersionBtnCss = "disabled";
									$scope.exportBtnCss = "disabled";
                                    $scope.testType = 'Test';
								}

								if (test.testId && !test.questions.length && !SharedTabService.isDirtyTab(test) && !test.isTabClicked) {
									test.isTabClicked=true;									
									TestService.getTestQuestions(test.testId,function(questions) {
										if(questions==null){
											CommonService.showErrorMessage(e8msg.error.cantFetchTestQuestions);
				                    		return;
										}
												$scope.bindTestQuestions(questions,$scope.currentIndex);
											})
								}
							}

							$scope.isActiveTab = function(tabUrl) {
								return SharedTabService.isActiveTab(tabUrl,
										$scope);
							}

							$scope.isActiveSelectedTest = function(testId) {
								if (SharedTabService.currentTab) {
									return testId == SharedTabService.currentTab.id;
								}
								return false;
							}

					        $scope.closeTab = function (tab) {
					            SharedTabService.closeTab(tab, $scope);
					            var scope = angular.element($("input[type=checkbox][id=applyCriteria]").eq(0)).scope();
					            $scope.isApplySameCriteriaToAll = false;
					        }
					        $scope.closeQuestions = function (tab,index) {
					        	 var p = $(
	                                        angular.element(document
	                                                .querySelector("#uploadImage")))
	                                        .detach();
	                                
	                                $('#qstnArea').after(p);
	                                $scope.imageClicked = false;
					            SharedTabService.closeQuestions(tab, $scope, index);					           
					        }
					        $scope.closeTabWithConfirmation = function ($event,tab) {
								SharedTabService.closeTabWithConfirmation(tab, $scope);
								$scope.setTestType();
								$event.stopPropagation();
							}
					        
							$scope.setTestType = function() {
								if (SharedTabService.tests[SharedTabService.currentTabIndex].treeNode
								        && SharedTabService.tests[SharedTabService.currentTabIndex].treeNode.testType === EnumService.TEST_TYPE.PublisherTest) {
										
									$scope.newVersionBtnCss = "disabled";
									$scope.testType = EnumService.TEST_TYPE.PublisherTest;
								} else {
									$scope.testType = EnumService.TEST_TYPE.Test;
								}
							}
							
							$scope.closeCriteria = function(folder,
									isWizardCloseBtnClicked) {
								var scope = angular
										.element(
												$(
														"input[type=checkbox][id=applyCriteria]")
														.eq(0)).scope();
								isWizardCloseBtnClicked = isWizardCloseBtnClicked
										&& scope.isApplySameCriteriaToAll
								if (isWizardCloseBtnClicked){
									SharedTabService.closeAllCriteria(folder,
											$scope);
								}else{
									SharedTabService.closeCriteria(folder,
											$scope);
								}
								if (SharedTabService.tests[SharedTabService.currentTabIndex].criterias.length <= 1) {
									scope.isApplySameCriteriaToAll = false;
									$scope.isApplySameCriteriaToAll = false;
								}
							}

							
							$scope.testTitle = "New Test";

							function buildQstnMasterDetails(qstnNode) {
								
								var qstnXML = jQuery.parseXML(qstnNode.data);
							
								var qstnMasterData ;
								
									switch(qstnNode.quizType) {		
									
										 case "MultipleResponse","MultipleChoice","Essay","FillInBlanks","TrueFalse":
											 
											 qstnMasterData = getMultipleChoiceQstn_MasterDetails(qstnXML,qstnNode.quizType);										 
									         break;
									         
									      case "Matching":
									    	  qstnMasterData = getMatchingQstn_Details(qstnXML);
									         break;
									     
									      default:
									    	  
									    	  qstnMasterData = getMultipleChoiceQstn_MasterDetails(qstnXML);
								      
								     }
									var questionMetadata = angular.copy(qstnNode.questionMetadata);
									qstnMasterData.questionMetadata = questionMetadata;
									return qstnMasterData;																
							}
							
							function getMultipleChoiceQstn_MasterDetails(qstnXML,quizType) {								
								var optionList = [];
								var correctAnswerList = [];
								if(quizType=='MultipleResponse'){
									$(qstnXML)
									.find(
											'responseDeclaration mapEntry')
									.each(function(i, e) {
										if ($(this).attr("mappedValue") == "1") {
											correctAnswerList.push(i);
										}
									});
									
								}else{
								$(qstnXML)
										.find(
												'setOutcomeValue[identifier="SCORE"] baseValue')
										.each(function(i, e) {

											if ($(this).text() == "1") {
												correctAnswerList = i;
											}
										});
								}

								$(qstnXML).find('itemBody').find(
										'choiceInteraction').find(
										"simpleChoice").each(function(i, e) {

									optionList.push($(this).text().trim());
								});

								var xmlOrientation = $(qstnXML).find('itemBody')
										.find('choiceInteraction').attr(
												"orientation");
								var nodeOptionsView = (xmlOrientation == undefined)
										|| (xmlOrientation == 'Vertical') ? true
										: false;
								
									
								
								

								var qstnMasterData = {
									caption : $(qstnXML).find('itemBody').find('p').text(),
									options : optionList,
									optionCount : $(qstnXML).find('itemBody').find(
											'choiceInteraction').find(
											"simpleChoice").length,
									correctAnswer : correctAnswerList,
									optionsView : nodeOptionsView
								}
								
								if(quizType=='Essay'){
									var nodeEssayPageSize = '0';
									if($(qstnXML).find('itemBody').find("extendedTextInteraction").length > 0)
										nodeEssayPageSize = $(qstnXML).find('itemBody').find("extendedTextInteraction").eq(0).attr("expectedLines")
									
									qstnMasterData.EssayPageSize = nodeEssayPageSize;
								}
								
								if(quizType=='FillInBlanks'){
									var nodeBlankSize = '20';
									if($(qstnXML).find('itemBody').find("textEntryInteraction").length > 0)
										nodeBlankSize = $(qstnXML).find('itemBody').find("textEntryInteraction").eq(0).attr("expectedLength")
									
									qstnMasterData.BlankSize = nodeBlankSize
								}

								return qstnMasterData;
							}
							
							function getMatchingQstn_Details(qstnXML) {								
								var leftOptionList = [];
								var rightOptionList = [];
								
								$(qstnXML).find('itemBody').find(
								'blockquote').eq(0).find("inlineChoiceInteraction inlineChoice").each(function(i, e) {

									rightOptionList.push(QTI.getSerializedXML($(this)));
								});
								
								$(qstnXML).find('itemBody').find(
								'blockquote').each(function(i, e) {		
									$(this).find("p").find('inlineChoiceInteraction').remove();
									leftOptionList.push(QTI.getSerializedXML($(this).find("p").eq(0)));
								});

								var qstnMasterData = {
									caption : $(qstnXML).find('itemBody').find('p').eq(0).text(),
									leftOptions: leftOptionList ,
									rightOptions: rightOptionList		
								}

								return qstnMasterData;
							}
							
							  $scope.$on('beforeDrop', function (event) {
								  $scope.questionEditAlert();
							   });
							  
							  $scope.questionEditAlert = function(){
								  if (SharedTabService.tests[SharedTabService.currentTabIndex].IsAnyQstnEditMode) {
										$scope.IsConfirmation = false;
										$scope.message = "A question is already in Edit mode, save it before adding or reordering questions.";
										$modal.open(confirmObject);
										$scope.dragStarted = false;
									}
							  }

							$scope
									.$on(
											'beforeDropQuestion',
											function(event) {

												 $scope.questionEditAlert();

											});
							$scope.$on('dropTest', function (event, selectedTest, destIndex) {
						    				selectedTest.node.draggable = false;
											$scope.editTest(selectedTest);
									});

							  $scope.Difficulty = [{name:'Select Level',value:'0'},
							                       {name:'Easy',value:'Easy'},
							                       {name:'Moderate',value:'Moderate'},
							                       {name:'Difficult',value:'Difficult'}
							                      ];	
							 
							  $scope.difficultyChange = function(selectedQuestion,selectedDifficulty) {
								  selectedQuestion.node.selectedLevel = selectedDifficulty;
								  selectedQuestion.node.questionMetadata.Difficulty = selectedDifficulty.value;								
							  }
							  
							  $scope
									.$on(
											'dropQuestion',
											function(event, node, destIndex,
													sourceTabName) {
											    try {
											        var newNode = angular.copy(node);

											        if (sourceTabName == "CustomQuestions") {
											            SharedTabService.tests[SharedTabService.currentTabIndex].IsAnyQstnEditMode = true;
											        }
											        newNode.IsUserMetdataAvailable = false;

											        newNode.questionMetadata = {};
											        if (SharedTabService.userQuestionSettings.length > 0) {
											            newNode.IsUserMetdataAvailable = true;
											        }


											        var tests = SharedTabService.tests[SharedTabService.currentTabIndex].questions;

											        if (sourceTabName == "CustomQuestions") {

											            $.each(SharedTabService.userQuestionSettings, function (index, value) {
											                if (value != 'QuestionId') {
											                    newNode['questionMetadata'][value] = '';
											                }
											            });
											         
											            newNode.IsEditView = true;
											            newNode.editMainText = CustomQuestionTemplate[newNode.quizType].editMainText;
											            newNode.IsEdited = true;
											            newNode.IsDefaultEditView = true;
											            newNode.selectedLevel = { name: 'Select Level', value: '0' };
											            newNode.EssayPageSize = '0';
											            newNode.BlankSize = '20';

											        } else {

											            $.each(SharedTabService.userQuestionSettings, function (index, value) {
											            	      newNode['questionMetadata'][value] = '';
											                
											            });

											            newNode.IsEditView = false;
											            newNode.editMainText = CustomQuestionTemplate[newNode.quizType].editMainText;

											            $.each(newNode.extendedMetadata, function (index, item) {
											                var name = item['name'].charAt(0).toUpperCase() + item['name'].slice(1);
											                if((typeof(newNode['questionMetadata'][name])!='undefined')||((typeof(newNode['questionMetadata']['Difficulty'])!='undefined') && (name=='QuestionLevelOfDifficulty'))) {
											                	if (item['name'] == "questionLevelOfDifficulty")
											                		newNode['questionMetadata']['Difficulty'] = item['value'];
											                	else{
											                		
											                		newNode['questionMetadata'][name] = item['value'].replace(/&ndash;/g, '-');
											                	}
											                }
											            });

											            newNode.selectedLevel = newNode.questionMetadata['Difficulty'] == undefined ? { name: 'Select Level', value:'0'}:{name:newNode.questionMetadata['Difficulty']==""?'Select Level':newNode.questionMetadata['Difficulty'],value:newNode.questionMetadata['Difficulty']==""?'0':newNode.questionMetadata['Difficulty']};
											            newNode.qstnMasterData = buildQstnMasterDetails(newNode);
											            newNode.optionsView = newNode.qstnMasterData.optionsView;
											            newNode.EssayPageSize = newNode.qstnMasterData.EssayPageSize;
											            newNode.BlankSize = newNode.qstnMasterData.BlankSize;
											        }

											        newNode.qstnLinkText = newNode.IsEditView ? "View"
                                                            : "Edit";


											        var nodeAlreadyExist = false;
											        if (tests.length == 0) {
											            tests.push(newNode);
											        } else {
											            if (sourceTabName != "CustomQuestions") {
											                tests
                                                                    .forEach(function (
                                                                            item) {
                                                                        if (item.guid == newNode.guid) {
                                                                            nodeAlreadyExist = true;
                                                                        }
                                                                    });
											            }

											            if (!nodeAlreadyExist) {
											                tests.splice(destIndex,
                                                                    0, newNode);
											            }
											        }
											        $scope.tests[$scope.currentIndex].questions = tests;
											        } catch (e) {
											            console.log(e);
											        }
											        finally {
											            $rootScope.blockPage.stop();
											        }
												
												 });
												
												
							$scope.$on('editTest',
									function(event, selectedTest) {								
                                		
										$scope.editTest(selectedTest);
									});
                            //
							var resetTabs = function () {
							    if (SharedTabService.tests.length == 1 && SharedTabService.isEmptyTab(SharedTabService.tests[0]) && !SharedTabService.tests[0].isTestWizard) {
							        SharedTabService.tests = [];
							        SharedTabService.masterTests = [];
							    }
							}
							$scope.editTest = function (selectedTest) {
							    $rootScope.blockPage.start();
							    resetTabs();
								$scope.newVersionBtnCss = "";
								$scope.exportBtnCss = "";
								
                        		$scope.testType = 'Test';
                        		if(selectedTest.node.testType && selectedTest.node.testType == EnumService.TEST_TYPE.PublisherTest) {
                        			$scope.testType = EnumService.TEST_TYPE.PublisherTest;
                        			$scope.newVersionBtnCss = "disabled";
                        		}                        		

								$scope.testGuid = selectedTest.node.guid;
								$scope.selectedTestNode = selectedTest.node;
								// if Test is in root folder
								if (selectedTest.$parentNodeScope) {
									$scope.folderGuid = selectedTest.$parentNodeScope.node.guid;
									$scope.courseFolder = selectedTest.$parentNodeScope.node.title;
								} else {
									$scope.folderGuid = null;
								}

								$("#testCaption").val(selectedTest.node.title);
							
								TestService.getTestQuestions(selectedTest.node.guid,function(questions) {
                                                $scope.bindTestQuestions(questions,$scope.currentIndex);
                                            })												
												
								$scope.testTitle = selectedTest.node.title;
								$scope.metadata = TestService
										.getTestMetadata(selectedTest.node);
								SharedTabService.editTest($scope);
							}

							 $scope.bindTestQuestions = function(questions,currentIndex) {
	                                if (questions.length == 0) {
	                                    $rootScope.blockPage.stop();
	                                    return false;
	                                }	                                     
	                                          
	                                     QTI.initialize();
	                                     $.each(questions,function(index,question){
	                                            var qtiDisplayNode = $("<div></div>");
	                                            QTI.BLOCKQUOTE.id = 0;
	                                            QTI.play(question.qtixml,
	                                                    qtiDisplayNode, false,false,question.metadata.quizType);
	                                            
	                                            var displayNode = {};
	                                            
	                                            var userSettings= {};    
	   	                                     	userSettings.questionMetadata = {};
	   	                                     
	   	                                     	$.each(SharedTabService.userQuestionSettings, function( index, value ) {    
	   	                                     		userSettings['questionMetadata'][value]='';                                                                                                        
	   	                                        });       
	   	                                     
	                                            displayNode.guid = question.guid;    
	                                            displayNode.quizType = question.metadata.quizType;
	                                            displayNode.IsUserMetdataAvailable = false;
	                                             if (SharedTabService.userQuestionSettings.length>0){
	                                                 displayNode.IsUserMetdataAvailable = true;
	                                             }
	                                            
	                                            
	                                            displayNode.textHTML = qtiDisplayNode.html();
	                                            
	                                            displayNode.IsEditView = false;
	                                            displayNode.qstnLinkText = displayNode.IsEditView ? "View"
	                                                    : "Edit";
	                                            displayNode.extendedMetadata =  question.metadata.extendedMetadata;
	                                            displayNode.questionMetadata = userSettings.questionMetadata;    
	                                            

	                                            displayNode.editMainText = CustomQuestionTemplate[displayNode.quizType].editMainText;
	                                            
	                                            $.each(displayNode.extendedMetadata, function(index, item){                                                                    
	                                                var name = item['name'].charAt(0).toUpperCase() + item['name'].slice(1);
	                                                if((typeof(displayNode['questionMetadata'][name])!='undefined')||((typeof(displayNode['questionMetadata']['Difficulty'])!='undefined') && (name=='QuestionLevelOfDifficulty'))){
	                                                 if(item['name'] == "questionLevelOfDifficulty")
	                                                     displayNode['questionMetadata']['Difficulty'] = item['value'];
	                                                 else
	                                                     displayNode['questionMetadata'][name]=item['value'].replace(/&ndash;/g, '-');  
	                                                }
	                                            });
	                            
	                                
	                                            displayNode.selectedLevel = displayNode.questionMetadata['Difficulty']==undefined?{name:'Select Level',value:'0'}:{name:displayNode.questionMetadata['Difficulty']==""?'Select Level':displayNode.questionMetadata['Difficulty'],value:displayNode.questionMetadata['Difficulty']==""?'0':displayNode.questionMetadata['Difficulty']};
	                                
	                                
	                                            displayNode.data=question.qtixml;
	                                            
	                                            displayNode.qstnMasterData = buildQstnMasterDetails(displayNode);
	                                            displayNode.optionsView = displayNode.qstnMasterData.optionsView;
	                                            displayNode.EssayPageSize = displayNode.qstnMasterData.EssayPageSize;    
	                                            displayNode.BlankSize = displayNode.qstnMasterData.BlankSize;
	                                    
	                                            // $scope.tree2.push(displayNode);
	                                            SharedTabService.tests[currentIndex].questions.push(displayNode);
	                                            for (var i = 0; i < SharedTabService.masterTests.length; i++) {
	                                                if (SharedTabService.masterTests[i].id === SharedTabService.tests[currentIndex].id) {
	                                                    SharedTabService.masterTests[i].masterQuestions.push(displayNode);// is to check for dirty.
	                                                }
	                                            }
	                                    
	                                });
	                                     $rootScope.blockPage.stop(); 
	                                
	                            };
							$scope.renderQuestions = function(qBindings,
									currentIndex) {
								if (qBindings.length == 0) {
									$rootScope.blockPage.stop();
									return false;
								}
									var question = qBindings.shift();
									 
									 var userSettings= {};	
									 userSettings.questionMetadata = {};
									 
									 $.each(SharedTabService.userQuestionSettings, function( index, value ) {	
										 userSettings['questionMetadata'][value]='';																										
										});			
									 
									 
									 
									 TestService
										.getMetadata(
												question.guid,
												function(questionMetadataResponse) {		
											
										TestService
												.getQuestionById(
														question.guid,
														function(response) {
															var qtiDisplayNode = $("<div></div>");
															 QTI.BLOCKQUOTE.id = 0;
															QTI.play(response,
																	qtiDisplayNode, false,false,questionMetadataResponse.quizType);
															
															var displayNode = {};
															displayNode.guid = question.guid;	
															displayNode.quizType = questionMetadataResponse.quizType;
															displayNode.IsUserMetdataAvailable = false;
															 if (SharedTabService.userQuestionSettings.length>0){
																 displayNode.IsUserMetdataAvailable = true;
															 }
															
															
															displayNode.textHTML = qtiDisplayNode.html();
															
															displayNode.IsEditView = false;
															displayNode.qstnLinkText = displayNode.IsEditView ? "View"
																	: "Edit";
															displayNode.extendedMetadata =  questionMetadataResponse.extendedMetadata;
															displayNode.questionMetadata = userSettings.questionMetadata;	
															

                                                            displayNode.editMainText = CustomQuestionTemplate[displayNode.quizType].editMainText;
															
                                                            $.each(displayNode.extendedMetadata, function(index, item){                                                                    
                                                                var name = item['name'].charAt(0).toUpperCase() + item['name'].slice(1);
                                                                if((typeof(displayNode['questionMetadata'][name])!='undefined')||((typeof(displayNode['questionMetadata']['Difficulty'])!='undefined') && (name=='QuestionLevelOfDifficulty'))){
                                                                 if(item['name'] == "questionLevelOfDifficulty")
                                                                     displayNode['questionMetadata']['Difficulty'] = item['value'];
                                                                 else
                                                                     displayNode['questionMetadata'][name]=item['value'].replace(/&ndash;/g, '-');  
                                                                }
                                                            });
											
												
															displayNode.selectedLevel = displayNode.questionMetadata['Difficulty']==undefined?{name:'Select Level',value:'0'}:{name:displayNode.questionMetadata['Difficulty'],value:displayNode.questionMetadata['Difficulty']};
												
												
															displayNode.data=response;
															
															displayNode.qstnMasterData = buildQstnMasterDetails(displayNode);
															displayNode.optionsView = displayNode.qstnMasterData.optionsView;
															displayNode.EssayPageSize = displayNode.qstnMasterData.EssayPageSize;	
															displayNode.BlankSize = displayNode.qstnMasterData.BlankSize;
													
															// $scope.tree2.push(displayNode);
															SharedTabService.tests[currentIndex].questions.push(displayNode);
															for (var i = 0; i < SharedTabService.masterTests.length; i++) {
															    if (SharedTabService.masterTests[i].id === SharedTabService.tests[currentIndex].id) {
															        SharedTabService.masterTests[i].masterQuestions.push(displayNode);// is to check for dirty.
															    }
															}
															if (qBindings.length > 0) {
																$scope.renderQuestions(
																		qBindings,
																		currentIndex);
															} else {
															    $rootScope.blockPage.stop();
															}
														});
											});
									 
								
							};

							$scope.renderTest = function(questionBindings,
									title) {

								$scope.testTitle = title;

								// $scope.tree2 = [];

								QTI.initialize();

								$scope.renderQuestions(questionBindings,
										$scope.currentIndex);
								/*$scope.BlockRightPanel.stop();*/
								
							}
							
							 function updateMatchingTemplatePrefilledtext(qstnNode) {
	                                var xml = jQuery.parseXML(qstnNode.data);
	
	                                if (QTI.getContent($(xml).find('itemBody').find('p').eq(0)) == "") {
	                                    if (qstnNode.IsDefaultEditView) {                    

	                                        var captionHtml = replaceImage($(document
	                                                .querySelector("li[printmode = false] #qtiCaption")));
	                                        if (captionHtml == "") {
	                                            captionHtml = CustomQuestionTemplate[qstnNode.quizType].printCaption;
	                                        }

	                                        QTI.prependNodeContent($(xml).find('itemBody').find('p').eq(0),captionHtml);
	                                    }else{
	                                    	QTI.prependNodeContent($(xml).find('itemBody').find('p').eq(0),CustomQuestionTemplate[qstnNode.quizType].printCaption);
	                                    }
	                                }
	                                
	                                
	                                        
	                                var matchOptionsHtml = $(
	                                        document
	                                                .querySelector("li[printmode = false] .qti-itemBody"))
	                                        .find('div.matchOptionTextEditablediv');
	                                
	                                
	                                var matchOptionsTxt = [];
	                                 $.grep(matchOptionsHtml,
	                                        function(matchOption) {
	                                     matchOptionsTxt.push(replaceImage($(matchOption)));
	                                });
	                                
	                                
	                                $(xml).find('inlineChoiceInteraction').each(function(i,e){
	                                    
	                                   $(this).children().each(function(i,e){
	                                   
	                                        if ($(this).text() == "") {
	                                            $(this).text("Match");
	                                            if (qstnNode.IsDefaultEditView) {
	                                            	QTI.setContent($(this),matchOptionsTxt[i]);
	                                                if ( matchOptionsTxt[i] == "") {
	                                                	QTI.setContent($(this),"Match");
	                                                }
	                                            } 
	                                        }
	                                        
	                                        
	                                    })
	                                });
	                                
	                                
	                                
	                                
	                                var optionsHtml = $(
	                                        document
	                                                .querySelector("li[printmode = false] .qti-itemBody"))
	                                        .find('div.optionTextBoxContainer');
	                                
	                                var optionHtmlText = '';

	                                $(xml).find('itemBody').find('blockquote').each(function(i, e) {
	                                    
	                                    var pTag = $(this).find('p').eq(0).clone();
	                                    $(pTag).find('inlineChoiceInteraction').remove();
	                                
	                                                    if (QTI.getContent(pTag) == "") {
	                                                        if (qstnNode.IsDefaultEditView) {

	                                                            optionHtmlText = replaceImage(optionsHtml
	                                                                    .eq(i));

	                                                            if (optionHtmlText == "") {
	                                                                optionHtmlText = CustomQuestionTemplate[qstnNode.quizType].printOption+ " "+ (i+1);
	                                                            }
	                                                            
	                                                            QTI.prependNodeContent($(this).find('p').eq(0),optionHtmlText)


	                                                        } else {
	                                                        	
	                                                        	QTI.prependNodeContent($(this).find('p').eq(0),CustomQuestionTemplate[qstnNode.quizType].printOption)


	                                                        }
	                                                    }

	                                                });

	                                var serializer = new XMLSerializer();
	                                var editedXML = serializer
	                                        .serializeToString(xml);
	                                qstnNode.data = editedXML;
	                                
	                                return qstnNode;
	                                
	                            }
							 
							 function updateFillInBlankTemplatePrefilledtext(qstnNode) {
								 var xml = jQuery.parseXML(qstnNode.data);
								 var response = $(xml).find('responseDeclaration');
								 for(var i = 0; i< response.length; i ++){
									 var mapEntry = response.eq(i).find("mapEntry").eq(0);
									 if(mapEntry.attr("mapKey").length == 0)
										 mapEntry.attr("mapKey","Correct answer for blank " + String.fromCharCode(65 + i ) )
								 }
								 var serializer = new XMLSerializer();
                                 var editedXML = serializer
                                        .serializeToString(xml);
                                 qstnNode.data = editedXML;
                                
                                 return qstnNode;
							 }
							 
							function updateTemplatePrefilledtext(qstnNode) {
								var xml = jQuery.parseXML(qstnNode.data);

								if (QTI.getContent($(xml).find('itemBody').find('p')) == "") {
									if (qstnNode.IsDefaultEditView) {					

										var captionHtml = replaceImage($(document
												.querySelector("li[printmode = false] #qtiCaption")));
										if (captionHtml == "") {
											captionHtml = CustomQuestionTemplate[qstnNode.quizType].printCaption;
										}

										QTI.prependNodeContent($(xml).find('itemBody').find('p').eq(0),captionHtml);
									}else{
										QTI.prependNodeContent($(xml).find('itemBody').find('p').eq(0),CustomQuestionTemplate[qstnNode.quizType].printCaption)
									}
								}

								var optionsHtml = $(
										document
												.querySelector("li[printmode = false] form"))
										.find('div.optionTextEditablediv');
								var optionHtmlText = '';

								$(xml)
										.find('itemBody')
										.find('choiceInteraction')
										.find("simpleChoice")
										.each(
												function(i, e) {

													if (QTI.getContent($(this)) == "") {
														if (qstnNode.IsDefaultEditView) {

															optionHtmlText = replaceImage(optionsHtml
																	.eq(i));

															if (optionHtmlText == "") {
																optionHtmlText = CustomQuestionTemplate[qstnNode.quizType].printOption;
															}

															 QTI.prependNodeContent($(this),optionHtmlText)

														} else {

															 QTI.prependNodeContent($(this),CustomQuestionTemplate[qstnNode.quizType].printOption);


														}
													}

												});

								var serializer = new XMLSerializer();
								var editedXML = serializer
										.serializeToString(xml);
								qstnNode.data = editedXML;

								return qstnNode;
								
							}
							$scope.saveAs_Test = function (title, containerFolder) {
							    var test = SharedTabService.tests[SharedTabService.currentTabIndex];
							    test.saveMode = EnumService.SAVE_MODE.SaveAs;
							    test.title = title;
							    test.tempFolderGuid = test.folderGuid;
							    test.folderGuid = containerFolder == null ? null : containerFolder.guid;
							    $scope.testTitle = title;
							    $scope.containerFolder = containerFolder;
							    $scope.saveTest();
							    $scope.testType = 'Test';
							}
							$scope.showMessage_EmptyTestTitle = function () {
							    $scope.IsConfirmation = false;
							    $scope.message = EnumService.ERROR_MESSAGES.EmptyTestTitle;
							    $modal.open(confirmObject);
							}
							// Function is to save the Test details with the
							// questions.
							
							$scope.showSaveErrorMessage = function(){
								var msg = e8msg.error.save;
								var messageTemplate ='<p class="alert-danger"><span class="glyphicon glyphicon-alert"></span><span class="warnMessage">' + msg  + '</p> ';
								$scope.positions = ['center', 'left', 'right'];
								$scope.position = $scope.positions[0];
								notify({
									messageTemplate: messageTemplate,						                
									classes: 'alert alert-danger',	
									position: $scope.position,
									duration: '1500'
								});
							};
							
							$scope.saveTest = function(callback) {
								$scope.editedQuestions = [];
								$scope.editedMigratedQuestions = [];
								
							    $rootScope.blockPage.start();
								var test = SharedTabService.tests[SharedTabService.currentTabIndex];
								if (test.title == null
										|| test.title.length <= 0) {
								    $scope.showMessage_EmptyTestTitle();
								    $rootScope.blockPage.stop();
									//$scope.IsConfirmation = false;
									//$scope.message = "Please Enter Test Title to save the test.";

									//$modal.open(confirmObject);
									return;
								}
								
								var MultipleResponseAnswerNotSelected = false ;
								$.each(test.questions, function (index, qstn) {
									if(qstn.IsEditView && !$scope.IsAnswerSelected(qstn)){
										MultipleResponseAnswerNotSelected = true;
										return;
									}
								});
								
								if(MultipleResponseAnswerNotSelected){
									 $rootScope.blockPage.stop();
									 return ;
								}
								
                            	var duplicateTitle = false;
                            	
                                TestService.getTests(test.folderGuid, function(tests){

                                    tests.forEach(function (folderTest) {
                                        if (test.saveMode === EnumService.SAVE_MODE.SaveAs && folderTest.title == test.title) {
                                            duplicateTitle = true;
                                        } else if (test.saveMode === EnumService.SAVE_MODE.Save && folderTest.guid !== test.testId && folderTest.title == test.title) {
                                            duplicateTitle = true;
                                        }
                                    });
                                    
                                    if (duplicateTitle ) {
                                        
                                    	$scope.IsConfirmation = false;
                                        $scope.message = "A test already exists with this name. Please save with another name.";
                                        $modal.open(confirmObject);
                                        if (test.saveMode === EnumService.SAVE_MODE.SaveAs) {
                                            test.folderGuid = test.tempFolderGuid;
                                            $scope.containerFolder = null;
                                        }
                                        if (callback) {
                                            callback();
                                        }
                                        test.saveMode = EnumService.SAVE_MODE.Save;
                                        $scope.setTestType();
                                        $rootScope.blockPage.stop();         							    
                                    	return;
                                    }

                                    if (test.saveMode === EnumService.SAVE_MODE.SaveAs) {
                                        test.testId = null;
                                        $scope.testGuid = null;
                                        test.saveMode = EnumService.SAVE_MODE.Save;
                                    }
                                                                        
    								$scope.testTitle = test.title;

    								// Building the json to create the test.
    								var testcreationdata = {
    									"metadata" : {
    										"crawlable" : "true"
    									},
    									"body" : {
    										"@context" : "http://purl.org/pearson/paf/v1/ctx/core/StructuredAssignment",
    										"@type" : "StructuredAssignment",
    										"assignmentContents" : {
    											"@contentType" : "application/vnd.pearson.paf.v1.assignment+json",
    											"binding" : []
    										}
    									}
    								};
    								testcreationdata.body.title = $scope.testTitle;
    								testcreationdata.body.guid = $scope.testGuid;

    								if (test.testId != null) {
    									testcreationdata.metadata = test.metadata;
    								}

    								testcreationdata.metadata.title = $scope.testTitle;

    								var index = 0;    								
    								var QuestionEnvelops = [];
    								var userSettings = {};
    								userSettings.questionMetadata = {};

    								$.each(SharedTabService.userQuestionSettings, function (index, value) {
    								    userSettings['questionMetadata'][value] = '';
    								});
    								
    								var editedQstns = $.grep(test.questions, function(qstn) {
    									var QuestionEnvelop = buildQuestionEnvelop(qstn);
    									QuestionEnvelops.push(QuestionEnvelop);    									
    								});
    								SharedTabService.tests[SharedTabService.currentTabIndex].IsAnyQstnEditMode=false;    
    								TestService.saveQuestions(QuestionEnvelops, function(questionsResult) {
    									
										if(questionsResult == null) {
											$rootScope.blockPage.stop();
											$scope.showSaveErrorMessage();
											return;
										}
										
    									var questionIndex = 0;
    									questionsResult.forEach(function(questionItem) {
    										var question = JSON.parse(questionItem);
    										var guid = question[0].guid;

    										
    										
    										if(test.questions[questionIndex].IsEdited) {
    											if(!test.questions[questionIndex].qstnTemplate){
    												$scope.editedMigratedQuestions.push(test.questions[questionIndex].guid);
    											}
    											test.questions[questionIndex].guid = guid;
    											test.questions[questionIndex].extendedMetadata = QuestionEnvelops[questionIndex].metadata.extendedMetadata;   
    											var createdQstnCopy = angular.copy(test.questions[questionIndex]);
    											$scope.editedQuestions.push(createdQstnCopy);
    										}else{
    											test.questions[questionIndex].guid = guid;
    										}
    										
    										test.questions[questionIndex].IsEdited = false; 
    										questionIndex = questionIndex + 1;
    										
    										testcreationdata.body.assignmentContents.binding
    												.push({
    													guid : guid,
    													activityFormat : "application/vnd.pearson.qti.v2p1.asi+xml",
    													bindingIndex : index
    												});
    										index = index + 1;
    									})									

    									TestService.saveTestData(testcreationdata, test.folderGuid, function(testResult) {
    										
    										if(testResult == null) {
    											$rootScope.blockPage.stop();
    											$scope.showSaveErrorMessage();
    											return;
    										}
    										
    									    var isEditMode = false,
                                                oldGuid = null,
                                                test = SharedTabService.tests[SharedTabService.currentTabIndex];

    									    if (test.testId) {
    									        isEditMode = true;
    									    }
    									    SharedTabService.currentTab = jQuery.extend(true, {}, test);
    									    oldGuid = test.id;
    									    test.testId = testResult.guid;
    									    test.id = testResult.guid;
    									    test.tabTitle = test.title;
    									    test.metadata = testcreationdata.metadata;

    									    if (test.treeNode && test.treeNode.testType === EnumService.TEST_TYPE.PublisherTest) {
    									        test.treeNode.testType = EnumService.NODE_TYPE.test;
    									        test.treeNode.showEditIcon = true;
    									    }
    										$scope.testGuid = testResult.guid;
    										$scope.newVersionBtnCss = "";
    										$scope.exportBtnCss = "";
    										
    										if (oldGuid !== test.id && test.treeNode) {//save as
    										    test.treeNode.showEditIcon = true;
    										    test.treeNode.showArchiveIcon= true;
    										    test.treeNode.draggable = true;
    										}
    										testResult.title = test.title;
    										testResult.modified = (new Date()).toJSON();
    										$rootScope.$broadcast('handleBroadcast_AddNewTest', testResult, $scope.containerFolder, isEditMode, oldGuid, $scope.editedQuestions, $scope.editedMigratedQuestions, test, $scope);
    										$scope.containerFolder = null; //clear selected folder in save as dialog popup.
                                             
    										

    										if (callback) {
    										    callback();
    										}
    										$rootScope.blockPage.stop();
    									});
    									        								
    								});                                                                

    								
								});

							}

							// Rendering the question as html
							$scope.getHTML = function(datanode) {
								if (datanode.node.length) {								
									return $sce
											.trustAsHtml(datanode.node[0].innerHTML);
								} else if (datanode.node) {								
									return $sce
									.trustAsHtml( datanode.node.textHTML);
								}
							}
							
							// Rendering the question as html while editing the question
							$scope.getEditedHTML = function(datanode) {
								if (datanode.node) {								
									return $sce
									.trustAsHtml( datanode.node.textHTML);
								}
							}
							
							

							// second tree model, place holder for the dragged
							// questions.
							// $scope.tree2 = [];

							// versioning
							/*
							 * $scope.versions = SharedTabService.versions;
							 * $scope.isQuestions = true; $scope.isAnswers =
							 * true;
							 * 
							 * $scope.isViewVersions = true;
							 * 
							 * $scope.selectedVersions =
							 * SharedTabService.versions[1]; $scope.noOfVersions =
							 * SharedTabService.versions[1].number;
							 * $scope.selectVersion = function (version) {
							 * $scope.noOfVersions = version.number; };
							 */
							$scope.createNewVersion = function(scope) {

								$scope.currentTab = SharedTabService.tests[SharedTabService.currentTabIndex];

								var scrambleType;
								if (scope.isQuestions && scope.isAnswers) {
									scrambleType = 2;
								} else if (scope.isQuestions) {
									scrambleType = 0;
								} else if (scope.isAnswers) {
									scrambleType = 1;
								}
								if (scrambleType == undefined) {
									$scope.IsConfirmation = false;
									$scope.message = "Please select scramble choice";
									$modal.open(confirmObject);
									/*
									 * this.alert("Please select scramble
									 * choice");
									 */
									return false;
								}

								$scope.versioningOptions = {
									"scrambleType" : scrambleType,
									"noOfVersions" : scope.noOfVersions
								};
								$scope.isViewVersions = scope.isViewVersions;

								$rootScope.blockPage.start();

								TestService.createVersions(this, function (scope, testResult) {
									if(testResult==null){
										$rootScope.blockPage.stop();
										CommonService.showErrorMessage(e8msg.error.cantCreateVersions);
			                    		return;
									}
								    try {
								        $scope.versionedTests = testResult;
								        $scope.currentTab = SharedTabService.tests[SharedTabService.currentTabIndex];
								        $scope.currentTab.modified = (new Date()).toJSON();
								        $scope.maping = {};
								        $scope.count = 0;

								        $scope.versionedTests.forEach(function (node) {
								            var testID = node.guid;
								            TestService.getMetadata(testID, function (result) {
								                $scope.maping[node.guid] = result;
								                $scope.count = $scope.count + 1;
								                if ($scope.count == $scope.versionedTests.length) {
								                    result.showEditIcon = false;
								                    result.showArchiveIcon = false;
								                    result.draggable = false;
								                    $scope.bindTabs();
								                }
								            });
								        });

								        $scope.bindTabs = function () {
								            $scope.versionedTests.forEach(function (node) {
								                var treeNode = $scope.maping[node.guid];
								                if (treeNode.guid != node.guid) {
								                    return false;
								                }
								                treeNode.nodeType = EnumService.NODE_TYPE.test;
								                treeNode.folderGuid = $scope.currentTab.folderGuid;

								                if (SharedTabService.selectedMenu == SharedTabService.menu.myTest) {
								                    $rootScope.$broadcast('handleBroadcast_CreateVersion', SharedTabService.tests[SharedTabService.currentTabIndex], treeNode);
								                }
								                // create tabs
								                if ($scope.isViewVersions) {
								                    var newTestTab = new SharedTabService.Test(SharedTabService.tests[SharedTabService.currentTabIndex]);
								                    newTestTab.questions = [];
								                    newTestTab.id = treeNode.guid;
								                    newTestTab.testId = treeNode.guid;
								                    newTestTab.title = treeNode.title;
								                    newTestTab.tabTitle = treeNode.title;
								                    newTestTab.metadata = treeNode;
								                    newTestTab.treeNode = treeNode;
								                    newTestTab.folderGuid = (typeof (treeNode.folderId) == 'undefined') ? null : treeNode.folderId;
								                    SharedTabService.prepForBroadcastTest(newTestTab);
								                }
								            });
								        };
								    } catch (e) {
								        console.log(e);
								    } finally {
								        $rootScope.blockPage.stop();
								    };
								});

								return true;
							}

							$scope.TestVersion_open = function() {
							    if (!SharedTabService.tests[SharedTabService.currentTabIndex].testId) {
							        return false;
							    }
							    SharedTabService.tests[SharedTabService.currentTabIndex].isBtnClicked=true;
								$modal.open({
											templateUrl : 'views/partials/testVersionPopup.html',
											controller : 'TestVersionCreationController',
											windowClass: 'testversion-Modal',
											backdrop : 'static',
											keyboard : false,
											resolve : {
												parentScope : function() {
													return $scope;
												}
											}
										});
							};

							$scope.open = function() {
							    if (!SharedTabService.tests[SharedTabService.currentTabIndex].testId) {
							        return false;
							    }
							    SharedTabService.tests[SharedTabService.currentTabIndex].isBtnClicked=true;
								$modal.open({
											templateUrl : 'views/partials/exportPopup.html',
											controller : 'ExportTestController',
											size : 'md',
											backdrop : 'static',
											keyboard : false,
											resolve : {
												parentScope : function() {
                                                    return $scope;
												}
											}
										});
							};
							
							$scope.print = function() {
							    if (!SharedTabService.tests[SharedTabService.currentTabIndex].testId) {
							        return false;
							    }
							    SharedTabService.tests[SharedTabService.currentTabIndex].isBtnClicked=true;
								$modal.open({
											templateUrl : 'views/partials/printPopup.html',
											controller : 'PrintTestController',
											size : 'lg',
											backdrop : 'static',
											keyboard : false,
											windowClass : 'print-Modal',
											resolve : {
												parentScope : function() {
                                                    return $scope;
												}
											}
										});
							};

						    // save confirmation on close button clicked..
						    //TODO: renamed 'Confirmation_Open' to 'open_CloseConfirmation'. need to remove this comment later, if there is no impact.
							$scope.open_CloseTabConfirmation = function (tab) {
							    $scope.closingTab = tab;
								$modal
										.open({
											templateUrl : 'views/partials/saveConfirmationPopup.html',
											controller : 'SaveConfirmationController',
											backdrop : 'static',
											keyboard : false,
											resolve : {
												parentScope : function() {
													return $scope;
												}
											}
										});
							}

							// #region Test wizard *************************

							$scope.SelecteNumberOnly = function(criteria) {
								criteria.numberOfQuestionsEntered = criteria.numberOfQuestionsEntered
										.replace(/[^\d]/g, '');
					        	if($scope.isApplySameCriteriaToAll)
								{
					        		$($scope.tests[$scope.sharedTabService.currentTabIndex].criterias).attr("numberOfQuestionsEntered",criteria.numberOfQuestionsEntered);
					    		}
								/*
								 * if (criteria.numberOfQuestionsEntered == 0) {
								 * criteria.numberOfQuestionsSelected =
								 * SharedTabService.setDefault_numberOfQuestionsSelected(criteria.totalQuestions); }
								 * else { criteria.numberOfQuestionsSelected =
								 * null; }
								 */
							}

							$scope.fillQuestionCount = function(criteria) {
								criteria.numberOfQuestionsEntered = null;
								if ($scope.isApplySameCriteriaToAll) {
									$(
											$scope.tests[$scope.sharedTabService.currentTabIndex].criterias)
											.attr("numberOfQuestionsEntered",
													null);
									$(
											$scope.tests[$scope.sharedTabService.currentTabIndex].criterias)
											.attr(
													"numberOfQuestionsSelected",
													criteria.numberOfQuestionsSelected);
								}
							}

							$scope.toggleQuestiontypeSelection = function(
									criteria, questiontype) {
								var idx = criteria.selectedQuestiontypes
										.indexOf(questiontype);
								if (idx > -1) {// is currently selected
									criteria.selectedQuestiontypes.splice(idx,
											1);
									if ($scope.isApplySameCriteriaToAll)
										$scope.sharedTabService
												.propagateSelectedQuestionTypes(
														$scope, idx,
														questiontype, false)
								} else { // is newly selected
									criteria.selectedQuestiontypes
											.push(questiontype);
									if ($scope.isApplySameCriteriaToAll)
										$scope.sharedTabService
												.propagateSelectedQuestionTypes(
														$scope, idx,
														questiontype, true)
								}

							};
							$scope.isApplySameCriteriaToAll = false;
							$scope.toggleApplySameCriteria = function(criteria) {
								$scope.isApplySameCriteriaToAll = !$scope.isApplySameCriteriaToAll
								if ($scope.isApplySameCriteriaToAll) {
									$scope.sharedTabService
											.propagateCriteria($scope);
								} else {
									$scope.sharedTabService
											.resetCriteriaToDefault($scope)
								}
							};

							$scope.previevTest = function() {
								var isError = false;
								// $scope.tests[currentIndex].criterias.metadata.sort(randomize);
								// console.log($scope.tests[currentIndex].criterias.metadata.sort(randomize));
							    var metadatas = [];
								SharedTabService.errorMessages = [];
								$scope.sharedTabService.tests[$scope.sharedTabService.currentTabIndex].criterias
										.forEach(function(criteria) {
											if (criteria.selectedQuestiontypes.length) {
												var arr = [];
												criteria.metadata
														.forEach(function(item) {
															if (criteria.selectedQuestiontypes
																	.indexOf(item.quizType) != -1) {
																arr.push(item);
															}
														});
												arr = arr.sort(randomize);
												if (arr.length < criteria.numberOfQuestionsSelected) {
													var type = '';
													if (criteria.selectedQuestiontypes.length == 1) {
														type = criteria.selectedQuestiontypes[0];
														SharedTabService
																.addErrorMessage(
																		criteria.treeNode.title,
																		SharedTabService.errorMessageEnum.NotEnoughQuestionsAvailableForType_prefix
																				+ type
																				+ SharedTabService.errorMessageEnum.NotEnoughQuestionsAvailableForType_suffix);
													} else {

														for (var i = 0; i < criteria.selectedQuestiontypes.length; i++) {
															if (i == criteria.selectedQuestiontypes.length - 1) {
																type = type
																		.slice(
																				0,
																				-2);
																type += ' and '
																		+ criteria.selectedQuestiontypes[i];
															} else {
																type += criteria.selectedQuestiontypes[i]
																		+ ', ';
															}
														}
														SharedTabService
																.addErrorMessage(
																		criteria.treeNode.title,
																		SharedTabService.errorMessageEnum.NotEnoughQuestionsAvailableForType_prefix
																				+ type
																				+ SharedTabService.errorMessageEnum.NotEnoughQuestionsAvailableForTypes_suffix);
													}
													isError = true;

												}
											} else {
												var errorMessage=SharedTabService.errorMessageEnum.NoQuestionTypeSelected;
												if ($scope.isApplySameCriteriaToAll) {
													var errorMessage=SharedTabService.errorMessageEnum.NoQuestionTypeSelected_Subsection;
												}
												SharedTabService.addErrorMessage(criteria.treeNode.title, errorMessage);
												isError = true;
												arr = criteria.metadata
														.sort(randomize);
											}
											//assign the numberOfQuestionsEntered to numberOfQuestionsSelected only if there is 
											//no error while creating the test. 
											//ref : Bug 6582 - Radio button de-selected when alert message appears while creating Test using Test Wizard
										    /*
											if (criteria.numberOfQuestionsEntered > 0 && isError == false && !isTestTitleEmpty()) {
												criteria.numberOfQuestionsSelected = criteria.numberOfQuestionsEntered;
											}
                                            */
											var noOfQuestionsSelected = criteria.numberOfQuestionsEntered > 0 ? criteria.numberOfQuestionsEntered : criteria.numberOfQuestionsSelected; 
                                            if (!noOfQuestionsSelected || noOfQuestionsSelected > criteria.totalQuestions) {
												criteria.isError = true;
												SharedTabService.addErrorMessage(criteria.treeNode.title, SharedTabService.errorMessageEnum.NotEnoughQuestionsAvailable);
												isError = true;
												return false;
											} else {
                                                metadatas = metadatas.concat(arr.slice(0, noOfQuestionsSelected));
											}
										});
								if (isError) {
									SharedTabService.TestWizardErrorPopup_Open(SharedTabService.errorMessages);
									return false;
								} else {
									var test = SharedTabService.tests[SharedTabService.currentTabIndex];
									if (isTestTitleEmpty(test)) {
										$scope.IsConfirmation = false;
										$scope.message = "Please enter test title to save the test.";

										$modal.open(confirmObject);
										return false;
									}
									test.criterias
											.forEach(function(criteria) {
												criteria.treeNode.isNodeSelected=false;
												criteria.treeNode.showEditQuestionIcon = false;
											})
								}
								$scope.tests[$scope.sharedTabService.currentTabIndex].isTestWizard = false;
								$scope.sharedTabService.isTestWizardTabPresent = false;
								$scope.tests[$scope.sharedTabService.currentTabIndex].tabTitle = "Untitled test";
								$scope.tests[$scope.sharedTabService.currentTabIndex].questions = metadatas;
								QTI.initialize();
								test.criterias=[];
								$scope.saveTest(function () {
								        $rootScope.blockPage.start();	
								        $scope.tests[$scope.sharedTabService.currentTabIndex].questions = [];
								        $scope.render(metadatas);
								        $scope.isApplySameCriteriaToAll = false;
								});
							}
							function randomize(a, b) {
								return Math.random() - 0.5;
							}
							var isTestTitleEmpty = function(test) {
								if(test == null)
									test = SharedTabService.tests[SharedTabService.currentTabIndex];
								if (test.title == null
										|| test.title.length <= 0)
									return true;
								else
									return false;
							}
							// TODO: code optimization is need.
							$scope.render = function(metadatas) {
								if (metadatas.length == 0) {
									return false;
								}

								var question = metadatas.shift();
								
								 var userSettings= {};	
								 userSettings.questionMetadata = {};
								 
								 $.each(SharedTabService.userQuestionSettings, function( index, value ) {	
									 userSettings['questionMetadata'][value]='';																										
									});			

								TestService
										.getQuestionById(
												question.guid,
												function(response) {
													var displayNodes = $("<div></div>");	
													QTI.BLOCKQUOTE.id = 0;
													QTI.play(response,
													displayNodes, false,false,question.quizType);
													var displayNode = {};

													displayNode.guid = question.guid;
													displayNode.textHTML = displayNodes.html();
													
													displayNode.IsEditView = false;
													displayNode.qstnLinkText = displayNode.IsEditView ? "View"
															: "Edit";
													displayNode.data = 	response;
													displayNode.quizType = 	question.quizType;
													
													displayNode.questionMetadata = userSettings.questionMetadata;
													displayNode.extendedMetadata = question.extendedMetadata;
													
													 displayNode.IsUserMetdataAvailable = false;
													 if (SharedTabService.userQuestionSettings.length>0){
														 displayNode.IsUserMetdataAvailable = true;
													 }
													$.each(displayNode.extendedMetadata, function(index, item){																							
														var name = item['name'].charAt(0).toUpperCase() + item['name'].slice(1);
										                if((typeof(displayNode['questionMetadata'][name])!='undefined')||((typeof(displayNode['questionMetadata']['Difficulty'])!='undefined') && (name=='QuestionLevelOfDifficulty'))) {
										                	if (item['name'] == "questionLevelOfDifficulty")
										                		displayNode['questionMetadata']['Difficulty'] = item['value'];
										                	else{
										                		
										                		displayNode['questionMetadata'][name] = item['value'].replace(/&ndash;/g, '-');
										                	}
										                }
													});
													
													
													displayNode.selectedLevel = displayNode.questionMetadata['Difficulty']==undefined?{name:'Select Level',value:'0'}:{name:displayNode.questionMetadata['Difficulty'],value:displayNode.questionMetadata['Difficulty']};
													
													displayNode.qstnMasterData = buildQstnMasterDetails(displayNode);
													displayNode.optionsView = displayNode.qstnMasterData.optionsView;
													displayNode.EssayPageSize = displayNode.qstnMasterData.EssayPageSize;
																							
													// $scope.tree2.push(displayNode);
													SharedTabService.tests[SharedTabService.currentTabIndex].questions
															.push(displayNode);
													SharedTabService.masterTests[SharedTabService.currentTabIndex].masterQuestions
															.push(displayNode);// is
																				// to
																				// check
																				// for
																				// dirty.
													if (metadatas.length > 0) {
														$scope
																.render(
																		metadatas,
																		SharedTabService.currentTabIndex);
													} else {
													     $scope.blockPage.stop();
													}
												});
							};
						    // #endregion Test wizard *************************

						    //Open Save-As Test dialog model popup.
							$scope.openSaveAsTestDialog = function () {
							    $modal.open({
							        templateUrl: 'views/partials/save-test-dialog-popup.html',
							        controller: 'SaveTestDialogController',
							        size: 'md',
							        backdrop: 'static',
							        keyboard: false,
							        resolve: {
							            parentScope: function () {
							                return $scope;
							            }
							        }
							    });
							}

						    // #region Broadcast handles
							$scope.$on('handleBroadcastTests', function () {
							    $scope.tests = SharedTabService.tests;
							});
							$scope.$on('handleBroadcastCurrentTabIndex', function () {
							    $scope.currentIndex = SharedTabService.currentTabIndex;
							});
							$scope.$on('handleBroadcast_AddNewTab', function () {
							    $scope.addNewTest($scope);
							});
							$scope.$on('handleBroadcast_AddTestWizard', function () {
								$scope.isApplySameCriteriaToAll = false;
							    resetTabs();
							    SharedTabService.addTestWizard($scope);
							});
							$scope.$on('handleBroadcast_createTestWizardCriteria',
											function (event, response,quizTypes,
													currentNode) {
								
												var filteredQuestions=[];
											    if(quizTypes!=""){
											    	response.forEach(function(question){
												    	if(quizTypes.indexOf(question.quizType)>-1){
												    		filteredQuestions.push(question);
												    	}
												    });	
											    }else{
											    	filteredQuestions=response;
											    }
							    
											    $scope.addTestWizardCriteria(
											    		filteredQuestions, currentNode);
											});
							$scope.$on('handleBroadcast_AddQuestionsToTest', function (event, response, quizTypes, currentNode) {
							    QTI.initialize();
							    
							    response = $.grep(response,function(obj, index){
							    	var find = false;
							    	SharedTabService.tests[SharedTabService.currentTabIndex].questions.forEach(function(item){
							    		if(item.guid == obj.guid)
							    			find = true;
							    	})
							    	return !find;
							    })
							    
							    var filteredQuestions=[];
							    if(quizTypes!=""){
							    	response.forEach(function(question){
								    	if(quizTypes.indexOf(question.quizType)>-1){
								    		filteredQuestions.push(question);
								    	}
								    });	
							    }else{
							    	filteredQuestions=response;
							    }
							    
							    $scope.renderQuestions(filteredQuestions,
                                        $scope.currentIndex);
							})
						    // #endregion Broadcast handles
							
							
							
							
							function filterEditorDefaultPtag(ModifiedOptions){
								var Options = [];
								$.each(ModifiedOptions,
										function(index,option) {
									if(option.startsWith('<p>')){
										option = option.substring(3, option.length-4);
									}			
									Options.push(option);
								});
								
								return Options;
								
							}
							
							function matchingOptions(matchingOptions){
								var Options = [];
								$.each(matchingOptions,
										function(index,option) {
									if(option.matchingOption.startsWith('<p>')){
										Options.push(option.matchingOption.substring(3, option.matchingOption.length-4));
									}else{
										Options.push(option.matchingOption);
									}			
								});
								
								return Options;
								
							}
							
							function leftOptions(matchingOptions){
								var Options = [];
								$.each(matchingOptions,
										function(index,Option) {
									if(Option.option.startsWith('<p>')){
										Options.push(Option.option.substring(3, Option.option.length-4));
									}else{
										Options.push(Option.option);
									}			
								});
								
								return Options;
								
							}

							function getQuestionModifiedModel(node) {								

								var qstnModifiedData = {};			

								qstnModifiedData.caption = node.qtiModel.Caption;	
								if(qstnModifiedData.caption.startsWith('<p>')){
									qstnModifiedData.caption = qstnModifiedData.caption.substring(3, qstnModifiedData.caption.length-4);
								}			
								qstnModifiedData.questionMetadata = node.questionMetadata;		

									switch (node.quizType) {
									case 'MultipleChoice':
									case 'MultipleResponse':
									case 'TrueFalse':					
										qstnModifiedData.options = filterEditorDefaultPtag(node.qtiModel.Options);
										qstnModifiedData.optionCount = node.qtiModel.Options.length;				
										qstnModifiedData.correctAnswer =  node.qtiModel.CorrectAnswer;
										qstnModifiedData.optionsView = node.qtiModel.Orientation;						
										break;

									case 'Essay':						
										qstnModifiedData.EssayPageSize =node.EssayPageSize;			
										qstnModifiedData.RecommendedAnswer = node.qtiModel.RecommendedAnswer;					
										break;					

									case 'Matching':	
										qstnModifiedData.leftOptions = leftOptions(node.qtiModel.Options);	
										qstnModifiedData.rightOptions = matchingOptions(node.qtiModel.Options);
										break;

									case 'FillInBlanks':										
										/*qtiModel.FbCaption = node..FbCaption;
										qtiModel.PrintOption = qtiModel.PrintOption;									
										qtiModel.CorrectAnswer = qtiModel.CorrectAnswer;		*/

										break;
									}			
								
							return qstnModifiedData;

							}

							$scope.IsQuestionModified = function(node){
								var qstnModifiedData = getQuestionModifiedModel(node);				
								return !angular.equals(node.qstnMasterData,qstnModifiedData);
							}
							
							var buildQuestionEnvelop = function(qstn){
								
								if(qstn.IsEditView){    	
									
									if(qstn.quizType=='FillInBlanks'){
										updateFIBQuestionAnswers(qstn);		
									}    										
									
									if(!qstn.qstnTemplate){    										
										qstn.IsEdited =  $scope.IsQuestionModified(qstn);
									}
									
								}								
								
								if(qstn.IsEdited){
									qstn.data = QtiService.getQtiXML(qstn);
								}    									
								
								qstn.qstnLinkText = qstn.IsEditView ? "Edit": "View";
								qstn.IsEditView = false;
								
								if(qstn.qstnTemplate){
                                    qstn.qstnTemplate = false;
                                }    								
								
								if (typeof (qstn.questionMetadata) == 'undefined') {

								    qstn.questionMetadata = userSettings.questionMetadata;

								    $.each(qstn.extendedMetadata, function (index, item) {

								        if (typeof (qstn['questionMetadata'][item['name']]) != 'undefined') {
								            qstn['questionMetadata'][item['name']] = item['value'].replace(/&ndash;/g, '-');
								        }

								    });
								    qstn.selectedLevel = qstn.questionMetadata['Difficulty'] == undefined ? { name: 'Select Level', value: '0' } : { name: qstn.questionMetadata['Difficulty'], value: qstn.questionMetadata['Difficulty'] };
								}
								var qstnExtMetadata=[];													
							
								$.each(qstn.questionMetadata, function(KeyName, KeyValue){		
									if(KeyName == "Difficulty"){
										KeyValue = qstn.selectedLevel.value;
									}
									qstnExtMetadata.push({name:KeyName,value:KeyValue}) ;
								});													
																				
								var QuestionEnvelop = {
									metadata : {
										guid : qstn.IsEdited ? null
												: qstn.guid,
                                        title : qstn.title,
										description : qstn.description,
										quizType : qstn.quizType,
										subject : qstn.subject,
										timeRequired : qstn.timeRequired,
										crawlable : qstn.crawlable,
										keywords : qstn.keywords,
										versionOf : qstn.versionOf,
										version : qstn.version,
										extendedMetadata : qstnExtMetadata
									},
									body : qstn.IsEdited ? qstn.data : null
								};
								
								return QuestionEnvelop;
							}
							
							var updateFIBQuestionAnswers = function(qstn){
								qstn.qtiModel.CorrectAnswerHtml = $('#fbAnswerContainer').html();										
							}
							
							$scope.IsAnswerSelected = function(node){				
								if(node.IsEditView && node.quizType=='MultipleResponse'){
									var answerSelected=false;
									$.each(node.qtiModel.CorrectAnswer,
											function(index,answer) {
										if(answer){
											answerSelected=true;						
										}
									});				
									if(!answerSelected){
										$scope.IsConfirmation = false;
										$scope.message = "Atleast one correct Answer should be defined."
										$modal.open(confirmObject);			
										return false;
									}									
									
								}
								return true;
							}

							
							

						} ]);



angular.module('e8MyTests').directive('bindQti',
		[ 'directiveQtiService', function(directiveQtiService) {

			return function(scope, element, attrs) {				
				directiveQtiService.bindNewQti(scope, element, attrs);
			}

			/*
			 * return function(scope, element, attrs) { debugger; var
			 * ensureCompileRunsOnce = scope.$watch( function(scope) { debugger; //
			 * watch the 'bindUnsafeHtml' expression for changes return
			 * scope.$eval(attrs.bindQti); }, function(value) { // when the
			 * 'bindUnsafeHtml' expression changes // assign it into the current
			 * DOM debugger; element.html(value);
			 *  // compile the new DOM and link it to the current // scope. //
			 * NOTE: we only compile .childNodes so that // we don't get into
			 * infinite loop compiling ourselves
			 * $compile(element.contents())(scope);
			 * 
			 * ensureCompileRunsOnce(); } ); };
			 */
		} ])

angular.module('e8MyTests').service("directiveQtiService",
		[ '$compile', function($compile) {

			this.bindNewQti = function(scope, element, attrs) {

				var ensureCompileRunsOnce = scope.$watch(function(scope) {

					// watch the 'bindUnsafeHtml' expression for changes
					return scope.$eval(attrs.bindQti);
				}, function(value) {
					// when the 'bindUnsafeHtml' expression changes
					// assign it into the current DOM
						if(value!=undefined){
							element.html(value.$$unwrapTrustedValue());
							setTimeout(
									function() {
										
										$('.editViewContainer').find("#qtiCaption").eq(0).focus();
								

									}, 0);	
						}
							
					

					// compile the new DOM and link it to the current
					// scope.
					// NOTE: we only compile .childNodes so that
					// we don't get into infinite loop compiling ourselves
					$compile(element.contents())(scope);

					ensureCompileRunsOnce();
				});
			};
		} ]);
