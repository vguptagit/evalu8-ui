/**
 * Used to store the static messages which has been used as a label in the
 * application. and these messages are accessed using the variable e8message as
 * a global variable.
 * 
 */

(function(ns) {

	ns.error = {
		importUserBooks : "Unable to import! Please try again.",
		save : "Unable to save! Please try again.",
		login : "Unable to login! Please try again.",
		archive : "Unable to archive! Please try again.",
		restore : "Unable to restore! Please try again."			
	};

	ns.success = {

	};

	ns.validation = {
		duplicateTestTitle : "A test already exists with this name.",
		duplicateFolderTitle : "A folder already exists with this name."
	};
	
	ns.warning = {	
		emptyFolder : "This folder is empty."
	};

})(window.e8msg = window.e8msg || {});
