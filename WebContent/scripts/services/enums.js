﻿'use strict';

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
        publisherTests : 'publisherTests'
    };
});