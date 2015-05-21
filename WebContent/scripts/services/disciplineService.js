'use strict';

angular.module('evalu8Demo')

.service('DisciplineService', 
		['$http', '$rootScope', '$cookieStore', 
		 function($http, $rootScope, $cookieStore) {
			
			$rootScope.globals = $cookieStore.get('globals') || {};
			var config = {
					headers : {
						'x-authorization' : $rootScope.globals.authToken,
						'Accept' : 'application/json;odata=verbose'
					}
			};
			
			this.allDisciplines = function() {
				
				var allDisciplines = [];
				$http.get(
						evalu8config.apiUrl + "/disciplines/", config)
						.success(
								function(response) {
									
									response.forEach (function(item) {    							
										allDisciplines.push(item);    							    							
									});									
								});
				return allDisciplines;
			};
			
			this.userDisciplines = function(callback) {				

				var userDisciplines = [];
				$http.get(
						evalu8config.apiUrl + "/settings/disciplines/", config)
						.success(
								function(response) {
									
									response.forEach (function(item) {    							
										userDisciplines.push({"item": item});    							    							
									});
									callback (userDisciplines);
								})
						.error(
								function() {
									callback (userDisciplines);
								});
				
			};
			
			this.disciplineDropdownOptions = function(userDisciplines, optionSuffixText, callback) {				
					
					var selectedDisciplines = "";
					var responseOptions = [];

					userDisciplines.forEach (function(discipline) {

						responseOptions.push ({text: "All " + discipline.item + " " + optionSuffixText, value: discipline.item});
						selectedDisciplines += discipline.item + "::";

					});
					
					selectedDisciplines = selectedDisciplines.slice(0,-2);

					var options = [];
					options.push ({text: "Selected Disciplines " + optionSuffixText, value: selectedDisciplines});
					options.push ({text: "All Disciplines " + optionSuffixText, value: ""});
					options.push.apply (options, responseOptions);
					 
					callback(options, selectedDisciplines);
			}
			
			this.disciplineDropdownChange = function(option) {
	    		if(option=="") {

	    			return this.allDisciplines();

	    		} else if (option.indexOf("::") > 0) {
	    			var selectedDisciplines = [];
	    			option.split("::").forEach (function(item) {
	    				selectedDisciplines.push({"item": item}); 
	    			});
	    			
	    			return selectedDisciplines;    			
	    		} else {
	    			var oneDiscipline = [];
	    			oneDiscipline.push({"item": option});
	    			
	    			return oneDiscipline;
	    		}    		    			
	    	}
}])