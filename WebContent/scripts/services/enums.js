'use strict';

angular.module('evalu8Demo')

.service('EnumService', function () {
    this.RESOURCES_TABS = {
        yourtests: '.yourtests',
        questionbanks: '.questionbanks',
        customquestions: '.customquestions'
    };
});