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
					qtiModel.printMatchingOption = QuestionPrefilledModal[quizType].printMatchingOption;					
					qtiModel.editOption_Column_A1 = QuestionPrefilledModal[quizType].editOption_Column_A1;
					qtiModel.editOption_Column_A2 = QuestionPrefilledModal[quizType].editOption_Column_A2;						
					qtiModel.editOption_Column_B = QuestionPrefilledModal[quizType].editOption_Column_B;					

					break;
					
				case 'ShortAnswer':
					qtiModel.FbCaption = getFBQuestionCaption(xml);		
					qtiModel.Caption = getEssayCaption(xml);							
					qtiModel.Options = getSACorrectAnswersList(xml);	
					qtiModel.EditOption = QuestionPrefilledModal[quizType].editOption;
					qtiModel.PrintOption = QuestionPrefilledModal[quizType].printOption;	
					break;

				case 'FillInBlanks':
					qtiModel.FbCaption = getFBQuestionCaption(xml);		
					qtiModel.Caption = getFbCaptionHTML(qtiModel.FbCaption);						
					qtiModel.CorrectAnswerHtml = getFBCorrectAnswersHtml(xml);		
					qtiModel.PrintOption = QuestionPrefilledModal[quizType].printOption;									
					//qtiModel.CorrectAnswer = getFBCorrectAnswers(xml);	
					qtiModel.BlankSize = getFBQuestionBlankSize(xml);		

					break;
				}			
				return qtiModel;		

			}			
			
			
					
			var getFBQuestionBlankSize = function(xml) {
				var blankSize = $(xml).find('itemBody').find("textEntryInteraction").attr("expectedLength");				
				return typeof(blankSize)=='undefined'?"20":blankSize;
			}
		
			var getFBCorrectAnswers = function(qtiXML) {
				var correctAnswerList = [];			
				$(qtiXML).find('responseDeclaration').each(function(i, e) {
					correctAnswerList.push($(this)[0].children[0].children[0].attributes['mapKey'].nodeValue);
				});				
				return correctAnswerList;
			}
			
			var getFBQuestionCaption = function(xml) {
				var caption=[];	
				var txtContent;
				var item;

				if($(xml).find('itemBody').find('blockquote').find('p').eq(0)[0].childNodes.length>0){
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
				}else{
					item ={type:1,content:''};
					caption.push(item);
				}


				return caption;
			}

			var getFBCorrectAnswersHtml = function(qtiXML) {
				var correctAnswerList = [];		
				var correctAnswers = '';
			
				$(qtiXML).find('responseDeclaration').each(function(i, e) {
					if($(this)[0].childNodes.length>0){
						var correctAnswer = '<div class="editView editablediv crtAnsDiv" type="text" id="RESPONSE_' + (i+1) +'">'+ String.fromCharCode(65 + i )  +	
						'.<div contenteditable="true" class="placeHolderForBlank" data-placeholder="Enter the correct answer for blank "'+ String.fromCharCode(65 + i  ) +'>$answerModel</div></div>';
						correctAnswer = correctAnswer.replace("$answerModel",decodeSpecialCharText($(this)[0].childNodes[0].childNodes[0].attributes['mapKey'].nodeValue));
						correctAnswers =correctAnswers + correctAnswer;				
				
					}
				});				
				
				return correctAnswers;
			}
			
			var getSACorrectAnswersList = function(qtiXML) {
				var correctAnswerList = [];		
				var correctAnswers = '';
			
				$(qtiXML).find('responseDeclaration').each(function(i, e) {
					if($(this)[0].childNodes.length>0){	
						correctAnswerList.push(decodeSpecialCharText($(this)[0].childNodes[0].childNodes[0].attributes['mapKey'].nodeValue));
					}
				});				
				
				return correctAnswerList;
			}
			
			// to render Caption of Fill in the blank which contains html content
			var getFbCaptionHTML = function(Caption) {
				var FbCaption = "";
				var textEntryInteraction = '<button data-ng-if="(caption.type==2)" id="RESPONSE_$index" onkeydown="return getSpanId(this,event)" class="blankFIBButton">'+
				'<span contenteditable="false" class="blankWidth editView"><b contenteditable="false">$charIndex.</b>Fill Blank</span></button> &nbsp;';

				var textEntryInteractionIndex=0;

				$.each(Caption,function(index,captionElement) {
					if(captionElement.type==1){							
						FbCaption = FbCaption + captionElement.content;
					}else{						
						var textEntry = textEntryInteraction;
						textEntry = textEntry.replace("$index",textEntryInteractionIndex+1)
						textEntry=textEntry.replace("$charIndex",String.fromCharCode(65 + textEntryInteractionIndex));
						FbCaption = FbCaption + textEntry;
						textEntryInteractionIndex = textEntryInteractionIndex + 1;
					}

				});

				return FbCaption;
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
				var recommendedAnswer = "";
				 $(xml).find('responseDeclaration').each(function(i, e){
	                    recommendedAnswer = this.textContent;                
	              });
				var element = $('<div></div>');
				$(element).append(recommendedAnswer);			
				return $(element)[0].textContent;
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
                    $(obj).replaceWith($('<u contenteditable="false" src="'    + srcUri + '">' + imageAarray[0]    + '</u>'));
				});

				return element[0].innerHTML;
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
				case 'ShortAnswer':
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
				$(qtiXML).find('itemBody').find('blockquote').each(function(i, e){
					var leftOptionIdentifier=$(this).find("inlineChoiceInteraction").attr("responseIdentifier");
					$(qtiXML).find('responseDeclaration').each(function(i, e){
						var leftIdentifier=$(this).attr("identifier");
						if(leftOptionIdentifier==leftIdentifier){
							var rightOptionIdentifier= $(this).find("mapEntry").attr("mapKey")
							$(qtiXML).find('itemBody').find('blockquote').eq(0).
							find("inlineChoiceInteraction inlineChoice").each(function(i, e){
								var rightIdentifier=$(this).attr("identifier")
								if(rightOptionIdentifier==rightIdentifier){
									rightColumnOptions.push($(this).text());
								}
								
							});
						}
						
					});
					
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
				case 'ShortAnswer':
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
				var responseIndex = correctAnswerIndex+1;
				correctAnswerIndex= $(qtiXML).find('itemBody').find('choiceInteraction').find(
						"simpleChoice[identifier='RESPONSE_"+ responseIndex + "']").index();

				return correctAnswerIndex;
			}

			var getMultipleResponseCorrectAnswer = function(qtiXML) {
				var correctAnswerList = [];
				var responseAnswerList = [];
				$(qtiXML).find('responseDeclaration mapEntry').each(
						function(i, e) {							
							responseAnswerList.push(false);
							if(parseFloat($(this).attr("mappedValue")) > 0){
								correctAnswerList.push(true);
							}else{
								correctAnswerList.push(false);
							}
						});

				$.each(correctAnswerList, function( index, item ) {	
					if (item) {								
						var responseIndex= $(qtiXML).find('itemBody').find('choiceInteraction').find(
								"simpleChoice[identifier='RESPONSE_"+ (index+1) + "']").index();								
						responseAnswerList[responseIndex]=true;
					}
				});

				return responseAnswerList;
			}

			var getSerializedXML = function(qtiNode) {
				var serializedQtiNode = '';
				var serializedText = '';
				var xmlChildren = qtiNode.eq(0).get(0).childNodes;
				for (var i = 0; i < xmlChildren.length; i++) {

					if (xmlChildren[i].nodeType == 4) {
						//Purpose: Image getting resized on editing.
						//Putting the ctext content inside the span element and findout
						//the images.
						//Looping through the images and find out the css class.
						//If there is no css class apply css class and remove the height and width.
						var textContent = $("<span>"+xmlChildren[i].textContent+"</span>");
						var images = textContent.find("img");
						if(images.length > 0){
							for(var i = 0; i < images.length; i ++){
								if(textContent.find("img").eq(i).attr("class") == null || textContent.find("img").eq(i).attr("class") != "qtiQuestionImage")
								{
									textContent.find("img").eq(i).attr("class","qtiQuestionImage");
									textContent.find("img").eq(i).removeAttr("height");
									textContent.find("img").eq(i).removeAttr("width");
								}
							}
							serializedQtiNode = textContent.html();
						}
						else{	
							serializedQtiNode = xmlChildren[i].textContent;
						}
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
						"printMatchingOption" : "Match",
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
					
					"ShortAnswer" : {
						"qstnSectionTitle":"Short Answer Question",
						"printCaption" : "Short Answer Question",
						"editCaption" : "Enter Short Answer Question",
						"printOption" : "Short Recommended Answer",
						"editOption" : "Enter correct Answer",							
						"DISPLAY" : false
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
				var optionVew = node.qtiModel.Orientation == true ? 'Vertical': 'Horizontal';
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
			
			var buildEssayShortAnswerTag = function(xml,node) {
				
				$(xml).find('itemBody').find('textEntryInteraction').remove();				
				var optionText = '';
				var optionTag = '<textEntryInteraction expectedLength="150" responseIdentifier="@RESPONSE" />';		
			

				$.each(node.qtiModel.Options,function(index,Option) {
					optionText = replaceImageFromJsonContent(Option);					
					node.qtiModel.Options[index] = optionText;
					if(optionText.startsWith('<p>')){
						optionText = optionText.substring(3, optionText.length-4);
					}		
					optionText = optionText==""?QuestionPrefilledModal[node.quizType].printOption:optionText;
					var optionTagAppend = optionTag.replace('@RESPONSE', 'RESPONSE_' + (index + 1));
					var item = $.parseXML(optionTagAppend); 
					$(xml).find('itemBody').append($(item).children(0));

				});		


			}
			
			var buildResponseDeclarationTag = function(xml,node) {
				
				var responseDeclaration = $(xml).find('responseDeclaration');
				responseDeclaration.remove();
				
				var optionText = '';
			
				var optionTag = ' <responseDeclaration identifier="@RESPONSE" cardinality="single" baseType="string">'
					+'<mapping defaultValue="0"><mapEntry mapKey="@RESP" mappedValue="1" caseSensitive="false"/></mapping></responseDeclaration>';

				$.each(node.qtiModel.Options,function(index,Option) {
					optionText = replaceImageFromJsonContent(Option);					
					node.qtiModel.Options[index] = optionText;
					if(optionText.startsWith('<p>')){
						optionText = optionText.substring(3, optionText.length-4);
					}		
					optionText = optionText==""?QuestionPrefilledModal[node.quizType].printOption:optionText;
					var optionTagAppend = optionTag.replace('@RESPONSE', 'RESPONSE_' + (index + 1));
					optionTagAppend = optionTagAppend.replace('@RESP', encodeSpecialCharText(optionText));
					var item = $.parseXML(optionTagAppend); 
					
					if(index==0)
						$(xml).find( "assessmentItem" ).prepend($(item).children(0));
					else
						$(xml).find( "responseDeclaration").eq(index-1).after($(item).children(0));

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
			
			var replaceFIBblank = function(elm,text,xml,qstnHTML){
				var element = $('<p></p>');
				$(element).append(text);
				text = $(element).html();
				var buttons = elm.find("button");
				var textEntryBackUp;
				var actualContent;
				for(var i =0; i< buttons.length; i++)
				{
					if(actualContent == null)
						actualContent = "<![CDATA[" + text.substring(0,text.indexOf(buttons.get(i).outerHTML)) + "]]>"
						else{
							var index = text.indexOf(buttons.get(i-1).outerHTML) + buttons.get(i-1).outerHTML.length;
							actualContent = actualContent + "<![CDATA[" + text.substring(index,text.indexOf(buttons.get(i).outerHTML)) + "]]>"
						}
					textEntryBackUp = "<textEntryInteraction expectedLength='150' responseIdentifier='" + buttons.eq(i).attr("id") + "' />"
					actualContent = actualContent + textEntryBackUp;
				}
				var index = text.indexOf(buttons.get(buttons.length - 1).outerHTML) + buttons.get(buttons.length - 1).outerHTML.length;
				actualContent = actualContent + "<![CDATA[" + text.substring(index,text.length) + "]]>"

				return actualContent;
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
					QTI.appendNodes($(xml).find('responseDeclaration').find('correctResponse').find('value').eq(0),"<![CDATA[" + node.qtiModel.RecommendedAnswer + "]]>");
					break;
					
				case 'ShortAnswer':	
					
					buildEssayShortAnswerTag(xml,node);
					
					buildResponseDeclarationTag(xml,node);
					
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
						optionText = optionText==""?QuestionPrefilledModal[node.quizType].printMatchingOption:optionText;
						 
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
					
					if($(node.qtiModel.Caption).find("button").length > 0){
						qstnCaption = replaceFIBblank($(node.qtiModel.Caption),qstnCaption);					
						$(xml).find('itemBody').find('p').eq(0).empty();
						QTI.appendHTMLNodes($(xml).find('itemBody').find('p').eq(0),qstnCaption);
					}
					else{

						QTI.appendNodes($(xml).find('itemBody').find('p').eq(0),"<![CDATA[" +qstnCaption + "]]>");
					}

					var htmlTextEntry = $(node.qtiModel.CorrectAnswerHtml).children();

					var optionText = '';

					var TextArray= htmlTextEntry.find('.placeHolderForBlank');

					var responseDeclaration = $(xml).find('responseDeclaration');

					responseDeclaration.remove();

					var responseTagTemplate = ' <responseDeclaration identifier="@RESPONSE" cardinality="single" baseType="string">'
						+'<mapping defaultValue="0"><mapEntry mapKey="@RESP" mappedValue="1" caseSensitive="false"/></mapping></responseDeclaration>';

					for (var i = 0; i < htmlTextEntry.length; i++) {
						optionText = $(htmlTextEntry[i]).text();
						optionText = encodeSpecialCharText(optionText);
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

					if($(xml).find('itemBody').find("textEntryInteraction").length > 0)
						$(xml).find('itemBody').find("textEntryInteraction").attr("expectedLength",node.qtiModel.BlankSize)


						break;
				}
				

				var serializer = new XMLSerializer();
				var editedXML = serializer.serializeToString(xml);			
				return editedXML;
				
			}
			
			var encodeSpecialCharText= function(text){
				/*text = text.replace(/"/g,'&quot;');
				text = text.replace(/'/g,'&apos;');
				text = text.replace(/'/g,'&apos;');
				var chars = ["©","Û","®","ž","Ü","Ÿ","Ý","$","Þ","%","¡","ß","¢","à","£","á","À","¤","â","Á","¥","ã","Â","¦","ä","Ã","§","å","Ä","¨","æ","Å","©","ç","Æ","ª","è","Ç","«","é","È","¬","ê","É","­","ë","Ê","®","ì","Ë","¯","í","Ì","°","î","Í","±","ï","Î","²","ð","Ï","³","ñ","Ð","´","ò","Ñ","µ","ó","Õ","¶","ô","Ö","·","õ","Ø","¸","ö","Ù","¹","÷","Ú","º","ø","Û","»","ù","Ü","@","¼","ú","Ý","½","û","Þ","€","¾","ü","ß","¿","ý","à","‚","À","þ","á","ƒ","Á","ÿ","å","„","Â","æ","…","Ã","ç","†","Ä","è","‡","Å","é","ˆ","Æ","ê","‰","Ç","ë","Š","È","ì","‹","É","í","Œ","Ê","î","Ë","ï","Ž","Ì","ð","Í","ñ","Î","ò","‘","Ï","ó","’","Ð","ô","“","Ñ","õ","”","Ò","ö","•","Ó","ø","–","Ô","ù","—","Õ","ú","˜","Ö","û","™","×","ý","š","Ø","þ","›","Ù","ÿ","œ","Ú"]; 
				var codes = ["&copy;","&#219;","&reg;","&#158;","&#220;","&#159;","&#221;","&#36;","&#222;","&#37;","&#161;","&#223;","&#162;","&#224;","&#163;","&#225;","&Agrave;","&#164;","&#226;","&Aacute;","&#165;","&#227;","&Acirc;","&#166;","&#228;","&Atilde;","&#167;","&#229;","&Auml;","&#168;","&#230;","&Aring;","&#169;","&#231;","&AElig;","&#170;","&#232;","&Ccedil;","&#171;","&#233;","&Egrave;","&#172;","&#234;","&Eacute;","&#173;","&#235;","&Ecirc;","&#174;","&#236;","&Euml;","&#175;","&#237;","&Igrave;","&#176;","&#238;","&Iacute;","&#177;","&#239;","&Icirc;","&#178;","&#240;","&Iuml;","&#179;","&#241;","&ETH;","&#180;","&#242;","&Ntilde;","&#181;","&#243;","&Otilde;","&#182;","&#244;","&Ouml;","&#183;","&#245;","&Oslash;","&#184;","&#246;","&Ugrave;","&#185;","&#247;","&Uacute;","&#186;","&#248;","&Ucirc;","&#187;","&#249;","&Uuml;","&#64;","&#188;","&#250;","&Yacute;","&#189;","&#251;","&THORN;","&#128;","&#190;","&#252","&szlig;","&#191;","&#253;","&agrave;","&#130;","&#192;","&#254;","&aacute;","&#131;","&#193;","&#255;","&aring;","&#132;","&#194;","&aelig;","&#133;","&#195;","&ccedil;","&#134;","&#196;","&egrave;","&#135;","&#197;","&eacute;","&#136;","&#198;","&ecirc;","&#137;","&#199;","&euml;","&#138;","&#200;","&igrave;","&#139;","&#201;","&iacute;","&#140;","&#202;","&icirc;","&#203;","&iuml;","&#142;","&#204;","&eth;","&#205;","&ntilde;","&#206;","&ograve;","&#145;","&#207;","&oacute;","&#146;","&#208;","&ocirc;","&#147;","&#209;","&otilde;","&#148;","&#210;","&ouml;","&#149;","&#211;","&oslash;","&#150;","&#212;","&ugrave;","&#151;","&#213;","&uacute;","&#152;","&#214;","&ucirc;","&#153;","&#215;","&yacute;","&#154;","&#216;","&thorn;","&#155;","&#217;","&yuml;","&#156;","&#218;"];*/
				var chars = [/\"/g,/\'/g,/\-/g]; 
				var codes = ["&quot;","&apos;","&ndash;"];

				for(var x=0; x<chars.length; x++){				        	        	
					text = text.replace(chars[x],codes[x]);				        
				}
				return text;
			}
			
			var decodeSpecialCharText= function(text){
				 var el = document.createElement("div");
				  el.innerText = el.textContent = text;
				  text = el.innerHTML;
				  return text;
			}
			
			//decoding the encoded char to special char &quot; ==> '"'
			//eg: html editor encoding the double qoute to encoded char (&quot;)
			this.decodingEncodeChar = function(text){
				var chars = ['"']; 
				var codes = [/&quot;/g];

				for(var x=0; x<codes.length; x++){				        	        	
					text = text.replace(codes[x],chars[x]);				        
				}
				
				return text;
			}


		});