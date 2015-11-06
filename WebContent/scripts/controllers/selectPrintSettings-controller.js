'use strict';

angular

.module('e8SelectPrintSettings', ["checklist-model"])

.controller(
		'SelectPrintSettingsController',
		[
		 '$scope',
		 '$location',
		 '$routeParams',
		 '$http',
		 function($scope, $location, $routeParams, $http) {
			 
			 var selectDropdownItem = function(dropdown, selectedVal) {
				 for(var i=0;i<dropdown.options.length;i++){
					 if (dropdown.options[i].value == selectedVal) {
						 dropdown.selectedIndex = i;
						 break;
					 }
				 }
			 }
			 
			 HttpService.get(evalu8config.apiUrl + '/settings/printsettings')
			 .success(function(response) {
				 $scope.userpref = response;

				 // select top margin element
				 selectDropdownItem(lstTop, $scope.userpref.topMargin);

				 // select bottom margin element
				 selectDropdownItem(lstBottom, $scope.userpref.bottomMargin);

				 // select left margin element
				 selectDropdownItem(lstLeft, $scope.userpref.leftMargin);				 
			 
				 // select right margin element
				 selectDropdownItem(lstRight, $scope.userpref.rightMargin);				 

				 // select header space element
				 selectDropdownItem(lstHeader, $scope.userpref.headerSpace);				 

				 // select footer space element
				 selectDropdownItem(lstFooter, $scope.userpref.footerSpace);				 

				 // select font element
				 selectDropdownItem(lstFontStyle, $scope.userpref.font);				 
	
				 // select font element
				 selectDropdownItem(lstPointSize, $scope.userpref.fontSize);	
				 
				 if($scope.userpref.multipleVersions) {
					 document.getElementById("chkmultipleversion").checked = true;
					 document.getElementById("txtNoOfVersions").value = $scope.userpref.numberOfVersions;
					 selectDropdownItem(scrambleOrder, $scope.userpref.scrambleOrder);
				 }
				 else {
					 document.getElementById("txtNoOfVersions").disabled = true;
					 document.getElementById("scrambleOrder").disabled = true;					 
					 document.getElementById("txtNoOfVersions").value = 1; 
				 }
				 
				 if($scope.userpref.includeAreaForStudentResponse) {
					 document.getElementById("includeAreaForStudentResponse").checked = true;
					 document.getElementById("leftSide").disabled = false;
					 document.getElementById("lastPage").disabled = false;
					 if($scope.userpref.leftSide) {
						 document.getElementById("leftSide").checked = true;
						 document.getElementById("lastPage").checked = false;
					 }					 
					 if($scope.userpref.lastPage) {
						 document.getElementById("leftSide").checked = false;
						 document.getElementById("lastPage").checked = true;
					 }
				 }
				 
				 if($scope.userpref.includeAnswerKeyIn) {
					 document.getElementById("includeAnswerKeyIn").checked = true;
					 document.getElementById("sameFile").disabled = false;
					 document.getElementById("seperateFile").disabled = false;
					 document.getElementById("includeAnwserFeedback").disabled = false;
					 document.getElementById("includeQuestionHints").disabled = false;
					 if($scope.userpref.sameFile) {
						 document.getElementById("sameFile").checked = true;
						 document.getElementById("seperateFile").checked = false;
					 }
					 if($scope.userpref.seperateFile) {
						 document.getElementById("sameFile").checked = false;
						 document.getElementById("seperateFile").checked = true;
					 }	
					 if($scope.userpref.includeAnwserFeedback)
						 document.getElementById("includeAnwserFeedback").checked = true;
					 if($scope.userpref.includeQuestionHints)
						 document.getElementById("includeQuestionHints").checked = true;					 
					 
				 }
				 				 
			 })
			 
			 $scope.clickMultipleVersions = function() {
				 if(document.getElementById("chkmultipleversion").checked) {
					 document.getElementById("txtNoOfVersions").disabled = false;
					 document.getElementById("scrambleOrder").disabled = false;					 
				 }
				 else {
					 document.getElementById("txtNoOfVersions").disabled = true;
					 document.getElementById("scrambleOrder").disabled = true;
				 }
			 }
			 
			 $scope.clickIncludeAreaForStudentResponse = function() {
				 if(document.getElementById("includeAreaForStudentResponse").checked) {
					 document.getElementById("leftSide").disabled = false;
					 document.getElementById("lastPage").disabled = false;					 
				 }
				 else {
					 document.getElementById("leftSide").disabled = true;
					 document.getElementById("lastPage").disabled = true;
				 }
			 }
			 
			 $scope.clickIncludeAnswerKeyIn = function() {
				 if(document.getElementById("includeAnswerKeyIn").checked) {
					 document.getElementById("sameFile").disabled = false;
					 document.getElementById("seperateFile").disabled = false;
					 document.getElementById("includeAnwserFeedback").disabled = false;
					 document.getElementById("includeQuestionHints").disabled = false;						 
				 }
				 else {
					 document.getElementById("sameFile").disabled = true;
					 document.getElementById("seperateFile").disabled = true;
					 document.getElementById("includeAnwserFeedback").disabled = true;
					 document.getElementById("includeQuestionHints").disabled = true;					 
				 }
			 }
			 

			 $scope.savePref = function() {								 

				 var preference = {
						 "multipleVersions" : document.getElementById("chkmultipleversion").checked,
						 "numberOfVersions" : document.getElementById("txtNoOfVersions").value,
						 "scrambleOrder" : scrambleOrder.item(scrambleOrder.selectedIndex).text,
						 "includeAreaForStudentResponse" : document.getElementById("includeAreaForStudentResponse").checked,
						 "leftSide" : document.getElementById("leftSide").checked,
						 "lastPage" : document.getElementById("lastPage").checked,
						 "includeAnswerKeyIn" : document.getElementById("includeAnswerKeyIn").checked,
						 "sameFile" : document.getElementById("sameFile").checked,
						 "seperateFile" : document.getElementById("seperateFile").checked,
						 "includeAnwserFeedback" : document.getElementById("includeAnwserFeedback").checked,
						 "includeQuestionHints" : document.getElementById("includeQuestionHints").checked,
						 "topMargin" : lstTop.item(lstTop.selectedIndex).text,
						 "bottomMargin" : lstBottom.item(lstBottom.selectedIndex).text,
						 "leftMargin" : lstLeft.item(lstLeft.selectedIndex).text,
						 "rightMargin" : lstRight.item(lstRight.selectedIndex).text,
						 "headerSpace" : lstHeader.item(lstHeader.selectedIndex).text,
						 "footerSpace" : lstFooter.item(lstFooter.selectedIndex).text,
						 "font" : lstFontStyle.item(lstFontStyle.selectedIndex).text,
						 "fontSize" : lstPointSize.item(lstPointSize.selectedIndex).text,
						 "includeWorkSpace" : $scope.userpref.includeWorkSpace
				 }; 

				 HttpService.post(evalu8config.apiUrl + '/settings/printsettings', preference)
				 .success(function(response) {
					 document.getElementById("divSaveMessage").innerHTML = "<span style='color:green'>Settings saved successfully</span>";
				 })
				 .error(function(error, status) {
					 document.getElementById("divSaveMessage").innerText = error.message;
					 if(status == 403)
						 $location.path('/login');
				 })

			 };
		 } ]);