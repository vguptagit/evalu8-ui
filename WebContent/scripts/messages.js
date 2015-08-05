/**
 * Used to store the static messages which has been used as a label in the
 * application. and these messages are accessed using the variable e8message as
 * a global variable.
 * 
 */

(function(ns) {

	ns.error = {
		cantImportUserBooks : "Unable to import! Please try again.",
		cantSave : "Unable to save! Please try again.",
		CantLogin : "Unable to login! Please try again.",
		cantArchive : "Unable to archive! Please try again.",
		cantRestore : "Unable to restore! Please try again.",
		cantDeleteFolder: "Unable to deleteFolder! Please try again.",
		cantDeleteTest: "Unable to deleteTest! Please try again.",
		cantFetchFolders : "Unable to fetch folders! Please try again.",
		cantFetchArchiveFolders : "Unable to fetch archived folders! Please try again.",
		cantFetchArchiveTests : "Unable to fetch archived tests! Please try again.",
		cantFetchTestQuestions: "Unable to fetch testQuestions! Please try again.",
		cantFetchPublisherTests: "Unable to fetch publisherTests! Please try again.",
		cantCreateVersions: "Unable to create test versions! Please try again.",
		cantFetchMetadata: "Unable to fetch metadata! Please try again.",
		cantFetchNodes: "Unable to fetch nodes! Please try again.",
		cantFetchDisciplines: "Unable to fetch descipline! Please try again.",
		cantFetchTests: "Unable to fetch tests! Please try again.",
		cantFetchBooks: "Unable to fetch books! Please try again."
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
