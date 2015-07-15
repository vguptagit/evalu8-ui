/**
 * Used to store the static messages which has been used as a label in the
 * application. and these messages are accessed using the variable e8message as
 * a global variable.
 * 
 */

(function(ns) {

	ns.error = {
		importUserBooks : "Unable to import! Please try again.",
		save : "Unable to save! Please try again."
	};

	ns.success = {

	};

	ns.warning = {	
		emptyFolder : "This folder is empty."
	};

})(window.e8msg = window.e8msg || {});
