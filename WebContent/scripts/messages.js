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
		restore : "Unable to restore! Please try again.",
		deleteFolder: "Unable to deleteFolder! Please try again.",
		deleteTest: "Unable to deleteTest! Please try again.",
		archiveFolders : "Unable to fetch archived folders! Please try again.",
		archiveTests : "Unable to fetch archived tests! Please try again.",
		testQuestions: "Unable to fetch testQuestions! Please try again.",
		publisherTests: "Unable to fetch publisherTests! Please try again.",
		versions: "Unable to create test versions! Please try again.",
		metadata: "Unable to fetch metadata! Please try again.",
		nodes: "Unable to fetch nodes! Please try again.",
		discipline: "Unable to fetch descipline! Please try again.",
		tests: "Unable to fetch tests! Please try again.",
		book: "Unable to fetch books! Please try again."
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
