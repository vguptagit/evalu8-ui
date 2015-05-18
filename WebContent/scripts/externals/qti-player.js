var QTISettings = {};

QTISettings.enableShuffle = true;

QTISettings.index = "";

var QTI = {};

QTI.initialized = false;

QTI.play = function(qtiXML, displayNode,editable,templateQstn,questionType) {

	var state = {};
	state.practice = false;
	state.correct = undefined;
	state.templateQstn=templateQstn;
	state.editable=editable;
	state.questionType=QTI.getQuestionType(qtiXML,questionType);

	if (state.practice == undefined) {
		state.practice = true;
	}
	if (state.index != undefined) {
		QTISettings.index = state.index
	}

	if ((typeof qtiXML) == "string") {
		var decodeTag = function(text, tag) {
			text = text.replace(new RegExp("[&]lt[;]\\s*" + tag
					+ "\\s*(.*?)\\s*[&]gt[;]", "ig"), function(match, p1) {
				return "<" + tag + " " + p1 + ">"
			});
			text = text.replace(new RegExp("[&]lt[;]\\s*\\/\\s*" + tag
					+ "\\s*[&]gt[;]", "ig"), "</" + tag + ">");
			return text;
		}

		var decodeChar = function(text, encodedValue, decodedValue) {
			return text.replace(new RegExp(encodedValue, "ig"), decodedValue);
		}
		
		var decodeBRTag = function(text, tag) {
			text = text.replace(new RegExp("[&]lt[;]\\s*" + tag
					+ "\\s*(.*?)\\s*[&]gt[;]", "ig"), function(match, p1) {
				if(p1.lastIndexOf("/") == (p1.length - 1))
					return "<" + tag + p1 + ">"
				else
					return "<" + tag + p1 + "/>"
			});
			text = text.replace(new RegExp("[&]lt[;]\\s*\\/\\s*" + tag
					+ "\\s*[&]gt[;]", "ig"), "</" + tag + ">");
			return text;
		}
		
		var decodeImgTag = function(text, tag) {
			text = text.replace(new RegExp("[&]lt[;]\\s*" + tag
					+ "\\s*(.*?)\\s*[&]gt[;]", "ig"), function(match, p1) {
				var p2 = p1.replace(/&#39;/g, "'");
				if(p2.lastIndexOf("/") == (p2.length - 1))
					return "<" + tag + " " + p2.replace(/&amp;quot;/,"'") + ">"
				else
					return "<" + tag + " " + p2.replace(/&amp;quot;/,"'") + "/>"
			});
			text = text.replace(new RegExp("[&]lt[;]\\s*\\/\\s*" + tag
					+ "\\s*[&]gt[;]", "ig"), "</" + tag + ">");
			return text;
		}

		if (state && state.turnOffDecoder) {
		} else {
			qtiXML = decodeImgTag(qtiXML, "img");
			qtiXML = decodeTag(qtiXML, "i");
			qtiXML = decodeBRTag(qtiXML, "br")
			qtiXML = decodeTag(qtiXML, "b");
			qtiXML = decodeTag(qtiXML, "u");
			qtiXML = decodeTag(qtiXML, "font");
			qtiXML = decodeTag(qtiXML, "span");
			qtiXML = decodeTag(qtiXML, "em");
			qtiXML = decodeTag(qtiXML, "p");
			qtiXML = decodeTag(qtiXML, "sup");
			qtiXML = decodeTag(qtiXML, "sub");

			qtiXML = decodeChar(qtiXML, "[&]amp[;][#]8216[;]", "&#8216;");
			qtiXML = decodeChar(qtiXML, "[&]amp[;][#]8217[;]", "&#8217;");
			qtiXML = decodeChar(qtiXML, "[&]amp[;]nbsp[;]", "&nbsp;");
		}
	}

	var xml = QTI.format(qtiXML);
	QTI.correctResponse = {};
	QTI.customize(xml);
	QTI.process("play", xml, displayNode, state);
	QTI.onRenderComplete(xml, displayNode, state);
	QTI.reorderElements(state,displayNode);
}
QTI.status = function(displayNode) {
	return QTI.state(displayNode);
}

QTI.elementsMap = undefined;

QTI.process = function(functionName, qtiNode, displayNode, state) {
	if (QTI.elementsMap == undefined) {
		QTI.elementsMap = {};

		for ( var elementName in QTI.Elements) {
			var element = QTI.Elements[elementName];
			QTI.elementsMap[element.TAG.toLowerCase()] = element;
		}
	}

	var elementName = qtiNode.get(0).nodeName.toLowerCase();

	if (elementName in QTI.elementsMap) {
		var element = QTI.elementsMap[elementName];
		element[functionName](qtiNode, displayNode, state);
	}
}
QTI.process.play = function(qtiNode, displayNode, state) {
	return QTI.process("play", qtiNode, displayNode, state);
}

QTI.format = function(qtiXML) {
	return $($((typeof qtiXML) == "string" ? $.parseXML(qtiXML) : qtiXML)
			.get(0).documentElement);
}

QTI.prepare = function(qtiNode, displayNode, transferHTMLAttributes) {
	displayNode = $(displayNode);

	var elementName = qtiNode.get(0).nodeName.toLowerCase();
	var element = QTI.elementsMap[elementName];

	var attributes = {};

	displayNode.addClass("qti-" + element.TAG);

	displayNode.attr({
		"data-qti-id" : QTI.id++
	});
	displayNode.attr({
		"data-qti-tag" : element.TAG
	});
	$.each(qtiNode.prop("attributes"), function() {
		var attributeName = this.name.toLowerCase();

		displayNode.attr("data-qti-attribute-" + attributeName, this.value);
		attributes[attributeName] = this.value;
	});

	var tagCasing = qtiNode.get(0).nodeName;
	var attributesCasing = {};
	$.each(qtiNode.prop("attributes"), function() {
		var attributeName = this.name;

		attributesCasing[attributeName.toLowerCase()] = attributeName;
	});

	displayNode.data({
		"qti" : {
			"tag" : element.TAG,
			"name" : element.NAME,
			"attributes" : attributes,
			"attribute" : function(name) {
				return displayNode.data().qti.attributes[name.toLowerCase()];
			},
			"node" : qtiNode,
			"element" : element,

			"casing" : {
				"tag" : tagCasing,
				"attributes" : attributesCasing
			},

			"response" : undefined,
			"error" : undefined
		}
	});

	displayNode.css({
		"position" : "relative"
	});

	if (element.DISPLAY != undefined && element.DISPLAY == false) {
		displayNode.css({
			"display" : "none"
		});
	}

	if (transferHTMLAttributes) {
		if ($.isArray(transferHTMLAttributes)) {
			var transferHTMLAttributesIndex = {};
			$(transferHTMLAttributes)
					.each(
							function(index, attributeName) {
								transferHTMLAttributesIndex[attributeName
										.toLowerCase()] = true;
							});

			$.each(qtiNode.prop("attributes"), function() {
				var attributeName = this.name.toLowerCase();
				if (attributeName in transferHTMLAttributesIndex) {
					displayNode.attr(attributeName, this.value);
				}
			});
		} else {
			$.each(qtiNode.prop("attributes"), function() {
				var attributeName = this.name.toLowerCase();
				displayNode.attr(attributeName, this.value);
			});
		}
	}

	return displayNode;
}
QTI.id = 1;

QTI.setAttribute = function(displayNode, attributeName, value) {
	displayNode = $(displayNode);

	attributeName = attributeName.toLowerCase();

	if (value != undefined) {
		displayNode.data().qti.attributes[attributeName] = value;
		displayNode.attr("data-qti-attribute-" + attributeName, value);
	} else {
		displayNode.data().qti.attributes[attributeName] = undefined;
		delete displayNode.data().qti.attributes[attributeName];
		displayNode.removeAttr("data-qti-attribute-" + attributeName);
	}
}

QTI.state = function(displayNode) {
	var responses = {};
	var errors = {};

	displayNode
			.find("[data-qti-tag]")
			.each(
					function(index, qtiDisplayNode) {
						var qtiDisplayNode = $(qtiDisplayNode);

						var response = qtiDisplayNode.data().qti ? qtiDisplayNode
								.data().qti.response
								: undefined;
						if (response != undefined
								&& typeof response == "function") {
							response(responses);
						}

						var error = qtiDisplayNode.data().qti ? qtiDisplayNode
								.data().qti.error : undefined;
						;
						if (error != undefined && typeof error == "function") {
							error(errors);
						}
					});

	return {
		"responses" : responses,
		"errors" : errors
	};
}

QTI.initialize = function() {
	// extensions

	if (this.initialized == true) {
		return;
	} else {
		this.initialized = true;
	}

	for ( var i in QTI.Classes) {
		var cls = QTI.Classes[i];

		cls.loadDerived = (function(_cls) {
			return function() {
				QTI.Class.loadDerived.call(_cls, _cls.GET_DERIVED());
			};
		})(cls);

		cls.loadAllowedContent = (function(_cls) {
			return function() {
				QTI.Class.loadAllowedContent.call(_cls, _cls
						.GET_ALLOWED_CONTENT());
			};
		})(cls);

		if (cls.extend == undefined) {
			cls.extend = {};
		}
		if (cls.extend.play == undefined) {
			cls.extend.play = function(qtiNode, elementDisplayNode, state) {
			};
		}

		cls.extend._play = cls.extend.play;

		cls.extend.play = (function(_cls) {
			return function(qtiNode, elementDisplayNode, state) {
				if (_cls.EXTENDS && _cls.EXTENDS.length) {
					for (var i = 0; i < _cls.EXTENDS.length; i++) {
						var extended = _cls.EXTENDS[i];

						extended.extend
								.play(qtiNode, elementDisplayNode, state);
					}
				}

				_cls.extend._play(qtiNode, elementDisplayNode, state)
			}
		})(cls);
	}

	for ( var i in QTI.Elements) {
		var element = QTI.Elements[i];

		element.loadAllowedContent = (function(_element) {
			return function() {
				QTI.Element.loadAllowedContent.call(_element, _element
						.GET_ALLOWED_CONTENT());
			};
		})(element);

		element.processChildren = (function(_element) {
			return function(qtiNode, parentDisplayNode,state) {
				var allowedTags = {};
				var allowedContent = _element.getAllowedContent();
				for ( var i in allowedContent) {
					var allowedElement = allowedContent[i];
					allowedTags[allowedElement.TAG.toLowerCase()] = true;
				}

				qtiNode.contents().each(
						function(index, qtiNode) {
							if (qtiNode.nodeType == 3) {
								parentDisplayNode.append(qtiNode);
							} else {
								var nodeName = $(qtiNode).get(0).nodeName
										.toLowerCase();
								if (nodeName in allowedTags) {
									QTI.process.play($(qtiNode),
											parentDisplayNode,state);
								}
							}
						});
			};
		})(element);

		if (element.extend == undefined) {
			element.extend = {};
		}

		element.extend.play = (function(_element) {
			return function(qtiNode, elementDisplayNode, state) {
				if (_element.EXTENDS && _element.EXTENDS.length) {
					for (var i = 0; i < _element.EXTENDS.length; i++) {
						var extended = _element.EXTENDS[i];

						extended.extend
								.play(qtiNode, elementDisplayNode, state);
					}
				}
			}
		})(element);

		if (element.onRenderComplete == undefined) {
			element.onRenderComplete = function(qtiNode, displayNode, state) {
			};
		}
	}

	// relationships

	var classTagMap = {};
	for ( var i in QTI.Classes) {
		var cls = QTI.Classes[i];
		classTagMap[cls.TAG] = cls;

		cls.DERIVED = [];
		cls.EXTENDS = [];

		cls.ALLOWED_CONTENT = undefined;
	}

	var elementTagMap = {};
	for ( var i in QTI.Elements) {
		var element = QTI.Elements[i];
		elementTagMap[element.TAG] = element;

		element.DERIVED = [];
		element.EXTENDS = [];

		element.ALLOWED_CONTENT = undefined;
	}

	QTI.Class.loadDerived = function(classes) {
		var cls = this;

		for ( var i in classes) {
			var derivedClass = classes[i];
			derivedClass.EXTENDS.push(cls);
			cls.DERIVED.push(derivedClass);
		}
	}

	QTI.Class.loadAllowedContent = QTI.Element.loadAllowedContent = function(
			elements) {
		var element = this;

		var found = {};
		var collect = function(element, found) {
			var tag = element.TAG;
			if (!(tag in found)) {
				found[tag] = element;
				for ( var i in element.DERIVED) {
					collect(element.DERIVED[i], found);
				}
			}
		};

		for ( var i in elements) {
			collect(elements[i], found);
		}

		var allowedElements = [];
		for ( var tag in found) {
			if (tag in elementTagMap) {
				allowedElements.push(found[tag]);
			}
		}

		var allowedContentMap = {};

		for ( var i in allowedElements) {
			var allowedContentElement = allowedElements[i];

			allowedContentMap[allowedContentElement.TAG] = allowedContentElement;
		}

		if (element.EXTENDS && element.EXTENDS.length) {
			for ( var i in element.EXTENDS) {
				var extended = element.EXTENDS[i];
				var extendedAllowedContent = extended.getAllowedContent();

				for ( var e in extendedAllowedContent) {
					var extendedAllowedContentElement = extendedAllowedContent[e];

					if (!(extendedAllowedContentElement.TAG in allowedContentMap)) {
						allowedContentMap[extendedAllowedContentElement.TAG] = extendedAllowedContentElement;
						allowedElements.push(extendedAllowedContentElement);
					}
				}
			}
		}

		element.ALLOWED_CONTENT = allowedElements;
	}

	for ( var i in QTI.Classes) {
		var cls = QTI.Classes[i];
		if (cls.loadDerived) {
			cls.loadDerived();
		}
	}
	;

	for ( var i in QTI.Elements) {
		var element = QTI.Elements[i];
		if (element.CLASS) {
			if (!($.isArray(element.CLASS))) {
				element.EXTENDS.push(element.CLASS);
				element.CLASS.DERIVED.push(element);
			} else {
				for ( var c in element.CLASS) {
					element.EXTENDS.push(element.CLASS[c]);
					(element.CLASS[c]).DERIVED.push(element);
				}
			}
		}
	}
	;

	for ( var i in QTI.Classes) {
		var element = QTI.Classes[i];

		element.getAllowedContent = (function(_element) {
			return function() {
				if (_element.ALLOWED_CONTENT == undefined) {
					if (_element.loadAllowedContent) {
						_element.loadAllowedContent();
					} else {
						QTI.Class.loadAllowedContent.call(this, []);
					}
				}
				if (_element.ALLOWED_CONTENT == undefined) {
					_element.ALLOWED_CONTENT = [];
				}

				return _element.ALLOWED_CONTENT;
			}
		})(element);
	}

	for ( var i in QTI.Elements) {
		var element = QTI.Elements[i];

		element.getAllowedContent = (function(_element) {
			return function() {
				if (_element.ALLOWED_CONTENT == undefined) {
					if (_element.loadAllowedContent) {
						_element.loadAllowedContent();
					} else {
						QTI.Element.loadAllowedContent.call(this, []);
					}
				}
				if (_element.ALLOWED_CONTENT == undefined) {
					_element.ALLOWED_CONTENT = [];
				}

				return _element.ALLOWED_CONTENT;
			}
		})(element);
	}
}

QTI.onRenderComplete = function(qtiNode, displayNode, state) {
	displayNode.find('*').andSelf().filter("[data-qti-tag]").each(
			function(index, elementDisplayNode) {
				elementDisplayNode = $(elementDisplayNode);
				
				if( elementDisplayNode.data().qti==undefined){
					
					return;		
				}

				var element = elementDisplayNode.data().qti.element;
				var qtiNode = elementDisplayNode.data().qti.node;

				element.onRenderComplete(qtiNode, elementDisplayNode, state);
			});
}

// attribute

QTI.Attribute = {};

QTI.Attribute.toBoolean = function(string) {
	if (string === null || string === undefined) {
		return false;
	}

	string = $.trim(string);
	string = string.toLowerCase();

	switch (string) {
	case "true":
		return true;
	case "false":
		return false;
	case "t":
		return true;
	case "f":
		return false;
	case "1":
		return true;
	case "0":
		return false;
	case "null":
		return false;
	case "undefined":
		return false;
	default:
		return (string.length ? true : false);
	}
}

QTI.Attribute.generateId = function(prefix) {
	return prefix + QTI.Attribute.id++;
}
QTI.Attribute.id = 1;

QTI.BLOCKQUOTE = {};

QTI.BLOCKQUOTE.generateId = function() {
    return QTI.BLOCKQUOTE.id++;
}

QTI.BLOCKQUOTE.getId = function() {
    return QTI.BLOCKQUOTE.id;
}

QTI.BLOCKQUOTE.id = 0;

// class

QTI.Class = {};

// classes

QTI.Classes = {};

// atomic block

QTI.Classes.AtomicBlock = {}

QTI.Classes.AtomicBlock.NAME = "Atomic Block";
QTI.Classes.AtomicBlock.TAG = "atomicBlock";

QTI.Classes.AtomicBlock.GET_DERIVED = function() {
	return [];
}

QTI.Classes.AtomicBlock.GET_ALLOWED_CONTENT = function() {
	return [ QTI.Classes.Inline ];
}

// atomic inline

QTI.Classes.AtomicInline = {}

QTI.Classes.AtomicInline.NAME = "Atomic Inline";
QTI.Classes.AtomicInline.TAG = "atomicInline";

QTI.Classes.AtomicInline.GET_DERIVED = function() {
	return [];
}

QTI.Classes.AtomicInline.GET_ALLOWED_CONTENT = function() {
	return [];
}

// block

QTI.Classes.Block = {}

QTI.Classes.Block.NAME = "Block";
QTI.Classes.Block.TAG = "block";

QTI.Classes.Block.GET_DERIVED = function() {
	return [ QTI.Classes.BlockInteraction, QTI.Classes.BlockStatic ];
}

QTI.Classes.Block.GET_ALLOWED_CONTENT = function() {
	return [];
}

QTI.Classes.Block.extend = {};

QTI.Classes.Block.extend.play = function(qtiNode, elementDisplayNode, state) {
	elementDisplayNode = $(elementDisplayNode);

	if (elementDisplayNode.css("display") == undefined) {
		elementDisplayNode.css({
			"display" : "block"
		});
	}
}

// block interaction

QTI.Classes.BlockInteraction = {}

QTI.Classes.BlockInteraction.NAME = "Block Interaction";
QTI.Classes.BlockInteraction.TAG = "blockInteraction";

QTI.Classes.BlockInteraction.GET_DERIVED = function() {
	return [];
}

QTI.Classes.BlockInteraction.GET_ALLOWED_CONTENT = function() {
	return [ QTI.Elements.Prompt ];
}

// block static

QTI.Classes.BlockStatic = {}

QTI.Classes.BlockStatic.NAME = "Block Static";
QTI.Classes.BlockStatic.TAG = "blockStatic";

QTI.Classes.BlockStatic.GET_DERIVED = function() {
	return [ QTI.Classes.AtomicBlock, QTI.Classes.SimpleBlock ];
}

QTI.Classes.BlockStatic.GET_ALLOWED_CONTENT = function() {
	return [];
}

// body element

QTI.Classes.BodyElement = {}

QTI.Classes.BodyElement.NAME = "Body Element";
QTI.Classes.BodyElement.TAG = "bodyElement";

QTI.Classes.BodyElement.GET_DERIVED = function() {
	return [ QTI.Classes.AtomicBlock, QTI.Classes.AtomicInline,
			QTI.Classes.Choice, QTI.Classes.Interaction,
			QTI.Classes.SimpleBlock, QTI.Classes.SimpleInline ];
}

QTI.Classes.BodyElement.GET_ALLOWED_CONTENT = function() {
	return [];
}

QTI.Classes.BodyElement.TRANSFER_ID = true;
QTI.Classes.BodyElement.TRANSFER_CLASS = true;

QTI.Classes.BodyElement.extend = {};

QTI.Classes.BodyElement.extend.play = function(qtiNode, elementDisplayNode,
		state) {
	elementDisplayNode = $(elementDisplayNode);

	var id = qtiNode.attr("id");
	var cls = qtiNode.attr("class");
	var lang = qtiNode.attr("lang");
	var label = qtiNode.attr("label");

	if (QTI.Classes.BodyElement.TRANSFER_ID && id != undefined) {
		elementDisplayNode.attr("id", id);
	}
	if (QTI.Classes.BodyElement.TRANSFER_CLASS && cls != undefined) {
		elementDisplayNode.addClass(cls);
	}
	if (lang != undefined) {
		elementDisplayNode.attr("lang", lang);
	}
}

// choice

QTI.Classes.Choice = {}

QTI.Classes.Choice.NAME = "Choice";
QTI.Classes.Choice.TAG = "choice";

QTI.Classes.Choice.GET_DERIVED = function() {
	return [];
}

QTI.Classes.Choice.GET_ALLOWED_CONTENT = function() {
	return [];
}

QTI.Classes.Choice.extend = {};

QTI.Classes.Choice.extend.play = function(qtiNode, elementDisplayNode, state) {
	elementDisplayNode = $(elementDisplayNode);
}

// feedback element

QTI.Classes.FeedbackElement = {}

QTI.Classes.FeedbackElement.NAME = "Feedback Element";
QTI.Classes.FeedbackElement.TAG = "feedbackElement";

QTI.Classes.FeedbackElement.GET_DERIVED = function() {
	return [];
}

QTI.Classes.FeedbackElement.GET_ALLOWED_CONTENT = function() {
	return [];
}

// flow

QTI.Classes.Flow = {}

QTI.Classes.Flow.NAME = "Flow";
QTI.Classes.Flow.TAG = "flow";

QTI.Classes.Flow.GET_DERIVED = function() {
	return [ QTI.Classes.BlockInteraction, QTI.Classes.FlowStatic,
			QTI.Classes.InlineInteraction ];
}

QTI.Classes.Flow.GET_ALLOWED_CONTENT = function() {
	return [];
}

// flow static

QTI.Classes.FlowStatic = {}

QTI.Classes.FlowStatic.NAME = "Flow Static";
QTI.Classes.FlowStatic.TAG = "flowStatic";

QTI.Classes.FlowStatic.GET_DERIVED = function() {
	return [ QTI.Classes.AtomicBlock, QTI.Classes.AtomicInline,
			QTI.Classes.SimpleInline, QTI.Classes.SimpleBlock ];
}

QTI.Classes.FlowStatic.GET_ALLOWED_CONTENT = function() {
	return [];
}

// inline

QTI.Classes.Inline = {}

QTI.Classes.Inline.NAME = "Inline";
QTI.Classes.Inline.TAG = "inline";

QTI.Classes.Inline.GET_DERIVED = function() {
	return [ QTI.Classes.InlineInteraction, QTI.Classes.InlineStatic ];
}

QTI.Classes.Inline.GET_ALLOWED_CONTENT = function() {
	return [];
}

QTI.Classes.Inline.extend = {};

QTI.Classes.Inline.extend.play = function(qtiNode, elementDisplayNode, state) {
	elementDisplayNode = $(elementDisplayNode);

	if (elementDisplayNode.css("display") == undefined) {
		elementDisplayNode.css({
			"display" : "inline"
		});
	}
}

// inline interaction

QTI.Classes.InlineInteraction = {}

QTI.Classes.InlineInteraction.NAME = "Inline Interaction";
QTI.Classes.InlineInteraction.TAG = "inlineInteraction";

QTI.Classes.InlineInteraction.GET_DERIVED = function() {
	return [];
}

QTI.Classes.InlineInteraction.GET_ALLOWED_CONTENT = function() {
	return [];
}

// inline static

QTI.Classes.InlineStatic = {}

QTI.Classes.InlineStatic.NAME = "Inline Static";
QTI.Classes.InlineStatic.TAG = "inlineStatic";

QTI.Classes.InlineStatic.GET_DERIVED = function() {
	return [ QTI.Classes.AtomicInline, QTI.Classes.SimpleInline ];
}

QTI.Classes.InlineStatic.GET_ALLOWED_CONTENT = function() {
	return [];
}

// interaction

QTI.Classes.Interaction = {}

QTI.Classes.Interaction.NAME = "Interaction";
QTI.Classes.Interaction.TAG = "interaction";

QTI.Classes.Interaction.GET_DERIVED = function() {
	return [ QTI.Classes.BlockInteraction, QTI.Classes.InlineInteraction ];
}

QTI.Classes.Interaction.GET_ALLOWED_CONTENT = function() {
	return [];
}

// object flow

QTI.Classes.ObjectFlow = {}

QTI.Classes.ObjectFlow.NAME = "Object Flow";
QTI.Classes.ObjectFlow.TAG = "objectFlow";

QTI.Classes.ObjectFlow.GET_DERIVED = function() {
	return [ QTI.Classes.Flow ];
}

QTI.Classes.ObjectFlow.GET_ALLOWED_CONTENT = function() {
	return [];
}

// simple block

QTI.Classes.SimpleBlock = {}

QTI.Classes.SimpleBlock.NAME = "Simple Block";
QTI.Classes.SimpleBlock.TAG = "simpleBlock";

QTI.Classes.SimpleBlock.GET_DERIVED = function() {
	return [];
}

QTI.Classes.SimpleBlock.GET_ALLOWED_CONTENT = function() {
	return [ QTI.Classes.Block ];
}

// simple inline

QTI.Classes.SimpleInline = {}

QTI.Classes.SimpleInline.NAME = "Simple Inline";
QTI.Classes.SimpleInline.TAG = "simpleInline";

QTI.Classes.SimpleInline.GET_DERIVED = function() {
	return [];
}

QTI.Classes.SimpleInline.GET_ALLOWED_CONTENT = function() {
	return [ QTI.Classes.Inline ];
}

// string interaction

QTI.Classes.StringInteraction = {}

QTI.Classes.StringInteraction.NAME = "Block Interaction";
QTI.Classes.StringInteraction.TAG = "blockInteraction";

QTI.Classes.StringInteraction.GET_DERIVED = function() {
	return [];
}

QTI.Classes.StringInteraction.GET_ALLOWED_CONTENT = function() {
	return [];
}

// variable declaration

QTI.Classes.VariableDeclaration = {}

QTI.Classes.VariableDeclaration.NAME = "Variable Declaration";
QTI.Classes.VariableDeclaration.TAG = "variableDeclaration";

QTI.Classes.VariableDeclaration.GET_DERIVED = function() {
	return [];
}

QTI.Classes.VariableDeclaration.GET_ALLOWED_CONTENT = function() {
	return [ QTI.Elements.DefaultValue ];
}

// element

QTI.Element = {};

// elements

QTI.Elements = {};

// assignment item

QTI.Elements.AssignmentItemItem = {};

QTI.Elements.AssignmentItemItem.NAME = "Assignment Item";
QTI.Elements.AssignmentItemItem.TAG = "assessmentItem";

QTI.Elements.AssignmentItemItem.GET_ALLOWED_CONTENT = function() {
	return [ QTI.Elements.ItemBody, QTI.Elements.ResponseDeclaration,
			QTI.Elements.ResponseProcessing ];
}

QTI.Elements.AssignmentItemItem.play = function(qtiNode, displayNode, state) {
	var elementDisplayNode = QTI.prepare(qtiNode, $("<div></div>"));

	$(displayNode).append(elementDisplayNode);

	this.extend.play(qtiNode, elementDisplayNode, state);
	this.processChildren(qtiNode, elementDisplayNode,state);
}

QTI.Elements.AssignmentItemItem.onRenderComplete = function(qtiNode,
		displayNode, state) {
	if (state && state.practice) {
		if (state.correct != undefined) {
			if (!state.correct) {
				displayNode.prepend($("<div></div>").addClass(
						"alert alert-error alert-danger").attr(
						"data-qti-ignore", "true").html(
						"<b>Incorrect answer</b>").css("margin", "10px 0px"));
			} else {
				displayNode.prepend($("<div></div>").addClass(
						"alert alert-success").attr("data-qti-ignore", "true")
						.html("<b>Correct answer</b>")
						.css("margin", "10px 0px"));
			}
		}
	}
}

// blockquote

QTI.Elements.Blockquote = {};

QTI.Elements.Blockquote.NAME = "Blockquote";
QTI.Elements.Blockquote.TAG = "blockquote";

QTI.Elements.Blockquote.CLASS = QTI.Classes.SimpleBlock;

QTI.Elements.Blockquote.GET_ALLOWED_CONTENT = function() {
	return [];
}

QTI.Elements.Blockquote.play = function(qtiNode, displayNode, state) {
	var elementDisplayNode = QTI.prepare(qtiNode,
			$("<blockquote></blockquote>"));

	var cite = qtiNode.attr("cite");

	if (cite != undefined) {
		elementDisplayNode.attr("cite", cite);
	}

	$(displayNode).append(elementDisplayNode);

	this.extend.play(qtiNode, elementDisplayNode, state);
	this.processChildren(qtiNode, elementDisplayNode, state);
}

// bold

QTI.Elements.Bold = {};

QTI.Elements.Bold.NAME = "Bold";
QTI.Elements.Bold.TAG = "b";

QTI.Elements.Bold.CLASS = QTI.Classes.SimpleInline;

QTI.Elements.Bold.MARKUP = "<b></b>";

QTI.Elements.Bold.GET_ALLOWED_CONTENT = function() {
	return [];
}

QTI.Elements.Bold.play = function(qtiNode, displayNode, state) {
	var elementDisplayNode = QTI.prepare(qtiNode, $(QTI.Elements.Bold.MARKUP));

	$(displayNode).append(elementDisplayNode);

	this.extend.play(qtiNode, elementDisplayNode, state);
	this.processChildren(qtiNode, elementDisplayNode, state);
}

// choice interaction

QTI.Elements.ChoiceInteraction = {};

QTI.Elements.ChoiceInteraction.NAME = "Choice Interaction";
QTI.Elements.ChoiceInteraction.TAG = "choiceInteraction";

QTI.Elements.ChoiceInteraction.CLASS = QTI.Classes.BlockInteraction;

QTI.Elements.ChoiceInteraction.GET_ALLOWED_CONTENT = function() {
	return [ QTI.Elements.SimpleChoice ];
}

QTI.Elements.ChoiceInteraction.play = function(qtiNode, displayNode, state) {
	var elementDisplayNode = QTI.prepare(qtiNode, $("<form></form>"));

	var shuffle = QTISettings.enableShuffle ? QTI.Attribute.toBoolean(qtiNode
			.attr("shuffle")) : false;

	$(displayNode).append(elementDisplayNode);

	this.extend.play(qtiNode, elementDisplayNode, state);
	this.processChildren(qtiNode, elementDisplayNode, state);

	if (shuffle) {
		var randomize = function(selector) {
			var elements = this.find(selector);
			elements.each(function(index, element) {
				element = $(element);
				var placeholder = $("<span></span>");
				placeholder.insertBefore(element);
				var replacementElement = $(elements[Math.floor(Math.random()
						* elements.length)]);
				element.insertBefore(replacementElement);
				replacementElement.insertBefore(placeholder);
				placeholder.remove();
			});
		};
		randomize.call(displayNode, "[data-qti-tag="
				+ QTI.Elements.SimpleChoice.TAG
				+ "]:not([data-qti---fixed-boolean=true])");
	}

	elementDisplayNode.data().qti.response = function(responses) {
		elementDisplayNode
				.find("[data-qti-tag=" + QTI.Elements.SimpleChoice.TAG + "]")
				.each(
						function(index, simpleChoiceNode) {
							simpleChoiceNode = $(simpleChoiceNode);

							var responseIdentifier = elementDisplayNode.data().qti
									.attribute("responseidentifier");

							responses[responseIdentifier] = simpleChoiceNode
									.data().qti["___response"]
									(responses[responseIdentifier]);
						});
	};
}

// correct response

QTI.Elements.CorrectResponse = {};

QTI.Elements.CorrectResponse.NAME = "Correct Response";
QTI.Elements.CorrectResponse.TAG = "correctResponse";

QTI.Elements.CorrectResponse.DISPLAY = false;

QTI.Elements.CorrectResponse.GET_ALLOWED_CONTENT = function() {
	return [ QTI.Elements.Value ];
}

QTI.Elements.CorrectResponse.play = function(qtiNode, displayNode, state) {
	this.DISPLAY = CustomQuestionTemplate[state.questionType].DISPLAY;
	var elementDisplayNode = QTI.prepare(qtiNode, $("<div></div>"));

	$(displayNode).append(elementDisplayNode);

	this.extend.play(qtiNode, elementDisplayNode, state);
	this.processChildren(qtiNode, elementDisplayNode, state);
}

// default value

QTI.Elements.DefaultValue = {};

QTI.Elements.DefaultValue.NAME = "Default Value";
QTI.Elements.DefaultValue.TAG = "defaultValue";

QTI.Elements.DefaultValue.GET_ALLOWED_CONTENT = function() {
	return [ QTI.Elements.Value ];
}

QTI.Elements.DefaultValue.play = function(qtiNode, displayNode, state) {
	var elementDisplayNode = QTI.prepare(qtiNode, $("<div></div>"));

	$(displayNode).append(elementDisplayNode);

	this.extend.play(qtiNode, elementDisplayNode, state);
	this.processChildren(qtiNode, elementDisplayNode, state);
}

// feedback block

QTI.Elements.FeedbackBlock = {};

QTI.Elements.FeedbackBlock.NAME = "Feedback";
QTI.Elements.FeedbackBlock.TAG = "feedbackBlock";

QTI.Elements.FeedbackBlock.CLASS = [ QTI.Classes.FeedbackElement,
		QTI.Classes.SimpleBlock, ];

QTI.Elements.FeedbackBlock.GET_ALLOWED_CONTENT = function() {
	return [];
}

QTI.Elements.FeedbackBlock.play = function(qtiNode, displayNode, state) {
	var elementDisplayNode = QTI.prepare(qtiNode, $("<div></div>"));

	var contentsDisplayNode = $("<div></div>").addClass("alert alert-info")
			.css({
				"margin-bottom" : "0px"
			}).attr({
				"data---qti-content-container" : "true"
			});
	elementDisplayNode.append(contentsDisplayNode);

	$(displayNode).append(elementDisplayNode);

	this.extend.play(qtiNode, elementDisplayNode, state);
	this.processChildren(qtiNode, contentsDisplayNode, state);
}

// feedback inline

QTI.Elements.FeedbackInline = {};

QTI.Elements.FeedbackInline.NAME = "Inline Feedback";
QTI.Elements.FeedbackInline.TAG = "feedbackInline";

QTI.Elements.FeedbackInline.CLASS = [ QTI.Classes.FeedbackElement,
		QTI.Classes.SimpleInline, ];

QTI.Elements.FeedbackInline.GET_ALLOWED_CONTENT = function() {
	return [];
}

QTI.Elements.FeedbackInline.play = function(qtiNode, displayNode, state) {
	var elementDisplayNode = QTI.prepare(qtiNode, $("<div></div>"));

	elementDisplayNode.css({
		"display" : "inline-block"
	});

	var contentsDisplayNode = $("<div></div>").addClass("alert alert-info")
			.css({
				"margin-bottom" : "0px",
				"diplay" : "inline-block"
			}).attr({
				"data---qti-content-container" : "true"
			});
	elementDisplayNode.append(contentsDisplayNode);

	$(displayNode).append(elementDisplayNode);

	this.extend.play(qtiNode, elementDisplayNode, state);
	this.processChildren(qtiNode, contentsDisplayNode, state);
}

// header 1

QTI.Elements.Header1 = {};

QTI.Elements.Header1.NAME = "Header 1";
QTI.Elements.Header1.TAG = "h1";

QTI.Elements.Header1.CLASS = QTI.Classes.AtomicBlock;

QTI.Elements.Header1.GET_ALLOWED_CONTENT = function() {
	return [];
}

QTI.Elements.Header1.play = function(qtiNode, displayNode, state) {
	var elementDisplayNode = QTI.prepare(qtiNode, $("<h1></h1>"));

	$(displayNode).append(elementDisplayNode);

	this.extend.play(qtiNode, elementDisplayNode, state);
	this.processChildren(qtiNode, elementDisplayNode, state);
}

// header 2

QTI.Elements.Header2 = {};

QTI.Elements.Header2.NAME = "Header 2";
QTI.Elements.Header2.TAG = "h2";

QTI.Elements.Header2.CLASS = QTI.Classes.AtomicBlock;

QTI.Elements.Header2.GET_ALLOWED_CONTENT = function() {
	return [];
}

QTI.Elements.Header2.play = function(qtiNode, displayNode, state) {
	var elementDisplayNode = QTI.prepare(qtiNode, $("<h2></h2>"));

	$(displayNode).append(elementDisplayNode);

	this.extend.play(qtiNode, elementDisplayNode, state);
	this.processChildren(qtiNode, elementDisplayNode, state);
}

// header 3

QTI.Elements.Header3 = {};

QTI.Elements.Header3.NAME = "Header 3";
QTI.Elements.Header3.TAG = "h3";

QTI.Elements.Header3.CLASS = QTI.Classes.AtomicBlock;

QTI.Elements.Header3.GET_ALLOWED_CONTENT = function() {
	return [];
}

QTI.Elements.Header3.play = function(qtiNode, displayNode, state) {
	var elementDisplayNode = QTI.prepare(qtiNode, $("<h3></h3>"));

	$(displayNode).append(elementDisplayNode);

	this.extend.play(qtiNode, elementDisplayNode, state);
	this.processChildren(qtiNode, elementDisplayNode, state);
}

// header 4

QTI.Elements.Header4 = {};

QTI.Elements.Header4.NAME = "Header 4";
QTI.Elements.Header4.TAG = "h4";

QTI.Elements.Header4.CLASS = QTI.Classes.AtomicBlock;

QTI.Elements.Header4.GET_ALLOWED_CONTENT = function() {
	return [];
}

QTI.Elements.Header4.play = function(qtiNode, displayNode, state) {
	var elementDisplayNode = QTI.prepare(qtiNode, $("<h4></h4>"));

	$(displayNode).append(elementDisplayNode);

	this.extend.play(qtiNode, elementDisplayNode, state);
	this.processChildren(qtiNode, elementDisplayNode, state);
}

// header 5

QTI.Elements.Header5 = {};

QTI.Elements.Header5.NAME = "Header 5";
QTI.Elements.Header5.TAG = "h5";

QTI.Elements.Header5.CLASS = QTI.Classes.AtomicBlock;

QTI.Elements.Header5.GET_ALLOWED_CONTENT = function() {
	return [];
}

QTI.Elements.Header5.play = function(qtiNode, displayNode, state) {
	var elementDisplayNode = QTI.prepare(qtiNode, $("<h5></h5>"));

	$(displayNode).append(elementDisplayNode);

	this.extend.play(qtiNode, elementDisplayNode, state);
	this.processChildren(qtiNode, elementDisplayNode, state);
}

// header 6

QTI.Elements.Header6 = {};

QTI.Elements.Header6.NAME = "Header 6";
QTI.Elements.Header6.TAG = "h6";

QTI.Elements.Header6.CLASS = QTI.Classes.AtomicBlock;

QTI.Elements.Header6.GET_ALLOWED_CONTENT = function() {
	return [];
}

QTI.Elements.Header6.play = function(qtiNode, displayNode, state) {
	var elementDisplayNode = QTI.prepare(qtiNode, $("<h6></h6>"));

	$(displayNode).append(elementDisplayNode);

	this.extend.play(qtiNode, elementDisplayNode, state);
	this.processChildren(qtiNode, elementDisplayNode, state);
}

// image

QTI.Elements.Image = {};

QTI.Elements.Image.NAME = "Image";
QTI.Elements.Image.TAG = "img";

QTI.Elements.Image.CONTENT_CONTAINER = "[data---qti-content-container]";

QTI.Elements.Image.CLASS = QTI.Classes.AtomicInline;

QTI.Elements.Image.GET_ALLOWED_CONTENT = function() {
	return [];
}

QTI.Elements.Image.play = function(qtiNode, displayNode, state) {
	var elementDisplayNode = QTI.prepare(qtiNode, $("<div></div>"));

	elementDisplayNode.css({
		"display" : "inline-block"
	});

	var imageDisplayNode = $("<img></img>").attr({
		"data---qti-content-container" : "true"
	});

	var src = qtiNode.attr("src");
	var width = parseFloat(qtiNode.attr("width"));
	var height = parseFloat(qtiNode.attr("height"));
	var alt = qtiNode.attr("alt");
	var longdesc = qtiNode.attr("longdesc");

	if (src != undefined) {
		imageDisplayNode.attr("src", src);
	}

	if (!isNaN(width) && width != undefined) {
		imageDisplayNode.css({
			"width" : width + "px"
		});
	} else {
		imageDisplayNode.css({
			"width" : "auto"
		});
	}

	if (!isNaN(height) && height != undefined) {
		imageDisplayNode.css({
			"height" : height + "px"
		});
	} else {
		imageDisplayNode.css({
			"height" : "auto"
		});
	}

	if (alt != undefined) {
		imageDisplayNode.attr("alt", alt);
	}

	if (longdesc != undefined) {
		imageDisplayNode.attr("longdesc", longdesc);
	}

	elementDisplayNode.append(imageDisplayNode);

	$(displayNode).append(elementDisplayNode);

	var contentsDisplayNode = imageDisplayNode;

	this.extend.play(qtiNode, contentsDisplayNode, state);
	this.processChildren(qtiNode, contentsDisplayNode, state);
}

// italic

QTI.Elements.Italic = {};

QTI.Elements.Italic.NAME = "Italic";
QTI.Elements.Italic.TAG = "i";

QTI.Elements.Italic.CLASS = QTI.Classes.SimpleInline;

QTI.Elements.Italic.MARKUP = "<i></i>";

QTI.Elements.Italic.GET_ALLOWED_CONTENT = function() {
	return [];
}

QTI.Elements.Italic.play = function(qtiNode, displayNode, state) {
	var elementDisplayNode = QTI
			.prepare(qtiNode, $(QTI.Elements.Italic.MARKUP));

	$(displayNode).append(elementDisplayNode);

	this.extend.play(qtiNode, elementDisplayNode, state);
	this.processChildren(qtiNode, elementDisplayNode, state);
}

// item body

QTI.Elements.ItemBody = {};

QTI.Elements.ItemBody.NAME = "Item Body";
QTI.Elements.ItemBody.TAG = "itemBody";

QTI.Elements.ItemBody.CLASS = QTI.Classes.BodyElement;

QTI.Elements.ItemBody.GET_ALLOWED_CONTENT = function() {
	return [ QTI.Classes.Block ];
}

QTI.Elements.ItemBody.play = function(qtiNode, displayNode, state) {
	QTISettings.index = ""
	var elementDisplayNode = QTI.prepare(qtiNode, $("<div></div>"));

	$(displayNode).append(elementDisplayNode);

	this.extend.play(qtiNode, elementDisplayNode, state);
	this.processChildren(qtiNode, elementDisplayNode, state);
}

// line break

QTI.Elements.LineBreak = {};

QTI.Elements.LineBreak.NAME = "Line Break";
QTI.Elements.LineBreak.TAG = "br";

QTI.Elements.LineBreak.CLASS = QTI.Classes.AtomicInline;

QTI.Elements.LineBreak.MARKUP = "<br></br>";

QTI.Elements.LineBreak.GET_ALLOWED_CONTENT = function() {
	return [];
}

QTI.Elements.LineBreak.play = function(qtiNode, displayNode, state) {
	var elementDisplayNode = QTI.prepare(qtiNode,
			$(QTI.Elements.LineBreak.MARKUP));

	$(displayNode).append(elementDisplayNode);

	this.extend.play(qtiNode, elementDisplayNode, state);
	this.processChildren(qtiNode, elementDisplayNode, state);
}

// order interaction

QTI.Elements.OrderInteraction = {};

QTI.Elements.OrderInteraction.NAME = "Order Interaction";
QTI.Elements.OrderInteraction.TAG = "orderInteraction";

QTI.Elements.OrderInteraction.CLASS = QTI.Classes.BlockInteraction;

QTI.Elements.OrderInteraction.GET_ALLOWED_CONTENT = function() {
	return [ QTI.Elements.SimpleChoice ];
}

QTI.Elements.OrderInteraction.SORTABLE = true;

QTI.Elements.OrderInteraction.play = function(qtiNode, displayNode, state) {
	var elementDisplayNode = QTI.prepare(qtiNode, $("<form></form>"));

	var shuffle = QTISettings.enableShuffle ? QTI.Attribute.toBoolean(qtiNode
			.attr("shuffle")) : false;
	var orientation = qtiNode.attr("orientation");

	var isHorizontalOrientation = false;
	if (orientation) {
		if ($.trim(orientation.toLowerCase()) == "horizontal") {
			isHorizontalOrientation = true;
			elementDisplayNode
					.attr("data-qti---horizontal-orientation", "true");
		}
	}

	$(displayNode).append(elementDisplayNode);

	this.extend.play(qtiNode, elementDisplayNode, state);
	this.processChildren(qtiNode, elementDisplayNode, state);

	if (shuffle) {
		var randomize = function(selector) {
			var elements = this.find(selector);
			elements.each(function(index, element) {
				element = $(element);
				var placeholder = $("<span></span>");
				placeholder.insertBefore(element);
				var replacementElement = $(elements[Math.floor(Math.random()
						* elements.length)]);
				element.insertBefore(replacementElement);
				replacementElement.insertBefore(placeholder);
				placeholder.remove();
			});
		};
		randomize.call(displayNode, "[data-qti-tag="
				+ QTI.Elements.SimpleChoice.TAG
				+ "]:not([data-qti---fixed-boolean=true])");
	}

	if (QTI.Elements.OrderInteraction.SORTABLE) {
		elementDisplayNode.sortable({
			"items" : "[data-qti-tag=" + QTI.Elements.SimpleChoice.TAG + "]",
			"start" : function(e, ui) {
				if (isHorizontalOrientation) {
					$(ui.helper).css({
						"display" : "inline-block",
						"width" : $(ui.item).outerWidth() + "px",
						"height" : $(ui.item).outerHeight() + "px"
					});

					$(ui.placeholder).css({
						"display" : "inline-block",
						"width" : $(ui.item).outerWidth() + "px",
						"height" : "1px"
					});
				}
			}
		});
	}

	elementDisplayNode.data().qti.response = function(responses) {
		elementDisplayNode
				.find("[data-qti-tag=" + QTI.Elements.SimpleChoice.TAG + "]")
				.each(
						function(index, simpleChoiceNode) {
							simpleChoiceNode = $(simpleChoiceNode);

							var responseIdentifier = elementDisplayNode.data().qti
									.attribute("responseidentifier");

							responses[responseIdentifier] = simpleChoiceNode
									.data().qti["___response"]
									(responses[responseIdentifier]);
						});
	};
}

// outcome declaration

QTI.Elements.OutcomeDeclaration = {};

QTI.Elements.OutcomeDeclaration.NAME = "Outcome Declaration";
QTI.Elements.OutcomeDeclaration.TAG = "outcomeDeclaration";

QTI.Elements.OutcomeDeclaration.DISPLAY = false;

QTI.Elements.OutcomeDeclaration.CLASS = QTI.Classes.VariableDeclaration;

QTI.Elements.OutcomeDeclaration.GET_ALLOWED_CONTENT = function() {
	return [];
}

QTI.Elements.OutcomeDeclaration.play = function(qtiNode, displayNode, state) {
	var elementDisplayNode = QTI.prepare(qtiNode, $("<div></div>"));

	$(displayNode).append(elementDisplayNode);

	this.extend.play(qtiNode, elementDisplayNode, state);
	this.processChildren(qtiNode, elementDisplayNode, state);
}

// paragraph

QTI.Elements.Paragraph = {};

QTI.Elements.Paragraph.NAME = "Paragraph";
QTI.Elements.Paragraph.TAG = "p";

QTI.Elements.Paragraph.CLASS = QTI.Classes.AtomicBlock;

QTI.Elements.Paragraph.GET_ALLOWED_CONTENT = function() {
	return [ QTI.Elements.Font, QTI.Elements.InlineChoiceInteraction ];
}

QTI.Elements.Paragraph.play = function(qtiNode, displayNode, state) {
	
	
if(state.questionType=="Matching"){
		
	    var qstnCaption='';
	    var elementDisplayNode ='';
	    
	    if($(displayNode)[0].nodeName!="BLOCKQUOTE"){
	    	
	    	 elementDisplayNode = QTI.prepare(qtiNode,
					$("<p class='optionLabelView'></p>"));
	    	 
	    	 $(displayNode).append(elementDisplayNode);
	    	 
	    	 this.extend.play(qtiNode, elementDisplayNode, state);

/*	    		if(qtiNode.get(0).innerHTML.indexOf("<![CDATA[") > -1)
	    			elementDisplayNode.html(qtiNode.eq(0).get(0).childNodes[0].textContent);
	    		else*/
	    			elementDisplayNode.html(qtiNode.get(0).innerHTML);
	    	 
	    	  qstnCaption=QTI.replaceImage(elementDisplayNode);		 
	    	
	    	
	    }else{
	    	
	    	 elementDisplayNode = QTI.prepare(qtiNode,$("<p></p>"));
		  
		    
	    	 var optionPtext
/*	    		if(qtiNode.get(0).innerHTML.indexOf("<![CDATA[") > -1){
	    			optionPtext = qtiNode.eq(0).get(0).childNodes[0].textContent;
	    		}
	    		else
    			{*/
	    			optionPtext = qtiNode.html();
	    			optionPtext = optionPtext.substring(0, optionPtext.indexOf("<inlineChoiceInteraction")).trim();
/*    			}*/
	    	 
//	    	optionPtext = $(qtiNode.get(0).childNodes[0]).text().trim()
	    	var optiontext=$(qtiNode).text();
	    	
	    	qstnCaption=optionPtext;
	    
	    	$(displayNode).append(elementDisplayNode);
	    	 
	    	 this.extend.play(qtiNode, elementDisplayNode, state);
	  		this.processChildren(qtiNode, elementDisplayNode, state);
	  		
	  		if(qstnCaption!=""){
	  			
	              var    contentsDisplayNode = $("<label class='mOptionLabel'></label>").attr({                      
                      "data---qti-content-container" : "true"
                  });

	  		
            contentsDisplayNode.append(optionPtext);

	  		$(elementDisplayNode).append(contentsDisplayNode);
	  		optionPtext=QTI.replaceImage($(contentsDisplayNode));	

	  		}
	  	
	  		 
	    }
		
		
		if($(displayNode)[0].nodeName=="BLOCKQUOTE"){
			
			var BLOCKQUOTE_ID = QTI.BLOCKQUOTE.getId();				
				
			var mainContentsDisplayNode = $(
			"<div class='optionTextBoxMainContainer mainOptionEditablediv qti-simpleChoice' ></div>");
			
			$(mainContentsDisplayNode).append($("<div></div>").attr({			
				"class" : "mainOptionIndexdiv"
			}));	
					
			var contentsDisplayNode2 = $(
			"<div class='optionTextBoxContainer' ></div>")
			.attr({			
				"class":'optionTextBoxContainer editView',
				"contenteditable" : true,
				"data---qti-content-container" : true	,
				"id":"simpleChoice_Matching"
			})
			
					contentsDisplayNode2.attr("data-placeholder",CustomQuestionTemplate[state.questionType].editOption_Column_A.replace("#", "#"+BLOCKQUOTE_ID) + "A");
		
			$(mainContentsDisplayNode).find("div.mainOptionIndexdiv").append("A"+BLOCKQUOTE_ID);
			
			if(optionPtext==""){
				contentsDisplayNode2.attr("data-placeholder",CustomQuestionTemplate[state.questionType].editOption_Column_A.replace("#", "#"+BLOCKQUOTE_ID) + "A");
			}else{
				contentsDisplayNode2.html(optionPtext);
			}
				
			
			$(mainContentsDisplayNode).append(contentsDisplayNode2);		
			
			
			$(mainContentsDisplayNode).append(
					$("<div></div>").attr({			
						"class" : "mainOptionOperationdiv"
					}));
			
			$(displayNode).find("div.optionsMaindiv").prepend(mainContentsDisplayNode);
				
			$(displayNode).find("div.mainOptionOperationdiv").append(
					$("<button title='Upload picture'></button>").attr({						
						"name" : "image",				
						"class" : "iconButtons glyphicon glyphicon-picture",
						"ng-click" : "addImage(this,$event,'div.qti-simpleChoice')"
					}));
			
			$(displayNode).find("div.mainOptionOperationdiv").append(
					$("<button title='Add answer'></button>").attr({							
						"name" : "Add",				
						"class" : "iconButtons glyphicon glyphicon-plus",				
						"ng-click" : "addBlockquote(this,$event)"
					}));
			
			$(displayNode).find("div.mainOptionOperationdiv").append(
					$("<button title='Delete this answer'></button>").attr({					
						"name" : "delete",				
						"class" : "iconButtons glyphicon glyphicon-remove",
						"ng-click" : "deleteBlockquote(this,$event)"
					}));
			
		}else{
			
			var contentsDisplayNode2 = $(
			"<div class='textBoxContainer editView editablediv' ></div>")
			.attr({			
				"class":'textBoxContainer editView editablediv'				
			})
			
			$(displayNode).append(contentsDisplayNode2);
		}
		
		
var textBox = $("<div contenteditable='true'  class='editView' type='text' id='qtiCaption'></div>");
		
		if((state.templateQstn)&&(qstnCaption=="")){				
				if($(displayNode)[0].nodeName=="BLOCKQUOTE"){
					var BLOCKQUOTE_ID = QTI.BLOCKQUOTE.getId();
					var blockQuoteVAL=CustomQuestionTemplate[state.questionType].printOption + " "+ BLOCKQUOTE_ID + "__";
					$(elementDisplayNode).append($("<span class='printView printViewOption'></span>").text(
							blockQuoteVAL));
				}else{
					textBox.attr("data-placeholder",CustomQuestionTemplate[state.questionType].editCaption);
					$(elementDisplayNode).append(CustomQuestionTemplate[state.questionType].printCaption);
				}
				
		}else{
				textBox.html(qstnCaption);
		}			
			
			
		$(displayNode).find("div.textBoxContainer").append(
				$("<div></div>").attr({			
					"class" : "imageIconContainer editView"
				}));
		
		$(displayNode).find("div.textBoxContainer").append(textBox);
//		$(displayNode).append(textBox);
		
		$(displayNode).find("div.imageIconContainer").append(
				$("<button title='Upload picture'></button>").attr({
					"id" : "id",				
					"name" : "image",				
					"class" : "iconButtons glyphicon glyphicon-picture",
					"ng-click" : "addImage(this,$event,'div.textBoxContainer')"
				}));
		
		
		
	}else{

	
	var elementDisplayNode = QTI.prepare(qtiNode,
			$("<p class='optionLabelView'></p>"));
	$(displayNode).append(elementDisplayNode);
	this.extend.play(qtiNode, elementDisplayNode, state);
//	this.processChildren(qtiNode, elementDisplayNode, state);
/*	if(qtiNode.get(0).innerHTML.indexOf("<![CDATA[") > -1)
		elementDisplayNode.html(qtiNode.eq(0).get(0).childNodes[0].textContent);
	else*/
		elementDisplayNode.html(qtiNode.get(0).innerHTML);
	

	var qstnCaption=QTI.replaceImage(elementDisplayNode);
	
	var contentsDisplayNode2 = $(
	"<div class='textBoxContainer editView editablediv' ></div>")
	.attr({			
		"class":'textBoxContainer editView editablediv'				
	})
	$(displayNode).append(contentsDisplayNode2);
	
		var textBox = $("<div contenteditable='true'  class='editView' type='text' id='qtiCaption'></div>");
		
		if((state.templateQstn)&&(qstnCaption=="")){
				textBox.attr("data-placeholder",CustomQuestionTemplate[state.questionType].editCaption);
				$(elementDisplayNode).html(CustomQuestionTemplate[state.questionType].printCaption);
		}else{
				textBox.html(qstnCaption);
		}			
			
		
		
		$(displayNode).find("div.textBoxContainer").append(
				$("<div></div>").attr({			
					"class" : "iconContainer editView"
				}));
		
		$(displayNode).find("div.textBoxContainer").append(textBox);
//		$(displayNode).append(textBox);
		
		$(displayNode).find("div.iconContainer").append(
				$("<button title='Upload picture'></button>").attr({
					"id" : "id",				
					"name" : "image",				
					"class" : "iconButtons glyphicon glyphicon-picture",
					"ng-click" : "addImage(this,$event,'div.textBoxContainer')"
				}));
		
		
		
	}

}

// prompt

QTI.Elements.Prompt = {};

QTI.Elements.Prompt.NAME = "Prompt";
QTI.Elements.Prompt.TAG = "prompt";

QTI.Elements.Prompt.CLASS = QTI.Classes.BodyElement;

QTI.Elements.Prompt.CONTENT_CONTAINER = "[data---qti-content-container]";

QTI.Elements.Prompt.GET_ALLOWED_CONTENT = function() {
	return [ QTI.Classes.InlineStatic ];
}

QTI.Elements.Prompt.play = function(qtiNode, displayNode, state) {
	var elementDisplayNode = QTI.prepare(qtiNode, $("<p></p>"));

	var contentsDisplayNode = $("<strong></strong>").attr({
		"data---qti-content-container" : "true"
	});
	elementDisplayNode.append(contentsDisplayNode);

	$(displayNode).append(elementDisplayNode);

	this.extend.play(qtiNode, elementDisplayNode, state);
	this.processChildren(qtiNode, contentsDisplayNode, state);
}

// response declaration

QTI.Elements.ResponseDeclaration = {};

QTI.Elements.ResponseDeclaration.NAME = "Response Declaration";
QTI.Elements.ResponseDeclaration.TAG = "responseDeclaration";

QTI.Elements.ResponseDeclaration.DISPLAY = false;

QTI.Elements.ResponseDeclaration.CLASS = QTI.Classes.VariableDeclaration;

QTI.Elements.ResponseDeclaration.GET_ALLOWED_CONTENT = function() {
	return [ QTI.Elements.CorrectResponse ];
}

QTI.Elements.ResponseDeclaration.play = function(qtiNode, displayNode, state) {
	if(state.questionType)
		if(CustomQuestionTemplate[state.questionType])
			CustomQuestionTemplate[state.questionType].makeExtra(null,this,qtiNode);
		
	var elementDisplayNode = QTI.prepare(qtiNode, $("<div></div>"));

	$(displayNode).append(elementDisplayNode);

	this.extend.play(qtiNode, elementDisplayNode, state);
	this.processChildren(qtiNode, elementDisplayNode, state);
}

// response processing

QTI.Elements.ResponseProcessing = {};

QTI.Elements.ResponseProcessing.NAME = "Response Processing";
QTI.Elements.ResponseProcessing.TAG = "responseProcessing";

QTI.Elements.ResponseProcessing.DISPLAY = false;

QTI.Elements.ResponseProcessing.GET_ALLOWED_CONTENT = function() {
	return [];
}

QTI.Elements.ResponseProcessing.play = function(qtiNode, displayNode, state) {
	var elementDisplayNode = QTI.prepare(qtiNode, $("<div></div>"));

	$(displayNode).append(elementDisplayNode);

	this.extend.play(qtiNode, elementDisplayNode, state);
	this.processChildren(qtiNode, elementDisplayNode, state);
}

// simple choice

QTI.Elements.SimpleChoice = {};

QTI.Elements.SimpleChoice.NAME = "Simple Choice";
QTI.Elements.SimpleChoice.TAG = "simpleChoice";

QTI.Elements.SimpleChoice.CLASS = QTI.Classes.Choice;

QTI.Elements.SimpleChoice.CONTENT_CONTAINER = "[data---qti-content-container]";

QTI.Elements.SimpleChoice.GET_ALLOWED_CONTENT = function() {
	return [ QTI.Classes.FlowStatic ];
}

QTI.Elements.SimpleChoice.play = function(qtiNode, displayNode, state) {
	var elementDisplayNode = QTI.prepare(qtiNode, $("<div></div>"));

	var containerDisplayNode = $("<div></div>").appendTo(elementDisplayNode);

	var interactionNode = QTI.Elements.SimpleChoice.getInteraction(qtiNode,
			displayNode);
	var hasInteraction = (interactionNode != undefined && interactionNode
			.size()) ? true : false;
	var isInteractionChoice = QTI.Elements.SimpleChoice.isInteractionChoice(
			qtiNode, displayNode);
	var isInteractionOrder = QTI.Elements.SimpleChoice.isInteractionOrder(
			qtiNode, displayNode);
	var isHorizontalInteractionOrder = QTI.Elements.SimpleChoice
			.isHorizontalInteractionOrder(qtiNode, displayNode);

	var id = QTI.Attribute.generateId(QTI.Elements.SimpleChoice.TAG);
	var identifier = qtiNode.attr("identifier") != undefined ? qtiNode
			.attr("identifier") : "";
	var fixed = QTI.Attribute.toBoolean(qtiNode.attr("fixed"));
	var name = QTI.Elements.SimpleChoice.getInteractionResponseIdentifier(
			qtiNode, displayNode);

	var minChoices = hasInteraction ? parseInt(interactionNode.data().qti
			.attribute("minChoices")) : 0;
	var maxChoices = hasInteraction ? parseInt(interactionNode.data().qti
			.attribute("maxChoices")) : 0;

	if (isHorizontalInteractionOrder) {
		elementDisplayNode.css({
			"display" : "inline-block"
		});
	}

	if (isInteractionChoice) {
		var multiple = hasInteraction ? (maxChoices == 1 ? false : true) : true;

		containerDisplayNode.addClass(multiple ? "checkbox" : "radio");
		containerDisplayNode.append($("<span class='tick printView' tooltip='correct answer' tooltip-placement='bottom'></span>")
				.html("&#10004"));
		// containerDisplayNode.append("</div>");

		containerDisplayNode.append($("<span class='printView'></span>").text(
				qtiNode.attr("index")));
		containerDisplayNode
				.append("<div class='optionSelectionDiv editView'></div>");
		containerDisplayNode.find("div.optionSelectionDiv").append(
				$("<input></input>").attr({
					"id" : id,
					"type" : multiple ? "checkbox" : "radio",
					"name" : name,
					"value" : identifier,
					"class" : "editView"
				}));
	} else if (isInteractionOrder) {
		elementDisplayNode.css({
			"padding-bottom" : "3px",
			"padding-right" : "3px"
		});

		containerDisplayNode.addClass("btn").attr(
				"qti-data---editor-cursor-auto", "true").css({
			"cursor" : "move"
		}).prepend(
				$("<i></i>").addClass("icon-move").attr(
						"qti-data---editor-remove", "true").css({
					"opacity" : .25,
					"padding-right" : "10px"
				}));

		containerDisplayNode.append($("<input></input>").attr({
			"id" : id,
			"type" : "hidden",
			"name" : name,
			"value" : identifier
		}).hide());
	} else {
		containerDisplayNode.append($("<span>a</span>").attr({
			"id" : id,
			"type" : "radio",
			"name" : name,
			"value" : identifier
		}));
	}

	elementDisplayNode.attr("data-qti---fixed-boolean", fixed ? "true"
			: "false");

	var contentsDisplayNode;
	if (isInteractionOrder) {
		contentsDisplayNode = $("<span></span>").attr({
			"data---qti-content-container" : "true"
		});
	} else {
		contentsDisplayNode = $("<label class='optionLabelView'></label>").attr({
			"for" : id,
			"data---qti-content-container" : "true"
		});
	}
	containerDisplayNode.append(contentsDisplayNode);

	$(displayNode).append(elementDisplayNode);

	this.extend.play(qtiNode, elementDisplayNode, state);
	var qtiNodeContent;
	var contentNode;
/*	if(qtiNode.get(0).innerHTML.indexOf("<![CDATA[") > -1){
		qtiNodeContent = qtiNode.eq(0).get(0).childNodes[0].textContent;
		contentNode = qtiNode
	}
	else{*/
		qtiNodeContent = qtiNode.html();
/*	}*/
	
	contentsDisplayNode.html(qtiNodeContent);

	var contentsDisplayNode1 = $(
			"<div class='optionEditablediv editView' ></div>")
			.attr({			
				"class":'optionEditablediv editView'				
			});
	
	containerDisplayNode.append(contentsDisplayNode1);
	
	containerDisplayNode.find("div.optionEditablediv").append(
			$("<div></div>").attr({			
				"class" : "optionTextEditablediv",
				"contenteditable" : "true",
				"id":id,
				"for" : id,
				"data---qti-content-container" : "true"				
			}));
	
	
	var qtiNodeHTML = QTI.replaceImage(qtiNode);
	
	if((state.templateQstn)&&(qtiNodeContent.length == 0)){
			containerDisplayNode.find("div.optionTextEditablediv").attr("data-placeholder",CustomQuestionTemplate[state.questionType].editOption);
			containerDisplayNode.find("label.optionLabelView").html(CustomQuestionTemplate[state.questionType].printOption);
		}else{
			containerDisplayNode.find("div.optionTextEditablediv").html(qtiNodeHTML);
		}
	
	
	containerDisplayNode.find("div.optionEditablediv").append(
			$("<div></div>").attr({			
				"class" : "optionOperationdiv editView"
			}));
	
		
	containerDisplayNode.find("div.optionOperationdiv").append(
			$("<button title='Upload picture'></button>").attr({
				"id" : id,				
				"name" : "image",				
				"class" : "iconButtons glyphicon glyphicon-picture",
				"ng-click" : "addImage(this,$event,'div.qti-simpleChoice')"
			}));
	
	containerDisplayNode.find("div.optionOperationdiv").append(
			$("<button title='Add answer'></button>").attr({
				"id" : id,				
				"name" : "Add",				
				"class" : "iconButtons glyphicon glyphicon-plus",				
				"ng-click" : "addOptions(this,$event)"
			}));
	
	containerDisplayNode.find("div.optionOperationdiv").append(
			$("<button title='Delete this answer'></button>").attr({
				"id" : id,				
				"name" : "delete",				
				"class" : "iconButtons glyphicon glyphicon-remove",
				"ng-click" : "removOption(this,$event)"
			}));
	


	elementDisplayNode.data().qti["___response"] = function(data) {
		if (QTI.Elements.SimpleChoice.isInteractionChoice(qtiNode,
				elementDisplayNode)) {
			var inputNode = elementDisplayNode.find("#" + id).first();
			if (inputNode.is(':checked')) {
				if (data == undefined) {
					data = [];
				}
				data.push(identifier);
				return data;
			} else {
				return data;
			}
		} else if (QTI.Elements.SimpleChoice.isInteractionOrder(qtiNode,
				elementDisplayNode)) {
			var inputNode = elementDisplayNode.find("#" + id).first();
			if (data == undefined) {
				data = [];
			}
			data.push(identifier);
			return data;
		}
		return data;
	}
}

QTI.Elements.SimpleChoice.onRenderComplete = function(qtiNode, displayNode,
		state) {
	var isAnswer = false;
	if (state) {
		var identifier = displayNode.data().qti.attributes.identifier;
		/*
		 * var responseIdentifier =
		 * QTI.Elements.SimpleChoice.getInteractionResponseIdentifier(undefined,
		 * displayNode);
		 * 
		 * if (responseIdentifier) { for (var answerIdentifier in
		 * state.responses) { if (answerIdentifier == responseIdentifier) { var
		 * answer = state.responses[answerIdentifier];
		 * 
		 * if ($.isArray(answer)) { if ($.inArray(identifier, answer) != -1) {
		 * isAnswer = true; } } else if (answer == identifier) { isAnswer =
		 * true; }
		 * 
		 * if (isAnswer) { displayNode.find("input[value=" + identifier +
		 * "]").first().prop('checked', true) } } } }
		 */
		if (QTI.correctResponse[identifier] == true){
			displayNode.find("span:first-child").css("visibility", "visible");
			displayNode.find("input.editView").attr("checked","true");
		}

	}

	if (state && state.practice) {
		var inputDisplayNode = displayNode.find("input").first();

		var correctIndicatorNode = $("<button></button>").addClass(
				"btn btn-mini btn-success active").attr("type", "button").attr(
				"data-qti-ignore", "true").css({
			"float" : "left",
			"marginRight" : "5px"
		}).append($("<i></i>").addClass("icon-ok").addClass("icon-white"));

		var incorrectIndicatorNode = $("<button></button>").addClass(
				"btn btn-mini btn-danger active").attr("type", "button").attr(
				"data-qti-ignore", "true").css({
			"float" : "left",
			"marginRight" : "5px"
		}).append($("<i></i>").addClass("icon-remove").addClass("icon-white"));

		var orderIndicatorNode = $("<button></button>").addClass(
				"btn btn-mini btn-info active").attr("type", "button").attr(
				"data-qti-ignore", "true").css({
			"float" : "left",
			"marginRight" : "5px"
		});

		correctIndicatorNode.click(function(event) {
			event.stopImmediatePropagation();
			event.preventDefault();
		}).mousedown(function(event) {
			event.stopImmediatePropagation();
			event.preventDefault();
		}).mouseup(function(event) {
			event.stopImmediatePropagation();
			event.preventDefault();
		});

		incorrectIndicatorNode.click(function(event) {
			event.stopImmediatePropagation();
			event.preventDefault();
		}).mousedown(function(event) {
			event.stopImmediatePropagation();
			event.preventDefault();
		}).mouseup(function(event) {
			event.stopImmediatePropagation();
			event.preventDefault();
		});

		orderIndicatorNode.click(function(event) {
			event.stopImmediatePropagation();
			event.preventDefault();
		}).mousedown(function(event) {
			event.stopImmediatePropagation();
			event.preventDefault();
		}).mouseup(function(event) {
			event.stopImmediatePropagation();
			event.preventDefault();
		});

		inputDisplayNode.after(correctIndicatorNode).after(
				incorrectIndicatorNode).after(orderIndicatorNode);
		if (false && QTI.Elements.SimpleChoice
				.isEvaluable(qtiNode, displayNode)) {
			if (QTI.Elements.SimpleChoice.isInteractionChoice(qtiNode,
					displayNode)) {
				orderIndicatorNode.hide();

				if (QTI.Elements.SimpleChoice.isCorrect(qtiNode, displayNode)) {
					correctIndicatorNode.show();
					incorrectIndicatorNode.hide();
				} else {
					correctIndicatorNode.hide();
					incorrectIndicatorNode.show();
				}
			} else if (QTI.Elements.SimpleChoice.isInteractionOrder(qtiNode,
					displayNode)) {
				correctIndicatorNode.hide();
				incorrectIndicatorNode.hide();

				orderIndicatorNode.show();
			}
		} else if (state.correct != undefined && isAnswer) {
			if (state.correct) {
				correctIndicatorNode.show();
				incorrectIndicatorNode.hide();
				orderIndicatorNode.hide();
			} else {
				correctIndicatorNode.hide();
				incorrectIndicatorNode.show();
				orderIndicatorNode.hide();
			}
		} else {
			correctIndicatorNode.hide();
			incorrectIndicatorNode.hide();
			orderIndicatorNode.hide();
		}

	}
}

QTI.Elements.SimpleChoice.getInteraction = function(qtiNode, displayNode) {
	displayNode = $(displayNode);

	var interactionNode = displayNode
			.closest("[data-qti-tag=choiceInteraction], [data-qti-tag=orderInteraction]");

	return interactionNode;
}

QTI.Elements.SimpleChoice.getInteractionResponseIdentifier = function(qtiNode,
		displayNode) {
	displayNode = $(displayNode);

	var interactionNode = displayNode
			.closest("[data-qti-tag=choiceInteraction], [data-qti-tag=orderInteraction]");

	var responseIdentifier = (interactionNode ? interactionNode.data().qti.attributes.responseidentifier
			: undefined);

	return responseIdentifier;
}

QTI.Elements.SimpleChoice.isInteractionChoice = function(qtiNode, displayNode) {
	displayNode = $(displayNode);

	var interactionNode = QTI.Elements.SimpleChoice.getInteraction(qtiNode,
			displayNode);

	return interactionNode.is("[data-qti-tag=choiceInteraction]");
}

QTI.Elements.SimpleChoice.isInteractionOrder = function(qtiNode, displayNode) {
	displayNode = $(displayNode);

	var isEvaluable = false;

	var interactionNode = QTI.Elements.SimpleChoice.getInteraction(qtiNode,
			displayNode);

	return interactionNode.is("[data-qti-tag=orderInteraction]");
}

QTI.Elements.SimpleChoice.isHorizontalInteractionOrder = function(qtiNode,
		displayNode) {
	displayNode = $(displayNode);

	var isEvaluable = false;

	var interactionNode = QTI.Elements.SimpleChoice.getInteraction(qtiNode,
			displayNode);

	return (interactionNode.is("[data-qti-tag=orderInteraction]") && interactionNode
			.is("[data-qti---horizontal-orientation]"));
}

QTI.Elements.SimpleChoice.isEvaluable = function(qtiNode, displayNode) {
	displayNode = $(displayNode);

	var isEvaluable = false;

	var interactionNode = QTI.Elements.SimpleChoice.getInteraction(qtiNode,
			displayNode);

	var identifier = displayNode.data().qti.attributes.identifier;
	var responseIdentifier = (interactionNode ? interactionNode.data().qti.attributes.responseidentifier
			: undefined);

	displayNode
			.closest("[data-qti-tag=assignmentItem]")
			.find("[data-qti-tag=responseDeclaration]")
			.each(
					function(index, responseDeclarationNode) {
						responseDeclarationNode = $(responseDeclarationNode);

						var responseDeclarationIdentifier = responseDeclarationNode
								.data().qti.attributes.identifier;

						if (responseDeclarationIdentifier != undefined
								&& responseIdentifier != undefined
								&& responseDeclarationIdentifier == responseIdentifier) {
							if ($(responseDeclarationNode).find(
									"[data-qti-tag=correctResponse]").length == 1) {
								isEvaluable = true;
							}
						}
					});

	return isEvaluable;
}

QTI.Elements.SimpleChoice.isCorrect = function(qtiNode, displayNode) {
	displayNode = $(displayNode);

	var isCorrect = false;

	var interactionNode = QTI.Elements.SimpleChoice.getInteraction(qtiNode,
			displayNode);

	var identifier = displayNode.data().qti.attributes.identifier;
	var responseIdentifier = (interactionNode ? interactionNode.data().qti.attributes.responseidentifier
			: undefined);

	displayNode
			.closest("[data-qti-tag=assignmentItem]")
			.find("[data-qti-tag=responseDeclaration]")
			.each(
					function(index, responseDeclarationNode) {
						responseDeclarationNode = $(responseDeclarationNode);

						var responseDeclarationIdentifier = responseDeclarationNode
								.data().qti.attributes.identifier;

						if (responseDeclarationIdentifier != undefined
								&& responseIdentifier != undefined
								&& responseDeclarationIdentifier == responseIdentifier) {
							$(responseDeclarationNode).find(
									"[data-qti-tag=correctResponse]").first()
									.find("[data-qti-tag=value]")
									.each(function(index, valueNode) {
										valueNode = $(valueNode);

										if (valueNode.text() == identifier) {
											isCorrect = true;
										}
									});
						}
					});

	return isCorrect;
}

QTI.Elements.SimpleChoice.getOrder = function(qtiNode, displayNode) {
	displayNode = $(displayNode);

	if (!QTI.Elements.SimpleChoice.isInteractionOrder(qtiNode, displayNode)
			|| !QTI.Elements.SimpleChoice.isEvaluable(qtiNode, displayNode)) {
		return undefined;
	}

	var orderData = {
		"values" : [],
		"index" : undefined,
		"correctResponseNode" : undefined,
		"valueNode" : undefined
	};

	var interactionNode = QTI.Elements.SimpleChoice.getInteraction(qtiNode,
			displayNode);

	var identifier = displayNode.data().qti.attributes.identifier;
	var responseIdentifier = (interactionNode ? interactionNode.data().qti.attributes.responseidentifier
			: undefined);

	displayNode
			.closest("[data-qti-tag=assignmentItem]")
			.find("[data-qti-tag=responseDeclaration]")
			.each(
					function(index, responseDeclarationNode) {
						responseDeclarationNode = $(responseDeclarationNode);

						var responseDeclarationIdentifier = responseDeclarationNode
								.data().qti.attributes.identifier;

						if (responseDeclarationIdentifier != undefined
								&& responseIdentifier != undefined
								&& responseDeclarationIdentifier == responseIdentifier) {
							var valueIndex = 0;
							var correctResponseNode = $($(
									responseDeclarationNode).find(
									"[data-qti-tag=correctResponse]").first());
							orderData.correctResponseNode = correctResponseNode;
							correctResponseNode
									.find("[data-qti-tag=value]")
									.each(
											function(index, valueNode) {
												valueNode = $(valueNode);

												orderData.values.push(valueNode
														.text());

												if (valueNode.text() == identifier
														&& orderData.index == undefined) {
													orderData.index = valueIndex;
													orderData.valueNode = valueNode;
												}

												valueIndex++;
											});
						}
					});

	return orderData;
}

// span

QTI.Elements.Span = {};

QTI.Elements.Span.NAME = "Span";
QTI.Elements.Span.TAG = "span";

QTI.Elements.Span.CLASS = QTI.Classes.SimpleInline;

QTI.Elements.Span.MARKUP = "<span></span>";

QTI.Elements.Span.GET_ALLOWED_CONTENT = function() {
	return [];
}

QTI.Elements.Span.play = function(qtiNode, displayNode, state) {
	var elementDisplayNode = QTI.prepare(qtiNode, $(QTI.Elements.Span.MARKUP));

	$(displayNode).append(elementDisplayNode);

	this.extend.play(qtiNode, elementDisplayNode, state);
	this.processChildren(qtiNode, elementDisplayNode, state);
}

// font

QTI.Elements.Font = {};

QTI.Elements.Font.NAME = "Font";
QTI.Elements.Font.TAG = "font";

QTI.Elements.Font.CLASS = QTI.Classes.SimpleInline;

QTI.Elements.Font.MARKUP = "<font></font>";

QTI.Elements.Font.GET_ALLOWED_CONTENT = function() {
	return [];
}

QTI.Elements.Font.play = function(qtiNode, displayNode, state) {
	var elementDisplayNode = QTI.prepare(qtiNode, $(QTI.Elements.Font.MARKUP));

	$(displayNode).append(elementDisplayNode);

	this.extend.play(qtiNode, elementDisplayNode, state);
	this.processChildren(qtiNode, elementDisplayNode, state);
}

// text entry interaction

QTI.Elements.TextEntryInteraction = {};

QTI.Elements.TextEntryInteraction.NAME = "Text Entry Interaction";
QTI.Elements.TextEntryInteraction.TAG = "textEntryInteraction";

QTI.Elements.TextEntryInteraction.CLASS = [ QTI.Classes.InlineInteraction,
		QTI.Classes.StringInteraction ]

QTI.Elements.TextEntryInteraction.GET_ALLOWED_CONTENT = function() {
	return [];
}

QTI.Elements.TextEntryInteraction.play = function(qtiNode, displayNode, state) {
	var elementDisplayNode = QTI.prepare(qtiNode, $("<div></div>"));

	elementDisplayNode.css({
		"display" : "inline-block"
	});

	var placeholder = qtiNode.attr("placeholdertext");
	var pattern = qtiNode.attr("patternmask");

	var contentsDisplayNode = $("<span class='blank'> _____________________ </span>")

	elementDisplayNode.append(contentsDisplayNode);

	$(displayNode).append(elementDisplayNode);

	this.extend.play(qtiNode, elementDisplayNode, state);
	this.processChildren(qtiNode, contentsDisplayNode, state);

	elementDisplayNode.data().qti.response = function(responses) {
		var responseIdentifier = elementDisplayNode.data().qti
				.attribute("responseidentifier");

		if (responses[responseIdentifier] == undefined) {
			responses[responseIdentifier] = [];
		}
		responses[responseIdentifier].push(contentsDisplayNode.val());
	};
}

QTI.Elements.TextEntryInteraction.isEvaluable = function(qtiNode, displayNode) {
	displayNode = $(displayNode);

	var isEvaluable = false;

	var responseIdentifier = displayNode.data().qti.attributes.responseidentifier;

	displayNode
			.closest("[data-qti-tag=assignmentItem]")
			.find("[data-qti-tag=responseDeclaration]")
			.each(
					function(index, responseDeclarationNode) {
						responseDeclarationNode = $(responseDeclarationNode);

						var responseDeclarationIdentifier = responseDeclarationNode
								.data().qti.attributes.identifier;

						if (responseDeclarationIdentifier != undefined
								&& responseIdentifier != undefined
								&& responseDeclarationIdentifier == responseIdentifier) {
							if ($(responseDeclarationNode).find(
									"[data-qti-tag=correctResponse]").length == 1) {
								isEvaluable = true;
							}
						}
					});

	return isEvaluable;
}

// value

QTI.Elements.Value = {};

QTI.Elements.Value.NAME = "Value";
QTI.Elements.Value.TAG = "value";

QTI.Elements.Value.DISPLAY = false;

QTI.Elements.Value.GET_ALLOWED_CONTENT = function() {
	return [];
}

QTI.Elements.Value.play = function(qtiNode, displayNode, state) {
	this.DISPLAY = CustomQuestionTemplate[state.questionType].DISPLAY;
	var elementDisplayNode = QTI.prepare(qtiNode, $("<div contenteditable='true' class='valueView editView editablediv'></div>"));

	$(displayNode).append(elementDisplayNode);

	var matchText;
/*	if(qtiNode.get(0).innerHTML.indexOf("<![CDATA[") > -1)
	{
		elementDisplayNode.html(qtiNode.eq(0).get(0).childNodes[0].textContent);
	}
	else{*/
		this.extend.play(qtiNode, elementDisplayNode, state);
		this.processChildren(qtiNode, elementDisplayNode, state);
/*	}*/
	CustomQuestionTemplate[state.questionType].makeExtra(elementDisplayNode,this,null);
}

// Inline Choice Interaction

QTI.Elements.InlineChoiceInteraction = {};

QTI.Elements.InlineChoiceInteraction.NAME = "InlineChoiceInteraction";
QTI.Elements.InlineChoiceInteraction.TAG = "inlineChoiceInteraction";

QTI.Elements.InlineChoiceInteraction.GET_ALLOWED_CONTENT = function() {
	return [];
}

QTI.Elements.InlineChoiceInteraction.play = function(qtiNode, displayNode,
		state) {


	var inrText=$(displayNode)[0].innerText;

	$(displayNode)[0].innerText="";

		var elementDisplayNode = QTI.prepare(qtiNode,
				$("<div class='matchRight printView'></div>"));
		
		displayNode.prepend("<div  class='printView indChar' style='float:left'>"
				+ matchIndex[qtiNode.attr("responseIdentifier").substring(9)]
				+ "</div>")
				
			
		$(displayNode).append(elementDisplayNode);
		
		var matchOptionsIndex = $("<label class='matchIndex' ></label>");
		matchOptionsIndex.append(matchIndex[qtiNode.attr("responseIdentifier")
		        			  				.substring(9)]	);
		elementDisplayNode.append(matchOptionsIndex);
		
	
				
		qtiNode = qtiNode.find("inlineChoice:nth-child("
				+ qtiNode.attr("responseIdentifier").substring(9) + ") ");
		
		var matchText;
/*		if(qtiNode.get(0).innerHTML.indexOf("<![CDATA[") > -1)
			matchText = qtiNode.eq(0).get(0).childNodes[0].textContent;
		else*/
			matchText = qtiNode.get(0).innerHTML;
		
		
		
		this.extend.play(qtiNode, elementDisplayNode, state);
		this.processChildren(qtiNode, elementDisplayNode, state);
		
		if(qtiNode.get(0).innerHTML!=""){
				
				
				var	contentsDisplayNodeImage = $("<label class='matchOptionImage'></label>").attr({	  				
		  				"data---qti-content-container" : "true"
		  			});
  	
					contentsDisplayNodeImage.append(matchText);
			  		
			  		$(elementDisplayNode).append(contentsDisplayNodeImage);
			  		matchText=QTI.replaceImage($(contentsDisplayNodeImage));	


	  		}
		
		
		var optionsMaindiv = $(
		"<div class='optionsMaindiv editView' ></div>")
		.attr({			
			"class":'optionsMaindiv editView'				
		});
		$(displayNode).append(optionsMaindiv);
		
		
		$(displayNode).find("div.optionsMaindiv").append(
				$("<div></div>").attr({			
					"class" : "matchOptionMaindiv mainOptionEditablediv qti-simpleChoice"
						
				}));
		
		$(displayNode).find("div.matchOptionMaindiv").append($("<div></div>").attr({			
			"class" : "matchOptionIndexdiv"
		}));	
		
		$(displayNode).find("div.matchOptionMaindiv").append(
		$("<div></div>").attr({			
			"class" : "matchOptionTextEditablediv editView",
			"contenteditable" : "true",
			"data---qti-content-container" : "true",
			"id":"simpleChoice_Matching"
		}));
		
		$(displayNode).find("div.matchOptionMaindiv").append(
				$("<div></div>").attr({			
					"class" : "matchOptionOperation"				
				}));	

		
		$(displayNode).find("div.matchOptionOperation").append(
				$("<button title='Upload picture'></button>").attr({						
					"name" : "image",				
					"class" : "iconButtons glyphicon glyphicon-picture",
					"ng-click" : "addImage(this,$event,'div.qti-simpleChoice')"
				}));

		QTI.BLOCKQUOTE.generateId();
		var BLOCKQUOTE_ID = QTI.BLOCKQUOTE.getId();
		var blockQuoteVAL=CustomQuestionTemplate[state.questionType].printOption + " "+ BLOCKQUOTE_ID + "__";
		var blockQuoteVAL_edit=CustomQuestionTemplate[state.questionType].editOption_Column_B.replace("A", "A"+BLOCKQUOTE_ID);
		
		$(displayNode).find("div.matchOptionIndexdiv").append("B"+BLOCKQUOTE_ID);

		
		
	if(state.templateQstn&&(matchText=="")){
		$(displayNode).find("div.matchOptionTextEditablediv").attr("data-placeholder",blockQuoteVAL_edit);
		$(elementDisplayNode).append('Match');		
	}else{
		$(displayNode).find("div.matchOptionTextEditablediv").attr("data-placeholder",blockQuoteVAL_edit);
		$(displayNode).find("div.matchOptionTextEditablediv").html(matchText);
	}

	
	
}

QTI.customize = function(xml) {
	xml.find("choiceInteraction").attr("shuffle", "false");
	$.each(xml.find("simpleChoice"), function(i, ele) {
		ele.setAttribute("index", indexResponse[i]);
	});
	if (xml.find("mapping").length == 1) {
		var scores = xml.find("mapEntry[mappedValue='1']");
		$.each(scores, function() {
			QTI.correctResponse[$(this).attr("mapKey")] = true;
		})
	} else {
		var scores = xml.find("responseProcessing").find(
				"setOutcomeValue[identifier='SCORE']");
		$.each(scores, function() {
			if (parseInt(this.textContent) > 0)
				QTI.correctResponse[$(this).prev().text()] = true;
		})
	}
}

QTI.correctResponse = {};

var indexResponse = [ "A) ", "B) ", "C) ", "D) ", "E) ","F) ","G) ","H) ","I) ", "J) ","K) ","L) ","M) "];

var matchIndex = {
		"1" : "A) ",
		"2" : "B) ",
		"3" : "C) ",
		"4" : "D) ",
		"5" : "E) ",
		"6" : "F) ",
		"7" : "G) ",
		"8" : "H) "
	}


var CustomQuestionTemplate = 						
{
		 
		 "MultipleChoice":
						 {"printCaption": "Multiple Choice Question" ,
						  "editCaption": "Enter Multiple Choice Question",
						  "printOption": "Answer Choice" ,
						  "editOption": "Enter Answer",
						  "editMainText":"Enter Text & Select Correct Answer",
						  "DISPLAY": false,
							 makeExtra: function(element,tag,xml){}}	
		,
		
		"TrueFalse":
						{"printCaption": "True/False Question" ,
						  "editCaption": "Enter True or False Question",
						  "printOption": "True",
						  "editOption":  "True" ,						  
						  "editMainText":"Enter Text & Select Correct Answer",
						  "DISPLAY": false,
							 makeExtra: function(element,tag,xml){}}
		,
		
		"MultipleResponse":	
						{"printCaption": "Multiple Response Question" ,
						  "editCaption": "Enter Multiple Response Question",
						 "printOption": "Answer Choice" ,
						 "editOption": "Enter Answer",
						 "editMainText":"Enter Text & Select Correct Answer",
						 "DISPLAY": false,
						 makeExtra: function(element,tag,xml){}}
		,
		
		"Matching":	
						{"printCaption": "Matching Question" ,
						  "editCaption": "Enter Matching Question",
						 "printOption": "Option" ,
						 "editOption_Column_A": "Enter item # in column ",
						 "editOption_Column_B": "Enter match in column B for A",
						 "editMainText":"Enter Column A Items and Correct Column B Match System will scramble Column B in Print View",
						 "DISPLAY": false,
						 makeExtra: function(element,tag,xml){}}
		,
		"Essay":	
						{"printCaption": "Essay Question" ,
						  "editCaption": "Enter Essay Question",
						 "printOption": "Recommended Answer" ,
						 "editOption": "Enter Essay Recommended Answer",
						 "editMainText":"Enter Essay Question",
						 "DISPLAY": true,
						 makeExtra : function(element,tag,xml){
							 	switch(tag.TAG){
							 	case "value":
									if(element.html() == ""){
										element.attr("data-placeholder",this.editOption)
									}
									$("<div class = 'editView EssayHeader'>Recommended Answer</div>").insertBefore(element);
									break;
							 	case "responseDeclaration":
							 		if(xml.find("correctResponse").length == 0)
							 			xml.append("<correctResponse><value></value></correctResponse>");
							 		tag.DISPLAY = true;
							 	}

						 }}		
				}

QTI.getCaretPosition = function(element){
	var ie = (typeof document.selection != "undefined" && document.selection.type != "Control") && true;
	var w3 = (typeof window.getSelection != "undefined") && true;
    var caretOffset = 0;
    if (w3) {
    	if(window.getSelection().type == "None")
			return 0;
        var range = window.getSelection().getRangeAt(0);
        var preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
    } else if (ie) {
        var textRange = document.selection.createRange();
        var preCaretTextRange = document.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
}

QTI.replaceImage = function(qtiNode){
	var qtiNodeHTML;
/*	if(qtiNode.get(0).innerHTML.indexOf("<![CDATA[") > -1)
		qtiNodeHTML = qtiNode.eq(0).get(0).childNodes[0].textContent;
	else*/
		qtiNodeHTML = qtiNode.html();
	var images = qtiNode.find("img");
	images.each(function(){
		var url = $(this).attr("src");
		var splittedUrl = url.split("/")
		fileName = splittedUrl[splittedUrl.length - 1]
		fileName = fileName.split("?")[0]
		qtiNodeHTML = qtiNodeHTML.replace($(this).get(0).outerHTML,"<u contenteditable='false' url='" + url + "'><i>" + fileName + "</i></u>")
	})
	return qtiNodeHTML;
}

QTI.getActualCursorPosition = function(cursorPosition,element){
	var images = element.find("u[contenteditable=false]");
	var actualLenght;
	var actualText;
	images.each(function(){
		if(actualText == null)
			actualText = element.html().substring(0,element.html().indexOf($(this).get(0).outerHTML)) + $(this).text();
		else
			actualText = actualText + element.html().substring(actualText.length,element.html().indexOf($(this).get(0).outerHTML)) + $(this).text();
		if(cursorPosition >= actualText.length)
		{
			cursorPosition = cursorPosition + $(this).get(0).outerHTML.length - $(this).text().length;
			return cursorPosition;
		}
	})
	return cursorPosition;
} 
QTI.reorderElements = function(state,displayNode){	
	if(state.questionType == 'Essay'){
		var qtiDeclare = $(displayNode).find("div.qti-responseDeclaration");
		var qtiItemBody = $(displayNode).find("div.qti-itemBody");
		qtiDeclare.insertAfter(qtiItemBody);
	}
	
}

QTI.getQuestionType = function(qtiXML,questionType){
	if(questionType)
		return questionType;
	if(QTI.format(qtiXML).find("extendedTextInteraction").length > 0){
		return "Essay";
	}else if(QTI.format(qtiXML).find("inlineChoiceInteraction").length > 0){
		return "Matching";
	}
}
QTI.getQuizType = function(quiztype){
	switch(quiztype){
	case "Essay":
			return "6";
			break;
	case "MultipleResponse":
			return "5";
			break;
	case "TrueFalse":
			return "4";
			break;
	case "MultipleChoice":
			return "3";
			break;
		
	}
}

QTI.getContent = function(elm){
/*	if(elm.html().indexOf("<![CDATA[") == 0){
		return elm.text();
	}
	else{*/
		return elm.html();
/*	}*/
}
QTI.setContent = function(elm,val){
//	elm.html("<![CDATA[" + val + "]]>")
	elm.html(val);
}
QTI.prependContent = function(elm,val){
/*	if(elm.html().indexOf("<![CDATA[") == 0){
		elm.get(0).childNodes[0].textContent = val;
	}
	else{*/
		elm.prepend(val);
/*	}*/
	
}