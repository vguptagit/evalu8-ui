'use strict';

angular.module('evalu8Demo')

.service('EnumService', function () {
    this.RESOURCES_TABS = {
        yourtests: '.yourtests',
        yourquestions: '.yourquestions',
        questionbanks: '.questionbanks',
        customquestions: '.customquestions'
    };
    
    this.CONTROLLERS={
    		myTest: 'MyTestsController',
            questionBanks: 'QuestionBanksController',
            testCreationFrame: 'TestCreationFrameController'
    };

    this.NODE_TYPE = {
        folder : 'folder',
        test : 'test',
        emptyFolder : 'empty',
        archiveRoot : 'archiveRoot',
        archiveFolder : 'archiveFolder',
        archiveTest : 'archiveTest',
        question : 'question',
        chapter : 'chapter',
        topic   : 'topic',
        publisherTests : 'publisherTests',
        userQuestionFolder:'UserQuestionsFolder',
        yourQuestionRoot: 'YourQuestionRoot'
    };

    this.TEST_TYPE = {
        Test: 'Test',
        PublisherTest: 'PublisherTest'
    };

    this.ERROR_MESSAGES = {
        EmptyTestTitle: "Please enter test title to save the test."
    };
    this.SAVE_MODE = {
        Save: "save",
        SaveAs: "saveas"
    };
    
    this.HttpStatus = {
    	CONFLICT: 409
    };
});