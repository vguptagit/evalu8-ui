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
    		myQuestion: 'MyQuestionsController',
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
    	CONFLICT: 409,
    	BADREQUEST: 400,
    	SUCCESS: 200,
    	NOTFOUND: 404,
    	INTERNALEXCEPTION: 500
    };

    this.MetadataEnum = {
        'DIFFICULTY': 'Difficulty',
        'TOPIC': 'Topic',
        'OBJECTIVE': 'Objective',
        'PAGEREFERENCE': 'PageReference',
        'SKILL': 'Skill',
        'QUESTIONID': 'QuestionId'
    }

    this.ShortMetadataEnum = {
        'DIFFICULTY': 'Diff',
        'TOPIC': 'Topk',
        'OBJECTIVE': 'Objt',
        'PAGEREFERENCE': 'PRef',
        'SKILL': 'Skil',
        'QUESTIONID': 'QnId'
    }
    
    this.QuestionType = {
            'Essay': 'Essay',
            'MultipleResponse': 'MultipleResponse',
            'Matching': 'Matching',
            'MultipleChoice': 'MultipleChoice',
            'TrueFalse': 'TrueFalse',
            'FillInBlanks': 'FillInBlanks',
            'ShortAnswer' : 'ShortAnswer',
            'Vocabulary': 'Vocabulary'
        }
    
});
