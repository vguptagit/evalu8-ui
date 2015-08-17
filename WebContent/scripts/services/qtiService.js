'use strict';

angular.module('evalu8Demo')

.service(
		'QtiService',
		function() {

			this.getQtiModel = function(qtiXML, quizType) {
				var qtiModel = getQtiJsonModal(qtiXML, quizType);
				return qtiModel;
			}

			var getQtiJsonModal = function(qtiXML, quizType) {
				var xml = jQuery.parseXML(qtiXML);			

				var qtiModel = {};			

				qtiModel.QstnSectionTitle =  QuestionPrefilledModal[quizType].qstnSectionTitle;
				qtiModel.Caption=  getQuestionCaption(xml);
				qtiModel.PrintCaption = QuestionPrefilledModal[quizType].printCaption;
				qtiModel.EditCaption = QuestionPrefilledModal[quizType].editCaption;


				switch (quizType) {
				case 'MultipleChoice':
				case 'MultipleResponse':
				case 'TrueFalse':					
					qtiModel.Options = getQuestionOptions(xml, quizType);
					qtiModel.PrintOption = QuestionPrefilledModal[quizType].printOption;
					qtiModel.EditOption = QuestionPrefilledModal[quizType].editOption;
					qtiModel.CorrectAnswer = getQuestionCorrectAnswers(xml, quizType);
					qtiModel.Orientation = getQuestionOrientation(xml)=="horizontal"?false:true;			

					break;

				case 'Essay':	
					qtiModel.Caption = getEssayCaption(xml);										
					qtiModel.PrintRecommendedAnswer = QuestionPrefilledModal[quizType].printRecommendedAnswer;
					qtiModel.EditRecommendedAnswer = QuestionPrefilledModal[quizType].editRecommendedAnswer;
					qtiModel.RecommendedAnswer = getEssayRecommendedAnswer(xml);		
					qtiModel.EssayPageSize = getEssayPageSize(xml);

					break;

				case 'Matching':	

					qtiModel.Options = getQuestionOptions(xml, quizType);
					qtiModel.PrintOption = QuestionPrefilledModal[quizType].printOption;
					qtiModel.editOption_Column_A1 = QuestionPrefilledModal[quizType].editOption_Column_A1;
					qtiModel.editOption_Column_A2 = QuestionPrefilledModal[quizType].editOption_Column_A2;						
					qtiModel.editOption_Column_B = QuestionPrefilledModal[quizType].editOption_Column_B;					

					break;

				case 'FillInBlanks':		
					qtiModel.Caption = getFBQuestionCaption(xml);						
					qtiModel.FbCaption = getFbCaptionHTML(qtiModel.Caption);
					qtiModel.PrintOption = QuestionPrefilledModal[quizType].printOption;									
					qtiModel.CorrectAnswer = getFBCorrectAnswers(xml);		


					break;
				}			
				return qtiModel;		

			}

			var getQuestionCaption = function(xml) {
				return getSerializedXML($(xml).find('itemBody').find('p').eq(0));
			}

			var getEssayPageSize = function(xml) {
				var nodeEssayPageSize = '0';
				if($(xml).find('itemBody').find("extendedTextInteraction").length > 0)
					nodeEssayPageSize = $(xml).find('itemBody').find("extendedTextInteraction").eq(0).attr("expectedLines");

				return nodeEssayPageSize;
			}

			var getEssayCaption = function(xml) {			
				return getSerializedXML($(xml).find('itemBody').find('blockquote').find('p').eq(0));
			}

			var getEssayRecommendedAnswer = function(xml) {	
				var recommendedAnswer;
				recommendedAnswer =  getSerializedXML($(xml).find('responseDeclaration').find('correctResponse value'));
				return recommendedAnswer;
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
					$(obj).replaceWith($('<u contenteditable="false" src="'	+ srcUri + '">' + imageAarray[0]	+ '</u>'));
				});

				return element[0].innerHTML;
			}

			// to render Caption of Fill in the blank which contains html content
			var getFbCaptionHTML = function(Caption) {
				var FbCaption = "";

				var textEntryInteraction = '<button data-ng-if="(caption.type==2)" id="$index" onkeydown="return getSpanId(this,event)" class="blankFIBButton">'+
				'<span contenteditable="false" class="blankWidth editView"><b contenteditable="false">$charIndex.</b>Fill Blank</span></button> &nbsp;';

				var textEntryInteractionIndex=0;

				$.each(Caption,function(index,captionElement) {
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


				return FbCaption;
			}

			var getFBQuestionCaption = function(xml) {
				var caption=[];	
				var txtContent;
				var item;

				$($(xml).find('itemBody').find('blockquote').find('p').eq(0)[0].childNodes).each(function(node) {

					txtContent='';
					item='';
					if($(this)[0].nodeType==4){					
						item ={type:1,content:$(this)[0].textContent};
						caption.push(item);
					}else if($(this)[0].nodeName == 'textEntryInteraction'){
						item ={type:2,content:txtContent};
						caption.push(item);
					}
				});					


				return caption;
			}

			var getFBCorrectAnswers = function(qtiXML) {
				var correctAnswerList = [];			
				$(qtiXML).find('responseDeclaration').each(function(i, e) {
					correctAnswerList.push($(this)[0].children[0].children[0].attributes['mapKey'].nodeValue);
				});				
				return correctAnswerList;
			}

			var getQuestionOptions = function(xml, quizType) {
				var optionList = [];
				switch (quizType) {
				case 'MultipleChoice':
				case 'MultipleResponse':
				case 'TrueFalse':
					optionList = getSimpleChoices(xml);
					break;
				case 'Essay':
					break;
				case 'FillInBlanks':
					break;
				case 'Matching':
					optionList = getMacthingOptions(xml);
					break;
				}
				return optionList;
			}

			var getInlineChoice = function(qtiXML){
				var rightColumnOptions=[];
				$(qtiXML).find('itemBody').find('blockquote').eq(0).
				find("inlineChoiceInteraction inlineChoice").each(function(i, e) {
					rightColumnOptions.push(getSerializedXML($(this)));
				});
				return rightColumnOptions;
			}

			var getInlineChoiceInteraction = function(qtiXML){
				var leftColumnOptions=[];			
				$(qtiXML).find('itemBody').find('blockquote').each(function(i, e) {
					$(this).find("p").find('inlineChoiceInteraction').remove();
					leftColumnOptions.push(getSerializedXML($(this).find("p").eq(0)));
				});				
				return leftColumnOptions;
			}

			var getMacthingOptions = function(qtiXML){				
				var rightColumnOptions=getInlineChoice(qtiXML);		
				var leftColumnOptions=getInlineChoiceInteraction(qtiXML);
				var optionList = [];
				for (var i in leftColumnOptions) {
					for (var j in rightColumnOptions) {
						if (i == j) {
							var matchingOptions={option:leftColumnOptions[i].trim(),matchingOption:rightColumnOptions[j].trim()};
							optionList.push(matchingOptions);
							break;
						}
					}
				}
				return optionList;
			}

			var getQuestionOrientation = function(qtiXML) {
				var optionsView = '';
				if($(qtiXML).find('itemBody').find('choiceInteraction').attr('orientation')){
					optionsView =$(qtiXML).find('itemBody').find('choiceInteraction').attr('orientation');
				}				
				return optionsView.toLowerCase();
			}

			var getQuestionCorrectAnswers = function(qtiXML, quizType) {
				var correctAnswerList = [];
				switch (quizType) {
				case 'MultipleChoice':
				case 'TrueFalse':
					correctAnswerList = getMultipleChoiceCorrectAnswer(qtiXML);
					break;
				case 'MultipleResponse':
					correctAnswerList = getMultipleResponseCorrectAnswer(qtiXML);
					break;
				case 'Essay':
					break;
				case 'FillInBlanks':
					break;
				case 'Matching':
					break;
				}
				return correctAnswerList;
			}

			var getSimpleChoices = function(qtiXML) {
				var optionList = [];
				$(qtiXML).find('itemBody').find('choiceInteraction').find(
				"simpleChoice").each(function(i, e) {
					optionList.push(getSerializedXML($(this)));
				});
				return optionList;
			}

			var getMultipleChoiceCorrectAnswer = function(qtiXML) {
				var correctAnswerIndex ;
				$(qtiXML).find('setOutcomeValue[identifier="SCORE"] baseValue')
				.each(function(i, e) {
					if ($(this).text() == "1") {
						correctAnswerIndex=i;
					}
				});
				return correctAnswerIndex;
			}

			var getMultipleResponseCorrectAnswer = function(qtiXML) {
				var correctAnswerList = [];
				$(qtiXML).find('responseDeclaration mapEntry').each(
						function(i, e) {
							if ($(this).attr("mappedValue") == "1") {
								correctAnswerList.push(true);
							}else{
								correctAnswerList.push(false);
							}
						});
				return correctAnswerList;
			}

			var getSerializedXML = function(qtiNode) {
				var serializedQtiNode = '';
				var serializedText = '';
				var xmlChildren = qtiNode.eq(0).get(0).childNodes;
				for (var i = 0; i < xmlChildren.length; i++) {

					if (xmlChildren[i].nodeType == 4) {
						serializedQtiNode = xmlChildren[i].textContent;
					} else {
						serializedQtiNode = (new XMLSerializer())
						.serializeToString(xmlChildren[i]);
					}
					serializedText = serializedText + serializedQtiNode;
				}
				return serializedText;
			}

			var QuestionPrefilledModal = {

					"MultipleChoice" : {
						"qstnSectionTitle":"Enter Text & Select Correct Answer",
						"printCaption" : "Multiple Choice Question",
						"editCaption" : "Enter Multiple Choice Question",
						"printOption" : "Answer Choice",
						"editOption" : "Enter Answer",
						"DISPLAY" : false
					},

					"TrueFalse" : {
						"qstnSectionTitle":"Enter Text & Select Correct Answer",
						"printCaption" : "True/False Question",
						"editCaption" : "Enter True or False Question",
						"printOption" : "True",
						"editOption" : "True",
						"DISPLAY" : false
					},

					"MultipleResponse" : {
						"qstnSectionTitle":"Enter Text & Select Correct Answer",
						"printCaption" : "Multiple Response Question",
						"editCaption" : "Enter Multiple Response Question",
						"printOption" : "Answer Choice",
						"editOption" : "Enter Answer",
						"DISPLAY" : false
					},

					"Matching" : {
						"qstnSectionTitle":"Enter Column A items and Correct Column B Match.\nSystem will scramble Column B when you print or export the test.",
						"printCaption" : "Matching Question",
						"editCaption" : "Enter Matching Question",
						"printOption" : "Option",
						"editOption_Column_A1" : "Enter item ",
						"editOption_Column_A2" : " in column ",
						"editOption_Column_B" : "Enter match in column B for A ",
						"DISPLAY" : false
					},

					"Essay" : {
						"qstnSectionTitle":"Enter Essay Question",
						"printCaption" : "Essay Question",
						"editCaption" : "Enter Essay Question",
						"printRecommendedAnswer" : "Recommended Answer",
						"editRecommendedAnswer" : "Enter Essay Recommended Answer",							
						"DISPLAY" : true
					},

					"FillInBlanks" : {
						"qstnSectionTitle":"Enter Question Text, Choose Add Blank",
						"printCaption" : "Fill in the Blanks Question <br> _________________________",
						"editCaption" : "Enter Question Text",
						"printOption" : "Answer Choice",
						"editOption" : "Enter Answer for Blank A",							
						"DISPLAY" : false
					}

			}

			var questionIndex = [ "A) ", "B) ", "C) ", "D) ", "E) ","F) ","G) ","H) ","I) ", "J) ","K) ","L) ","M) ","N) ", "O) ","P) ","Q) ","R) "];
		
			this.getQuestionIndex = function(index) {			
				return questionIndex[index];
			}
			this.getQuestionPlainIndex = function(index) {			
				return questionPlainIndex[index];
			}

			this.replaceImage = function(content) {
				return replaceImageFromJsonContent(content);
			}
			
			var replaceImageFromJsonContent = function(content) {
				var htmlText = content.replace(
						/&nbsp;/, " ");
				var element = $('<p></p>');
				$(element).append(htmlText);

				var anchorTags = element.find("u[contenteditable]");				
				anchorTags.each(function() {
					var url = $(this).attr("url");
					htmlText = htmlText.replace($(this).get(0).outerHTML,
							'<img class="qtiQuestionImage" src="'
							+ url + '"></img>')
				})
				return htmlText;
			}

			var buildQuestionOptionTag = function(xml,node) {
				var optionVew = node.optionsView == true ? 'Vertical': 'Horizontal';
				$(xml).find('itemBody').find('choiceInteraction').attr('orientation', optionVew);

				$(xml).find('itemBody').find('choiceInteraction').find("simpleChoice").remove();				
				var optionText = '';
				var optionTag = '<simpleChoice identifier="@RESPONSE" fixed="false">@val</simpleChoice>';

				$.each(node.qtiModel.Options,function(index,Option) {
					optionText = replaceImageFromJsonContent(Option);					
					node.qtiModel.Options[index] = optionText;
					if(optionText.startsWith('<p>')){
						optionText = optionText.substring(3, optionText.length-4);
					}		
					optionText = optionText==""?QuestionPrefilledModal[node.quizType].printOption:optionText;
					var optionTagAppend = optionTag.replace('@RESPONSE', 'RESPONSE_' + (index + 1));
					optionTagAppend = optionTagAppend.replace('@val', "<![CDATA[" + optionText + "]]>");
					var item = $.parseXML(optionTagAppend); 
					$(xml).find('itemBody').find('choiceInteraction').append($(item).children(0));

				});		


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
					node) {
				var $mapEntry = '<mapEntry mapKey=\"RESPONSE_1\" mappedValue=\"0\" />';
				$(xml).find("responseDeclaration mapping")
				.children().slice(3).remove();
				for (var i = 3; i < node.qtiModel.Options.length; i++) {

					var item = $.parseXML($mapEntry.replace(
							"RESPONSE_1","RESPONSE_"+ (i + 1)));

					$(xml).find("responseDeclaration mapping")
					.append(item.childNodes[0]);
				}

				$(xml).find('responseDeclaration mapEntry')	.attr("mappedValue", "0");


				for (var index = 0; index < node.qtiModel.CorrectAnswer.length; index++) {
					if (node.qtiModel.CorrectAnswer[index]) {
						$(xml).find(
						'responseDeclaration mapEntry')
						.eq(index).attr("mappedValue",
						"1");
					}
				}

			}

			var setIdentifierScore = function(xml,node) {
				$(xml).find('setOutcomeValue[identifier="SCORE"] baseValue').text("0");
				$(xml).find('setOutcomeValue[identifier="SCORE"] baseValue').eq(node.qtiModel.CorrectAnswer).text("1");
			}


			this.getQtiXML = function(node) {

				var xml = jQuery.parseXML(node.data);	
				var quizType = node.quizType;				
				node.qtiModel.Caption = replaceImageFromJsonContent(node.qtiModel.Caption);
				var qstnCaption = node.qtiModel.Caption;
				
				if (typeof String.prototype.startsWith != 'function') {
					  // see below for better implementation!
					  String.prototype.startsWith = function (str){
					    return this.indexOf(str) === 0;
					  };
					}
				
				if(qstnCaption.startsWith('<p>')){
					qstnCaption = qstnCaption.substring(3, qstnCaption.length-4);
				}				
				qstnCaption = qstnCaption==""?QuestionPrefilledModal[quizType].printCaption:qstnCaption;
			
				QTI.appendNodes($(xml).find('itemBody').find('p').eq(0),"<![CDATA[" + qstnCaption + "]]>");

				$(xml).find('assessmentItem').attr('identifier', 'QUESTION-X');

				switch (quizType) {				

				case 'MultipleChoice':

					buildQuestionOptionTag(xml,node);

					appendResponseProcessingTag(xml,node.qtiModel.Options.length);

					setIdentifierScore(xml, node);

					break;

				case 'MultipleResponse':

					buildQuestionOptionTag(xml,node);

					appendResponseProcessingTag(xml,node.qtiModel.Options.length);

					updateMapEntryTag(xml, node);

					break;

				case 'TrueFalse':	

					setIdentifierScore(xml, node);
					break;

				case 'Essay':						

					$(xml).find('itemBody').find("extendedTextInteraction").eq(0).attr("expectedLines",node.qtiModel.EssayPageSize);
					$(xml).find('responseDeclaration').find('correctResponse').find('value').html("<![CDATA[" + node.qtiModel.RecommendedAnswer + "]]>");
					break;

				case 'Matching':			

					var responseDeclaration = $(xml).find('responseDeclaration');					
					var responseTag = ' <responseDeclaration identifier="@RESPONSE" cardinality="single" baseType="identifier">'
						+'<mapping defaultValue="0"><mapEntry mapKey="@RESP" mappedValue="1"/></mapping></responseDeclaration>';	

					for (var i = responseDeclaration.length; i < node.qtiModel.Options.length; i++) {		
						responseTag = responseTag.replace('@RESPONSE', 'RESPONSE_'+(i+1));						
						responseTag = responseTag.replace('@RESP', 'RESP_'+(i+1));						
						var item = $.parseXML(responseTag); 					
						$(xml).find( "responseDeclaration:last" ).after($(item).children(0));						
					}

					$(xml).find('itemBody').find('blockquote').remove();
					var optionText = '';
					var optionTag = '<blockquote><p>@p<inlineChoiceInteraction xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1" responseIdentifier="@RESPONSE" shuffle="true">'
						+'</inlineChoiceInteraction></p></blockquote>';	

					var inlineChoiceTags = '<inlineChoiceInteraction responseIdentifier="@RESPONSE" shuffle="true"></inlineChoiceInteraction>';						
					var inlineChoiceTag = '<inlineChoice identifier="@RESP">@RESP_Val</inlineChoice>';   

					var xmlDoc = $.parseXML( inlineChoiceTags )
					inlineChoiceTags = $( xmlDoc )

					for (var i = 0; i < node.qtiModel.Options.length; i++) {
						optionText = replaceImageFromJsonContent(node.qtiModel.Options[i].matchingOption);		
						node.qtiModel.Options[i].matchingOption = optionText;
						if(optionText.startsWith('<p>')){
							optionText = optionText.substring(3, optionText.length-4);
						}		
						optionText = optionText==""?QuestionPrefilledModal[node.quizType].printOption:optionText;

						var optionTagAppend = inlineChoiceTag.replace('@RESP', 'RESP_' + (i + 1));						
						optionTagAppend = optionTagAppend.replace('@RESP_Val', "<![CDATA[" + optionText + "]]>");

						var item = $.parseXML(optionTagAppend); 

						inlineChoiceTags.find( "inlineChoiceInteraction" ).append($(item).children(0));

					}

					for (var i = 0; i < node.qtiModel.Options.length; i++) {									
						optionText = replaceImageFromJsonContent(node.qtiModel.Options[i].option);		
						node.qtiModel.Options[i].option = optionText;
						if(optionText.startsWith('<p>')){
							optionText = optionText.substring(3, optionText.length-4);
						}		
						optionText = optionText==""?QuestionPrefilledModal[node.quizType].printOption:optionText;
						var optionTagAppend = (optionTag).replace('@RESPONSE', 'RESPONSE_' + (i + 1));
						optionTagAppend = optionTagAppend.replace('@p', "<![CDATA[" + optionText + "]]>");										

						var item = $.parseXML(optionTagAppend); 

						QTI.appendHTMLNodes($(item).find("inlineChoiceInteraction"),QTI.getSerializedXML(inlineChoiceTags.find("inlineChoiceInteraction")));	

						$(xml).find('itemBody').append($(item).children(0));
					}


					break;
				case 'FillInBlanks':		

					break;
				}

				var serializer = new XMLSerializer();
				var editedXML = serializer.serializeToString(xml);			
				return editedXML;
			}


		});