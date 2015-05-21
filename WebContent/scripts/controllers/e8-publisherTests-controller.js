'use strict';
 
angular.module('e8PublisherTests')

.controller('PublisherTestsController',
    ['$scope', '$rootScope', '$location', '$cookieStore', '$http', '$sce', 'DisciplineService',
    function ($scope, $rootScope, $location, $cookieStore, $http, $sce, DisciplineService) {    			
    	
    	$rootScope.globals = $cookieStore.get('globals') || {};
		var config = {
				headers : {
					'x-authorization' : $rootScope.globals.authToken,
					'Accept' : 'application/json;odata=verbose'
				}
			};

    	//Fetch user disciplines and populate the drop down			
		DisciplineService.userDisciplines(function(userDisciplines) {
			
			$scope.disciplines = userDisciplines;
			
			DisciplineService.disciplineDropdownOptions(userDisciplines, "Publisher Tests", function(disciplinesOptions, selectedValue) {
				
				$scope.disciplinesOptions = disciplinesOptions;
				$scope.selectedValue = selectedValue;	
			});
		});

    	
    	$scope.disciplineFilterChange = function(option) {
    		
    		$scope.disciplines = DisciplineService.disciplineDropdownChange(option);	  		    			
    	}
    	
    	function toBinaryString(data) {
    	    var ret = [];
    	    var len = data.length;
    	    var byte;
    	    for (var i = 0; i < len; i++) { 
    	        byte=( data.charCodeAt(i) & 0xFF )>>> 0;
    	        ret.push( String.fromCharCode(byte) );
    	    }

    	    return ret.join('');
    	}
    	//Temparory code to print doc
    	$scope.printDOC = function(guid){
			var config1 = {
					headers : {
						'x-authorization' : $rootScope.globals.authToken,
						'Accept' : 'application/word'
					}
				};
				
				var ep = evalu8config.apiUrl + "/tests/"+ guid +"/download/doc?option=QUESTIONS"
				
				var xhr = new XMLHttpRequest;
				xhr.addEventListener( "load", function(){
				    var data = toBinaryString(this.responseText);
				    data = "data:application/msword;base64,"+btoa(data);
				    document.location = data;
				}, false);

				xhr.overrideMimeType( "application/msword; charset=x-user-defined;" );
				xhr.open( "GET", ep );
				xhr.setRequestHeader("x-authorization", $rootScope.globals.authToken);
				xhr.send(null);
    	}
    	
    	$scope.printANSSame = function(guid){
			var config1 = {
					headers : {
						'x-authorization' : $rootScope.globals.authToken,
						'Accept' : 'application/word'
					}
				};
				
				var ep = evalu8config.apiUrl + "/tests/"+ guid +"/download/doc?option=QUESTIONSANDANSWERKEYS"
				
				var xhr = new XMLHttpRequest;
				xhr.addEventListener( "load", function(){
				    var data = toBinaryString(this.responseText);
				    data = "data:application/msword;base64,"+btoa(data);
				    document.location = data;
				}, false);

				xhr.overrideMimeType( "application/msword; charset=x-user-defined;" );
				xhr.open( "GET", ep );
				xhr.setRequestHeader("x-authorization", $rootScope.globals.authToken);
				xhr.send(null);
    	}
    	
    	//Temparory code to print answer keys
    	$scope.printANS = function(guid){
			var config1 = {
					headers : {
						'x-authorization' : $rootScope.globals.authToken,
						'Accept' : 'application/word'
					}
				};
				
				var ep = evalu8config.apiUrl + "/tests/"+ guid +"/download/doc?option=ANSWERKEYS"
				
				var xhr = new XMLHttpRequest;
				xhr.addEventListener( "load", function(){
				    var data = toBinaryString(this.responseText);
				    data = "data:application/msword;base64,"+btoa(data);
				    document.location = data;
				}, false);

				xhr.overrideMimeType( "application/msword; charset=x-user-defined;" );
				xhr.open( "GET", ep );
				xhr.setRequestHeader("x-authorization", $rootScope.globals.authToken);
				xhr.send(null);
    	}
    	
    	//Temparory code to print pdf
    	$scope.printPDF = function(guid){
			var config1 = {
					headers : {
						'x-authorization' : $rootScope.globals.authToken,
						'Accept' : 'application/pdf'
					}
				};
				
				var ep = evalu8config.apiUrl + "/tests/"+ guid +"/download/pdf?option=QUESTIONS"
				
				var xhr = new XMLHttpRequest;
				xhr.addEventListener( "load", function(){
				    var data = toBinaryString(this.responseText);
				    data = "data:application/pdf;base64,"+btoa(data);
				    document.location = data;
				}, false);

				xhr.overrideMimeType( "application/pdf; charset=x-user-defined;" );
				xhr.open( "GET", ep );
				xhr.setRequestHeader("x-authorization", $rootScope.globals.authToken);
				xhr.send(null);
    	}
    	
    	//Temparory code to print pdf
    	$scope.printPDFANSSame = function(guid){
			var config1 = {
					headers : {
						'x-authorization' : $rootScope.globals.authToken,
						'Accept' : 'application/pdf'
					}
				};
				
				var ep = evalu8config.apiUrl + "/tests/"+ guid +"/download/pdf?option=QUESTIONSANDANSWERKEYS"
				
				var xhr = new XMLHttpRequest;
				xhr.addEventListener( "load", function(){
				    var data = toBinaryString(this.responseText);
				    data = "data:application/pdf;base64,"+btoa(data);
				    document.location = data;
				}, false);

				xhr.overrideMimeType( "application/pdf; charset=x-user-defined;" );
				xhr.open( "GET", ep );
				xhr.setRequestHeader("x-authorization", $rootScope.globals.authToken);
				xhr.send(null);
    	}
    	
    	//Temparory code to print pdf answer key
    	$scope.printPDFANS = function(guid){
			var config1 = {
					headers : {
						'x-authorization' : $rootScope.globals.authToken,
						'Accept' : 'application/pdf'
					}
				};
				
				var ep = evalu8config.apiUrl + "/tests/"+ guid +"/download/pdf?option=ANSWERKEYS"
				
				var xhr = new XMLHttpRequest;
				xhr.addEventListener( "load", function(){
				    var data = toBinaryString(this.responseText);
				    data = "data:application/pdf;base64,"+btoa(data);
				    document.location = data;
				}, false);

				xhr.overrideMimeType( "application/pdf; charset=x-user-defined;" );
				xhr.open( "GET", ep );
				xhr.setRequestHeader("x-authorization", $rootScope.globals.authToken);
				xhr.send(null);
    	}
    	//To get books for the given discipline.
    	//This method will call the api mytest/books?discipline to get the books
    	//and append the collection to input discipline angularjs node
    	$scope.getBooks = function(discipline){
    		if ($rootScope.globals.authToken == '') {
    			$location.path('/login');
    		} else {
    		
    			if (!discipline.collapsed) {    				
    				discipline.collapse();
				} 
				else{
					discipline.expand();
					
					var ep = evalu8config.apiUrl + "/books?discipline=" + discipline.node.item;	    				    		

					$http.get(ep, config).success(
							function(response) {
								discipline.node.nodes = response;
							});		
				}
    		}
    	}
    	
    	//To get the Chapters for the given book
    	//This method will call the api mytest/books/{bookid}/nodes.
    	//Output collection will be append to input book angularjs node.
    	$scope.getTests = function(book){
    		$scope.bookID = book.node.guid;
    		if ($rootScope.globals.authToken == '') {
    			$location.path('/login');
    		} else {
				if (!book.collapsed) {
					book.collapse();
				} 
				else{
					book.expand();
	    		
					$http.get(
							evalu8config.apiUrl + "/books/"
									+ book.node.guid
									+ "/tests", config).success(
							function(response) {
								book.node.nodes = response;
							});
				}
    		}
    	}
    	
    	//To get the topics, subtopics, question for the given chapter.
    	//This method will call the api mytest/books/{bookid}/nodes/{nodeid}/nodes
    	//and mytest/books/{bookid}/nodes/{nodeid}/questions.
    	//Output topic,subtopic and question collection will be append to input chapter angularjs node
    	$scope.getTest = function(currentNode){
    		if ($rootScope.globals.authToken == '') {
    			$location.path('/login');
    		} else {
				if (!currentNode.collapsed) {
					currentNode.collapse();
					$(currentNode.$element).find(".captiondiv").removeClass('iconsChapterVisible');
					currentNode.$element.children(1).removeClass('expandChapter');	
					currentNode.$element.find("input").attr("src", "images/right_arrow2.png");
				} 
				else{
					currentNode.expand();
					currentNode.$element.find("input").attr("src", "images/down_arrow.png");
	    			currentNode.node.nodes = [];
					$http
					.get(
							currentNode.node["@id"], config)
					.success(
							function(response) {
								$(currentNode.$element).find(".captiondiv").addClass('iconsChapterVisible');
								currentNode.$element.children(0).addClass('expandChapter');	
								$scope
										.renderTest(
												response,
												currentNode.node.title, currentNode);
							});
	

				}
    		}
    	}
    	$scope.renderTest = function(response, title, currentNode) {

    		$scope.testQuestions = [];
    		$scope.questionsCount = response.assignmentContents.binding.length;
    		$scope.successQuestionCount = 0;
    		    		
        	//qti player initialisation
    		var bindings = response.assignmentContents.binding;
        	QTI.initialize();  
        	var bindingsIndex = 0;
        	var displayNodes = [];
        	displayNodes[bindings.length - 1] = undefined;
    		angular
    		.forEach(
    				response.assignmentContents.binding,
    				function(item) {
    					$http
    					.get(
    							item.boundActivity,
    							config)
    							.success(
    									function(
    											response) {
    										var displayNode = $("<div></div>")
    										QTI
    										.play(
    												response,
    												displayNode
    												);
    										 
    										var url = arguments[3].url.split('/');
    										var qId = url[url.length - 1];
    										
    										for (var i = 0; i < bindings.length; i++) {
    										    if (bindings[i]['guid'] === qId) {
    										        displayNodes[bindings[i].bindingIndex] = displayNode;
    										        break;
    										    }
    										}
    										bindingsIndex++;
    										if (bindingsIndex == bindings.length) {    										    
    										    for (var i = 0; i < displayNodes.length; i++) {
    										        currentNode.node.nodes = currentNode.node.nodes.concat(displayNodes[i]);
    										    }
    										}
    									})

    				})

    	}		    	
		
		//Rendering the question as html
		$scope.getHTML = function(datanode) {
			return $sce.trustAsHtml(datanode.node.html());
		}
		
    }]);