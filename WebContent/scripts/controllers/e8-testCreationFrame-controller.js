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
						'$compile',
						'directiveQtiService', 'EnumService', 'UserService', 'CommonService','blockUI',
						function($scope, $rootScope, $location, $cookieStore,
								$http, $sce, TestService, SharedTabService,
								$modal, $compile, directiveQtiService, EnumService, UserService, CommonService,blockUI) {

							// $scope.tree2 =
							// SharedTabService.tests[SharedTabService.currentTabIndex].questions;
							$scope.controller = EnumService.CONTROLLERS.testCreationFrame;
							$scope.tests = SharedTabService.tests;
							$scope.currentIndex = SharedTabService.currentTabIndex;
							$scope.criterias = SharedTabService.tests[SharedTabService.currentTabIndex].criterias;
							
							if (SharedTabService.userQuestionSettings.length == 0){
								
								UserService.userQuestionMetadata(function(userQuestionMetadata){	
										$.each(userQuestionMetadata, function(index, item){	
												SharedTabService.userQuestionSettings.push(item);						

										});
							
								});
						}

							
							// $scope.isTestWizardTabPresent = false;
							$scope.sharedTabService = SharedTabService;

							/**
							 * ***************************************Start
							 * Question edit
							 * ***************************************
							 */
							$scope.showQstnEditIcon = false;
							$scope.closeQstnBtn = false;

							$scope.hoverIn = function(selectedQstn) {
								this.showQstnEditIcon = true;
								this.closeQstnBtn = true;
							};
							$scope.hoverOut = function() {
								this.showQstnEditIcon = false;
								this.closeQstnBtn = false;
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
								
								if(selectedQstnNode.node.quizType == "FillInTheBlanks"  &&  ($(selectedQstnNode.$element).find('#qtiCaption').find('button').length <= 0) && selectedQstnNode.node.IsEditView){
									$scope.IsConfirmation = false;
									$scope.message = "Add Blank to the Question";

									$modal.open(confirmObject);
									return;
									
								}
								var qstnHtml = selectedQstnNode.node.textHTML;
								this.showQstnEditIcon = !this.showQstnEditIcon;
								this.closeQstnBtn = !this.closeQstnBtn;
								selectedQstnNode.node.qstnLinkText = selectedQstnNode.node.IsEditView ? "Edit"
										: "View";
								selectedQstnNode.node.qstnLinkTitle = selectedQstnNode.node.IsEditView ? "View Question in print mode"
										: "View Question in edit mode";
								if (selectedQstnNode.node.IsEditView) {
									$scope.imageClicked = false;
									var p = $(
											angular
													.element(document
															.querySelector("#uploadImage")))
											.detach();
									$("#qstnArea").append(p);
									convertHtmlToXmlNode(selectedQstnNode);
									SharedTabService.tests[SharedTabService.currentTabIndex].IsAnyQstnEditMode = false;
								} else {
									SharedTabService.tests[SharedTabService.currentTabIndex].IsAnyQstnEditMode = true;
								}
								selectedQstnNode.node.IsEditView = !selectedQstnNode.node.IsEditView;
								selectedQstnNode.node.IsDefaultEditView = selectedQstnNode.node.IsEditView;								
							}

							function convertHtmlToXmlNode(selectedQstnNode) {
								var xml = jQuery
								.parseXML(selectedQstnNode.node.data);
								var qstnHTML = $(selectedQstnNode.$element);
								var qstnCaption = replaceImage(qstnHTML
										.find('#qtiCaption'));
		
								if(qstnHTML.find('#qtiCaption').find("button").length > 0){
									qstnCaption = QTI.replaceBlank(qstnHTML.find('#qtiCaption'),qstnCaption);
									$(xml).find('itemBody').find('p').eq(0).html(qstnCaption)
								}
								else{
									
									$(xml).find('itemBody').find('p').eq(0).html("<![CDATA[" +
											qstnCaption + "]]>");
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
								
								if(selectedQstnNode.node.quizType =="FillInTheBlanks"){
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
										
										$(item).find( "inlineChoiceInteraction" ).append(inlineChoiceTags.find( "inlineChoiceInteraction" ).html());
										
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
									$(xml).find('itemBody').find("textEntryInteraction").eq(0).attr("blankSize",qstnHTML.find(".BlankSizeDiv input[type=radio]:checked").attr("blankSize"))
									

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

								var qstnModifiedData = getMultipleChoiceQstn_MasterDetails($(xml));
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
								backdrop : 'static',
								keyboard : false,
								resolve : {
									parentScope : function() {
										return $scope;
									}
								}
							};

							$scope.removOption = function(selectedNode, event) {
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
								selectedNode.node.EssayPageSize = pageSize;
							}
							
							$scope.qstnBlankSize = function(selectedNode,
									blankSize) {
								selectedNode.node.BlankSize = blankSize;
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
								var optionText = qtiCaption.html().replace(/&nbsp;/g," ");
																
								cursorPosition = QTI.getActualCursorPosition1(cursorPosition,qtiCaption,optionText);
								var htmlEle =scope.$element.find('#crtAns').eq(0);
								var htmlOptionCnt = scope.$element.find('#crtAns').find('div').length;
								var lastId = scope.$element.find('#crtAns').find('div').length;

								var blankCount = qtiCaption.find("button").length;
								blankCount = blankCount + 1;
//								qtiCaption.html(optionText.substring(0,cursorPosition) + "<button contenteditable='false'><span class='blankWidth editView'>"+alphaArray[htmlOptionCnt]+"<span contenteditable='true' id='"+alphaArray[htmlOptionCnt]+"' onkeydown='QTI.getSpanId(this,event)' placeHolder='Blank Space' ></span></span></button>" + optionText.substring(cursorPosition + 1, optionText.length));
								qtiCaption.html(optionText.substring(0,cursorPosition) + "<button id='RESPONSE_"+ blankCount +" ' onkeydown='return QTI.getSpanId(this,event)' class='blankFIBButton '><span contenteditable='false' class='blankWidth editView'><b contenteditable='false'>" + String.fromCharCode(65 + blankCount - 1 ) + ".</b>Fill Blank</span></button>&nbsp;" + optionText.substring(cursorPosition, optionText.length));
															
								htmlEle.append($("<div class='editView editablediv' type='text' id='RESPONSE_"+blankCount+"' >"+String.fromCharCode(65 + blankCount - 1 )+".<div contenteditable='true' class='placeHolderForBlank' data-placeholder='Enter the correct answer for blank "+ String.fromCharCode(65 + blankCount - 1 ) +"'></div></div>"));
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
																	.startsWith(
																			"simpleChoice")) {
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
															var optionText = element
																	.html()
																	.replace(
																			/&nbsp;/g,
																			" ");
															cursorPosition = QTI.getActualCursorPosition(cursorPosition,element);
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
																							cursorPosition + 1,
																							optionText.length))
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
							    //TODO : need to chech below jquery code and look for any other alternative in AngularJS. 
								var editedElement = document
										.querySelector("div#qstnArea li[printmode=false]")
								if (editedElement) {
									var scopeElement = angular.element(
											editedElement).scope()
									convertHtmlToXmlNode(scopeElement);
								}

								SharedTabService.addNewTest($scope);
							}

							$scope.addTestWizard = function() {
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

							$scope.isLoading = false;
							$scope.onClickTab = function(test) {
								var editedElement = document
										.querySelector("div#qstnArea li[printmode=false]")
								if (editedElement) {
									var scopeElement = angular.element(
											editedElement).scope()
									convertHtmlToXmlNode(scopeElement);
								}

								SharedTabService.onClickTab(test, $scope);
								if (SharedTabService.tests[SharedTabService.currentTabIndex].testId) {
									$scope.newVersionBtnCss = "";
									$scope.exportBtnCss = "";
								} else {
									$scope.newVersionBtnCss = "disabled";
									$scope.exportBtnCss = "disabled";
								}

								if (test.testId && !test.questions.length) {
									$scope.isLoading = true;
									TestService
											.getTest(
													test.testId,
													function(testResult) {
														$scope
																.renderTest(
																		testResult.assignmentContents.binding,
																		testResult.title);
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
					            SharedTabService.closeQuestions(tab, $scope, index);					           
					        }
							$scope.closeTabWithConfirmation = function(tab) {
								SharedTabService.closeTabWithConfirmation(tab,
										$scope);
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
								if (isWizardCloseBtnClicked)
									SharedTabService.closeAllCriteria(folder,
											$scope);
								else
									SharedTabService.closeCriteria(folder,
											$scope);
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
											 
											 qstnMasterData = getMultipleChoiceQstn_MasterDetails(qstnXML);										 
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
							
							function getMultipleChoiceQstn_MasterDetails(qstnXML) {								
								var optionList = [];
								var correctAnswerList = [];
								$(qstnXML)
										.find(
												'setOutcomeValue[identifier="SCORE"] baseValue')
										.each(function(i, e) {

											if ($(this).text() == "1") {
												correctAnswerList.push(i);
											}
										});

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
								
								var nodeEssayPageSize = '0';
								if($(qstnXML).find('itemBody').find("extendedTextInteraction").length > 0)
									nodeEssayPageSize = $(qstnXML).find('itemBody').find("extendedTextInteraction").eq(0).attr("expectedLines")
									
									var nodeBlankSize = '20';
								if($(qstnXML).find('itemBody').find("textEntryInteraction").length > 0)
									nodeBlankSize = $(qstnXML).find('itemBody').find("textEntryInteraction").eq(0).attr("expectedLength")

								

								var qstnMasterData = {
									caption : $(qstnXML).find('itemBody').find('p')
											.html(),
									options : optionList,
									optionCount : $(qstnXML).find('itemBody').find(
											'choiceInteraction').find(
											"simpleChoice").length,
									correctAnswer : correctAnswerList,
									optionsView : nodeOptionsView,
									EssayPageSize : nodeEssayPageSize,
									BlankSize : nodeBlankSize
								}

								return qstnMasterData;
							}
							
							function getMatchingQstn_Details(qstnXML) {								
								var leftOptionList = [];
								var rightOptionList = [];
								
								$(qstnXML).find('itemBody').find(
								'blockquote').each(function(i, e) {

									leftOptionList.push($(this).find("p").eq(0).html());
								});
								
								$(qstnXML).find('itemBody').find(
								'blockquote').eq(0).find("inlineChoiceInteraction inlineChoice").each(function(i, e) {

									rightOptionList.push($(this).html());
								});
																
								

								var qstnMasterData = {
									caption : $(qstnXML).find('itemBody').find('p').eq(0).html(),
									leftOptions: leftOptionList ,
									rightOptions: rightOptionList,									
									optionCount : $(qstnXML).find('itemBody').find(
											'blockquote').length,
									optionsView : true
								}

								return qstnMasterData;
							}

						    $rootScope
									.$on(
											'beforeDropQuestion',
											function(event) {

												if (SharedTabService.tests[SharedTabService.currentTabIndex].IsAnyQstnEditMode) {
													$scope.IsConfirmation = false;
													$scope.message = "A question is already in Edit mode, save it before adding or reordering questions.";
													$modal.open(confirmObject);
													$scope.dragStarted = false;
												}

											});
						    $rootScope.$on('dropTest', function (event, selectedTest, destIndex) {
											$scope.editTest(selectedTest);
									});

							  $scope.Difficulty = [{name:'Select Level',value:'0'},
							                       {name:'Easy',value:'high'},
							                       {name:'Moderate',value:'medium'},
							                       {name:'Difficult',value:'low'}
							                      ];
							 
							                 
							  
							  $scope
									.$on(
											'dropQuestion',
											function(event, node, destIndex,
													sourceTabName) {
												var newNode = angular.copy(node);										
																								
												if (sourceTabName == "CustomQuestions") {													
													SharedTabService.tests[SharedTabService.currentTabIndex].IsAnyQstnEditMode = true;
												}
												newNode.IsUserMetdataAvailable = false;
												
													 newNode.questionMetadata = {};
													 if (SharedTabService.userQuestionSettings.length>0){
														 newNode.IsUserMetdataAvailable = true;
													 }
														
													 
														var tests = SharedTabService.tests[SharedTabService.currentTabIndex].questions;
																											 
														if (sourceTabName == "CustomQuestions") {
															
															 $.each(SharedTabService.userQuestionSettings, function( index, value ) {																	
																 if(value!='QuestionId'){
																 newNode['questionMetadata'][value]='';
																 }
															});		
															 
															newNode.IsEditView = true;
															newNode.editMainText = CustomQuestionTemplate[newNode.quizType].editMainText;
															newNode.IsEdited = true;
															newNode.IsDefaultEditView = true ;															
															newNode.selectedLevel = {name:'Select Level',value:'0'};	
															newNode.EssayPageSize = '0';
															newNode.BlankSize = '20';
															
														} else {
															
															 $.each(SharedTabService.userQuestionSettings, function( index, value ) {																	
																 newNode['questionMetadata'][value]='';																
															});		
															 
															newNode.IsEditView = false;
															newNode.editMainText = CustomQuestionTemplate["MultipleChoice"].editMainText;
																																	
															$.each(newNode.extendedMetadata, function(index, item){																	
																			 newNode['questionMetadata'][item['name']]=item['value'];																				
																		    });															
															
															newNode.selectedLevel = newNode.questionMetadata['Difficulty']==undefined?{name:'Select Level',value:'0'}:{name:newNode.questionMetadata['Difficulty'],value:newNode.questionMetadata['Difficulty']};
															
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
																		.forEach(function(
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
														
												
												 });
												
												
							$rootScope.$on('editTest',
									function(event, selectedTest) {
										$scope.editTest(selectedTest);
									});
						    
							$scope.editTest = function(selectedTest) {
								// selectedTest.node.disableEdit = true;
								$scope.newVersionBtnCss = "";
								$scope.exportBtnCss = "";
								$scope.testGuid = selectedTest.node.guid;
								$scope.selectedTestNode = selectedTest.node;
								/*$scope.BlockRightPanel =
								 blockUI.instances.get('RightPanel');
								 $scope.BlockRightPanel.start();*/

								// if Test is in root folder
								if (selectedTest.$parentNodeScope) {
									$scope.folderGuid = selectedTest.$parentNodeScope.node.guid;
									$scope.courseFolder = selectedTest.$parentNodeScope.node.title;
								} else {
									$scope.folderGuid = null;
								}

								$("#testCaption").val(selectedTest.node.title);
								$scope.isLoading = true;
								TestService
										.getTest(
												selectedTest.node.guid,
												function(test) {
													$scope
															.renderTest(
																	test.assignmentContents.binding,
																	selectedTest.node.title);
												})
								$scope.testTitle = selectedTest.node.title;
								$scope.metadata = TestService
										.getTestMetadata(selectedTest.node);
								SharedTabService.editTest($scope);
							}

							$scope.renderQuestions = function(qBindings,
									currentIndex) {
								if (qBindings.length == 0) {
									$scope.isLoading = false;
									 /*$scope.BlockRightPanel.stop();*/
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
															var displayNode = $("<div></div>")
															displayNode.guid = question.guid;	
															displayNode.quizType = questionMetadataResponse.quizType;
															displayNode.IsUserMetdataAvailable = false;
															 if (SharedTabService.userQuestionSettings.length>0){
																 displayNode.IsUserMetdataAvailable = true;
															 }
															QTI.play(response,
																	displayNode, false);
															
															displayNode.IsEditView = false;
															displayNode.qstnLinkText = displayNode.IsEditView ? "View"
																	: "Edit";
															displayNode.extendedMetadata =  questionMetadataResponse.extendedMetadata;
															displayNode.questionMetadata = userSettings.questionMetadata;
															
															$.each(displayNode.extendedMetadata, function(index, item){				
																if(typeof(displayNode['questionMetadata'][item['name']])!='undefined'){
																displayNode['questionMetadata'][item['name']]=item['value'];	
																}
															});	
											
												
															displayNode.selectedLevel = displayNode.questionMetadata['Difficulty']==undefined?{name:'Select Level',value:'0'}:{name:displayNode.questionMetadata['Difficulty'],value:displayNode.questionMetadata['Difficulty']};
												
												
															displayNode.data=response;
															
															displayNode.qstnMasterData = buildQstnMasterDetails(displayNode);
															displayNode.optionsView = displayNode.qstnMasterData.optionsView;
															displayNode.EssayPageSize = displayNode.qstnMasterData.EssayPageSize;	
															
													
															// $scope.tree2.push(displayNode);
															$scope.isLoading = false;
															SharedTabService.tests[currentIndex].questions
																	.push(displayNode);
															SharedTabService.masterTests[currentIndex].masterQuestions
																	.push(displayNode);// is
																						// to
																						// check
																						// for
																						// dirty.
															if (qBindings.length > 0) {
																$scope.renderQuestions(
																		qBindings,
																		currentIndex);
															} else {
																// $scope.BlockRightPanel.stop();
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

	                                        QTI.setContent($(xml).find('itemBody').find('p').eq(0),captionHtml);
	                                    }else{
	                                    	QTI.setContent($(xml).find('itemBody').find('p').eq(0),CustomQuestionTemplate[qstnNode.quizType].printCaption);
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
	                                                                optionHtmlText = CustomQuestionTemplate[qstnNode.quizType].printOption+ " "+ (i+1) + "__";;
	                                                            }
	                                                            
	                                                            QTI.prependContent($(this).find('p').eq(0),optionHtmlText)


	                                                        } else {
	                                                        	
	                                                        	QTI.prependContent($(this).find('p').eq(0),CustomQuestionTemplate[qstnNode.quizType].printOption)


	                                                        }
	                                                    }

	                                                });

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

										QTI.setContent($(xml).find('itemBody').find('p').eq(0),captionHtml);
									}else{
										QTI.setContent($(xml).find('itemBody').find('p').eq(0),CustomQuestionTemplate[qstnNode.quizType].printCaption)
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

															QTI.setContent($(this),optionHtmlText)

														} else {

															QTI.setContent($(this),CustomQuestionTemplate[qstnNode.quizType].printOption);


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
							    test.testId = null;
							    test.title = title;
							    test.folderGuid = containerFolder == null ? null : containerFolder.guid;
							    $scope.testTitle = title;
							    $scope.containerFolder = containerFolder;
							    $scope.testGuid = null;
							    $scope.saveTest();
							}
							// Function is to save the Test details with the
							// questions.
							$scope.saveTest = function() {

								var test = SharedTabService.tests[SharedTabService.currentTabIndex];
								if (test.title == null
										|| test.title.length <= 0) {
									$scope.IsConfirmation = false;
									$scope.message = "Please Enter Test Title to save the test.";

									$modal.open(confirmObject);
									return;
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

								var editedElement = document
								.querySelector("div#qstnArea li[printmode=false]")
								if (editedElement) {
									var scopeElement = angular.element(
											editedElement).scope();
									scopeElement.node.IsEditView = false;
									scopeElement.node.qstnLinkText = "Edit";
									convertHtmlToXmlNode(scopeElement);
									SharedTabService.tests[SharedTabService.currentTabIndex].IsAnyQstnEditMode=false;
									
								}
								

								var QuestionEnvelops = [];
								var userSettings = {};
								userSettings.questionMetadata = {};

								$.each(SharedTabService.userQuestionSettings, function (index, value) {
								    userSettings['questionMetadata'][value] = '';
								});

								var editedQstns = $
										.grep(
												test.questions,
												function(qstn) {

													if (qstn.qstnTemplate) {
														if(qstn.quizType=="Matching"){															
															qstn =  updateMatchingTemplatePrefilledtext(qstn);
														}else{														
														qstn =  updateTemplatePrefilledtext(qstn);
														}
													}
													if (typeof (qstn.questionMetadata) == 'undefined') {

													    qstn.questionMetadata = userSettings.questionMetadata;

													    $.each(qstn.extendedMetadata, function (index, item) {

													        if (typeof (qstn['questionMetadata'][item['name']]) != 'undefined') {
													            qstn['questionMetadata'][item['name']] = item['value'];
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
														body : qstn.IsEdited ? qstn.data
																: null
													};
													QuestionEnvelops
															.push(QuestionEnvelop);
												});

								TestService
										.saveQuestions(
												QuestionEnvelops,
												function(questionsResult) {
													questionsResult
															.forEach(function(
																	questionItem) {
																var question = JSON
																		.parse(questionItem);
																var guid = question[0].guid;

																testcreationdata.body.assignmentContents.binding
																		.push({
																			guid : guid,
																			activityFormat : "application/vnd.pearson.qti.v2p1.asi+xml",
																			bindingIndex : index
																		});
																index = index + 1;
															})

													TestService
															.saveTestData(
																	testcreationdata,
																	test.folderGuid,
																	function(
																			testResult) {
																	    var isEditMode = false;
																	    if (SharedTabService.tests[SharedTabService.currentTabIndex].testId) {
																	        isEditMode = true;
																	    }
																		SharedTabService.currentTab = jQuery.extend(true, {}, SharedTabService.tests[SharedTabService.currentTabIndex]);
																		SharedTabService.tests[SharedTabService.currentTabIndex].testId = testResult.guid;
																		SharedTabService.tests[SharedTabService.currentTabIndex].id = testResult.guid;
																		SharedTabService.tests[SharedTabService.currentTabIndex].tabTitle = test.title;
																		SharedTabService.tests[SharedTabService.currentTabIndex].metadata = testcreationdata.metadata;
//																		SharedTabService.currentTab = SharedTabService.tests[SharedTabService.currentTabIndex];
																		$scope.newVersionBtnCss = "";
																		$scope.exportBtnCss = "";
																		
																		testResult.title = test.title;
																		testResult.modified = (new Date()).toJSON();
																		$rootScope.$broadcast('handleBroadcast_AddNewTest', testResult, $scope.containerFolder, isEditMode);
																		$scope.containerFolder = null; //clear selected folder in save as dialog popup.
                                                                         
																		if (SharedTabService.tests[SharedTabService.currentTabIndex].isSaveAndClose) {
																			SharedTabService
																					.closeTab(
																							SharedTabService.currentTab,
																							$scope);
																			SharedTabService
																					.removeMasterTest(SharedTabService.currentTab);
																		} else {
																			SharedTabService
																					.removeMasterTest(SharedTabService.currentTab);
																			SharedTabService
																					.addMasterTest(SharedTabService.tests[SharedTabService.currentTabIndex]);
																		}
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
								// var self = this;
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

								TestService
										.createVersions(
												this,
												function(scope, testResult) {

													$scope.versionedTests = testResult;

													$scope.currentTab = SharedTabService.tests[SharedTabService.currentTabIndex];
													$scope.currentTab.modified = (new Date())
															.toJSON();
													//if (SharedTabService.selectedMenu == SharedTabService.menu.myTest) {

													//	$scope.selectedTestIndex = 0;
													//	if ($scope.currentTab.folderGuid == null) {
													//		$scope.selectedFolder = $scope.defaultFolders;
													//	} else {
													//		$scope.selectedFolder = angular
													//				.element(
													//						$(
													//								'#'
													//										+ $scope.currentTab.testId)
													//								.closest(
													//										'ol'))
													//				.scope().node.nodes;
													//	}
													//	for (var i = 0; i < $scope.selectedFolder.length; i++) {
													//		if ($scope.selectedFolder[i].guid === $scope.currentTab.testId) {
													//			$scope.selectedTestIndex = i + 1;
													//			break;
													//		}
													//	}

													//}

													$scope.maping = {};
													$scope.count = 0;

													$scope.versionedTests
															.forEach(function(
																	node) {
																var testID = node.guid;
																TestService
																		.getMetadata(
																				testID,
																				function(
																						result) {
																					$scope.maping[node.guid] = result;
																					$scope.count = $scope.count + 1;

																					if ($scope.count == $scope.versionedTests.length)
																						$scope
																								.bindTabs();
																				});
															})

													$scope.bindTabs = function() {
														$scope.versionedTests
																.forEach(function(
																		node) {
																	var result = $scope.maping[node.guid];
																	// update
																	// MyTest
																	// tree
																	node.testId = $scope.currentTab.testId;
																	node.folderGuid = $scope.currentTab.folderGuid;
																	node.nodeType = "test";
																	node.title = result.title;
																	node.tabTitle = result.title;
																	node.modified = $scope.currentTab.modified;

																	if (SharedTabService.selectedMenu == SharedTabService.menu.myTest) {
																	    $rootScope.$broadcast('handleBroadcast_CreateVersion', SharedTabService.tests[SharedTabService.currentTabIndex], node);

																		//if ($scope.currentTab.folderGuid == null) {
																		//	$scope.selectedFolder
																		//			.splice(
																		//					$scope.selectedTestIndex
																		//							+ parseInt(result.version),
																		//					0,
																		//					node);
																			 
																		//} else {
																		//	$scope.selectedFolder
																		//			.splice(
																		//					$scope.selectedTestIndex
																		//							+ parseInt(result.version),
																		//					0,
																		//					node);
																		//}
																	}
																	// create
																	// tabs
																	if ($scope.isViewVersions) {
																		var newTestTab = new SharedTabService.Test(
																				SharedTabService.tests[SharedTabService.currentTabIndex]);
																		newTestTab.questions = [];
																		newTestTab.id = node.guid;
																		newTestTab.testId = node.guid;
																		newTestTab.title = result.title;
																		newTestTab.tabTitle = result.title;
																		newTestTab.folderGuid = result.folderId;
																		SharedTabService
																				.prepForBroadcastTest(newTestTab);
																	}
																});
													}
												});
								return true;
							}

							$scope.TestVersion_open = function() {

								$modal
										.open({
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

								$modal
										.open({
											templateUrl : 'views/partials/exportPopup.html',
											controller : 'ExportTestController',
											size : 'md',
											backdrop : 'static',
											keyboard : false,
											resolve : {
												testId : function() {
                                                    return SharedTabService.tests[SharedTabService.currentTabIndex].testId;
												}
											}
										});
							};

							// save confirmation on close button clicked..
							$scope.Confirmation_Open = function() {
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
												SharedTabService
														.addErrorMessage(
																criteria.treeNode.title,
																SharedTabService.errorMessageEnum.NoQuestionTypeSelected);
												isError = true;
												arr = criteria.metadata
														.sort(randomize);
											}
											if (criteria.numberOfQuestionsEntered > 0) {
												criteria.numberOfQuestionsSelected = criteria.numberOfQuestionsEntered;
											}
											if (criteria.numberOfQuestionsSelected > criteria.totalQuestions) {
												criteria.isError = true;
												SharedTabService
														.addErrorMessage(
																criteria.treeNode.title,
																SharedTabService.errorMessageEnum.NotEnoughQuestionsAvailable);
												isError = true;
												return false;
											} else {
												metadatas = metadatas
														.concat(arr
																.slice(
																		0,
																		criteria.numberOfQuestionsSelected));

											}
										});
								if (isError) {
									SharedTabService
											.TestWizardErrorPopup_Open(SharedTabService.errorMessages);
									return false;
								} else {
									var test = SharedTabService.tests[SharedTabService.currentTabIndex];
									if (test.title == null
											|| test.title.length <= 0) {
										$scope.IsConfirmation = false;
										$scope.message = "Please Enter Test Title to save the test.";

										$modal.open(confirmObject);
										return false;
									}
									test.criterias
											.forEach(function(criteria) {
												criteria.treeNode.showTestWizardIcon = true;
												$rootScope
														.$broadcast(
																"handleBroadcast_deselectedNode",
																criteria.treeNode);
											})
								}

								// console.log(metadatas);
								$scope.tests[$scope.sharedTabService.currentTabIndex].isTestWizard = false;
								$scope.sharedTabService.isTestWizardTabPresent = false;
								$scope.tests[$scope.sharedTabService.currentTabIndex].tabTitle = "Untitled test";
								$scope.tests[$scope.sharedTabService.currentTabIndex].questions = metadatas;
								QTI.initialize();
								// $scope.BlockRightPanel =
								// blockUI.instances.get('BlockRightPanel');
								// $scope.BlockRightPanel.start();
								$scope.saveTest();
								$scope.tests[$scope.sharedTabService.currentTabIndex].questions = [];
								$scope.render(metadatas);
								$scope.isApplySameCriteriaToAll = false;
							}
							function randomize(a, b) {
								return Math.random() - 0.5;
							}
							// TODO: code optimization is need.
							$scope.render = function(metadatas) {
								if (metadatas.length == 0) {
									// $scope.BlockRightPanel.stop();
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
													var displayNode = $("<div></div>");													
													displayNode.guid = question.guid;
													
													displayNode.IsEditView = false;
													displayNode.qstnLinkText = displayNode.IsEditView ? "View"
															: "Edit";
													displayNode.data = 	response;
													displayNode.quizType = 	question.quizType;
													
													displayNode.questionMetadata = userSettings.questionMetadata;
													displayNode.extendedMetadata = question.extendedMetadata;
													$.each(displayNode.extendedMetadata, function(index, item){																							
														if(typeof(displayNode['questionMetadata'][item['name']])!='undefined'){
															displayNode['questionMetadata'][item['name']]=item['value'];	
														}
													});	
													
													displayNode.selectedLevel = displayNode.questionMetadata['Difficulty']==undefined?{name:'Select Level',value:'0'}:{name:displayNode.questionMetadata['Difficulty'],value:displayNode.questionMetadata['Difficulty']};
													
													displayNode.qstnMasterData = buildQstnMasterDetails(displayNode);
													displayNode.optionsView = displayNode.qstnMasterData.optionsView;
													displayNode.EssayPageSize = displayNode.qstnMasterData.EssayPageSize;
																							
													QTI.play(response,
															displayNode, false,false,question.quizType);

													// $scope.tree2.push(displayNode);
													$scope.isLoading = false;
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
														// $scope.BlockRightPanel.stop();
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
							$rootScope.$on('handleBroadcast_AddNewTab', function () {
							    $scope.addNewTest($scope);
							});
							$rootScope.$on('handleBroadcast_AddTestWizard', function () {
							    SharedTabService.addTestWizard($scope);
							});
							$rootScope.$on('handleBroadcast_createTestWizardCriteria',
											function (event, response,
													currentNode) {
											    $scope.addTestWizardCriteria(
														response, currentNode);
											    // TODO : need to revisit and
											    // change JQuery implementation
											    $('.test-wizard-container')
														.height(
																($(document)
																		.height()
																		- $(
																				'.test-wizard-container')
																				.offset().top - 15)
																		+ 'px');
											});
							$rootScope.$on('handleBroadcast_AddQuestionsToTest', function (event, response, currentNode) {
							    QTI.initialize();
							    $scope.renderQuestions(response,
                                        $scope.currentIndex);
							})
						    // #endregion Broadcast handles

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
angular.module('e8MyTests').directive('ngReallyClick', [ function() {
	return {
		restrict : 'A',
		link : function(scope, element, attrs) {
			element.bind('click', function() {
				var message = attrs.ngReallyMessage;
				if (message && confirm(message)) {
					scope.$apply(attrs.ngReallyClick);
				}
			});
		}
	}
} ]);
