'use strict';

angular.module('evalu8Demo')
		
.service('CustomQuestionBanksService', 
					['$http', '$rootScope', '$location', '$cookieStore', 
					 function($http, $rootScope, $location, $cookieStore) {
						
			$rootScope.globals = $cookieStore.get('globals') || {};
			
			 if ($rootScope.globals.authToken == '') {
				 $location.path('/login');
			 } 
			 
			 var MultipleChoice_Template = '<?xml version="1.0" encoding="utf-8"?><assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd" title="Pre 1.1.2" identifier="QUESTION-1000001217597854" label="Pre 1.1.2" toolName="pegasus" toolVersion="5.152.49.2" adaptive="false" timeDependent="false"><responseDeclaration identifier="RESPONSE" cardinality="single" baseType="identifier"/><outcomeDeclaration identifier="FEEDBACK" cardinality="single" baseType="identifier"/><outcomeDeclaration identifier="ITEMSCORE" cardinality="single" baseType="float"/><outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float" normalMaximum="1.00"><defaultValue><value>0</value></defaultValue></outcomeDeclaration><outcomeDeclaration identifier="MAXSCORE" cardinality="single" baseType="float"><defaultValue><value>1.00</value></defaultValue></outcomeDeclaration><itemBody><p></p><choiceInteraction shuffle="true" responseIdentifier="RESPONSE" maxChoices="1" minChoices="1"><simpleChoice identifier="RESPONSE_1" fixed="false"></simpleChoice><simpleChoice identifier="RESPONSE_2" fixed="false"></simpleChoice><simpleChoice identifier="RESPONSE_3" fixed="false"></simpleChoice><simpleChoice identifier="RESPONSE_4" fixed="false"></simpleChoice></choiceInteraction></itemBody><responseProcessing><responseCondition><responseIf><match><variable identifier="RESPONSE"/><baseValue baseType="identifier">RESPONSE_1</baseValue></match><setOutcomeValue identifier="SCORE"><baseValue baseType="float">1</baseValue></setOutcomeValue><setOutcomeValue identifier="FEEDBACK"><baseValue baseType="identifier">FEEDBACK_1</baseValue></setOutcomeValue></responseIf><responseElseIf><match><variable identifier="RESPONSE"/><baseValue baseType="identifier">RESPONSE_2</baseValue></match><setOutcomeValue identifier="SCORE"><baseValue baseType="float">0</baseValue></setOutcomeValue><setOutcomeValue identifier="FEEDBACK"><baseValue baseType="identifier">FEEDBACK_2</baseValue></setOutcomeValue></responseElseIf><responseElseIf><match><variable identifier="RESPONSE"/><baseValue baseType="identifier">RESPONSE_3</baseValue></match><setOutcomeValue identifier="SCORE"><baseValue baseType="float">0</baseValue></setOutcomeValue><setOutcomeValue identifier="FEEDBACK"><baseValue baseType="identifier">FEEDBACK_3</baseValue></setOutcomeValue></responseElseIf><responseElseIf><match><variable identifier="RESPONSE"/><baseValue baseType="identifier">RESPONSE_4</baseValue></match><setOutcomeValue identifier="SCORE"><baseValue baseType="float">0</baseValue></setOutcomeValue><setOutcomeValue identifier="FEEDBACK"><baseValue baseType="identifier">FEEDBACK_4</baseValue></setOutcomeValue></responseElseIf></responseCondition></responseProcessing><modalFeedback identifier="FEEDBACK_1" outcomeIdentifier="FEEDBACK" showHide="show"><div>Psychology: The Scientific Methodology, p. 27</div></modalFeedback><modalFeedback identifier="FEEDBACK_2" outcomeIdentifier="FEEDBACK" showHide="show"><div>Psychology: The Scientific Methodology, p. 27</div></modalFeedback><modalFeedback identifier="FEEDBACK_3" outcomeIdentifier="FEEDBACK" showHide="show"><div>Psychology: The Scientific Methodology, p. 27</div></modalFeedback><modalFeedback identifier="FEEDBACK_4" outcomeIdentifier="FEEDBACK" showHide="show"><div>Psychology: The Scientific Methodology, p. 27</div></modalFeedback></assessmentItem>';
			 var TrueFalse_Template = '<?xml version="1.0" encoding="utf-8"?><assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd" title="True/False" identifier="QUESTION-1334052738" label="True/False" toolName="pegasus" toolVersion="5.152.49.2" adaptive="false" timeDependent="false"><responseDeclaration identifier="RESPONSE" cardinality="single" baseType="identifier" /><outcomeDeclaration identifier="FEEDBACK" cardinality="single" baseType="identifier" /><outcomeDeclaration identifier="ITEMSCORE" cardinality="single" baseType="float" /><outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float" normalMaximum="1"><defaultValue><value>0</value></defaultValue></outcomeDeclaration><outcomeDeclaration identifier="MAXSCORE" cardinality="single" baseType="float"><defaultValue><value>1</value></defaultValue></outcomeDeclaration><itemBody><p></p><choiceInteraction shuffle="false" responseIdentifier="RESPONSE" maxChoices="1" minChoices="1"><simpleChoice identifier="RESPONSE_1" fixed="false">True</simpleChoice><simpleChoice identifier="RESPONSE_2" fixed="false">False</simpleChoice></choiceInteraction></itemBody><responseProcessing><responseCondition><responseIf><match><variable identifier="RESPONSE" /><baseValue baseType="identifier">RESPONSE_1</baseValue></match><setOutcomeValue identifier="SCORE"><baseValue baseType="float">1</baseValue></setOutcomeValue><setOutcomeValue identifier="FEEDBACK"><baseValue baseType="identifier">FEEDBACK_1</baseValue></setOutcomeValue></responseIf><responseElseIf><match><variable identifier="RESPONSE" /><baseValue baseType="identifier">RESPONSE_2</baseValue></match><setOutcomeValue identifier="SCORE"><baseValue baseType="float">0</baseValue></setOutcomeValue><setOutcomeValue identifier="FEEDBACK"><baseValue baseType="identifier">FEEDBACK_2</baseValue></setOutcomeValue></responseElseIf></responseCondition></responseProcessing></assessmentItem>';
			
			this.questionTemplates = function(qtiFormat) {

					var qtiXmlNode = [];				
					var nodes = [
									{ "qstnTemplate": MultipleChoice_Template, "qstnType": "MultipleChoice" ,"quizType":"3"},
									{ "qstnTemplate": TrueFalse_Template , "qstnType": "TrueFalse"  ,"quizType":"4"}
								]
					
					QTI.initialize();
					
					angular.forEach(nodes, function(item) {
						var displayNode = $("<div></div>");
						QTI.Attribute.id = 1;		
						QTI.id=1;
						QTI.play(item.qstnTemplate, displayNode, true,true,item.quizType);	
						var node = {};
						node.qstnTemplate = true;
						node.optionsView = true;
						node.quizType=item.quizType;						
						node.data = MultipleChoice_Template;
						node.textHTML = displayNode.html();
						node.template = 'questions_renderer.html';
						qtiXmlNode.push(node);
					})

					return qtiXmlNode;

				};
				
				
				
				
						
						
						
			       
			
		}]);			