'use strict';
angular.module('e8MyTests')
.directive('eventFocus', function (focus) {
    return function (scope, element, attr) {
        element.on(attr.eventFocus, function () {
            focus(attr.eventFocusId);
        });

        // Removes bound events in the element itself
        // when the scope is destroyed
        scope.$on('$destroy', function () {
            element.off(attr.eventFocus);
        });
    };
}).directive('focusMe', function ($timeout) {
    return function (scope, element, attr) {
        $timeout(function () {
            if (element)
                element.focus();
        }, 100);
    };
})
.factory('focus', function ($timeout, $window) {
    return function (id) {
        // timeout makes sure that is invoked after any other event has been triggered.
        // e.g. click events that need to run before the focus or
        // inputs elements that are in a disabled state but are enabled when those events
        // are triggered.
        $timeout(function () {
            var element = $window.document.getElementById(id);
            if (element)
                element.focus();
        });
    };
});