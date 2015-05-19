'use strict';

angular.module('evalu8Demo')

.service('EnumService', function () {
    this.RESOURCES_TABS = {
        yourtests: '.yourtests',
        questionbanks: '.questionbanks',
        customquestions: '.customquestions'
    };
    
    this.CONTROLLERS={
    		myTest: 'MyTestsController',
            questionBanks: 'QuestionBanksController',
            testCreationFrame: 'TestCreationFrameController'
    };

    this.CONTENT_TYPE = {
        folder: 'folder',
        test: 'test',
        emptyFolder: 'empty',
        archiveRoot: 'archiveRoot'
    };

    this.NODE_TYPE = {
        question: 'question',
        chapter : 'chapter',
        topic   : 'topic'
    };
});