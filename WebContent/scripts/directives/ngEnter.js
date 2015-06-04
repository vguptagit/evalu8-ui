'use strict';
angular.module('e8MyTests')
.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
})
    .directive('ngAutoScroll', function () {
        return function (scope, element, attrs) {
            $('#scroll').scrollLeft(element.offset().left - $('#scroll').offset().left);
        };
    }).directive('ngMytestTooltip', function () {
        return function (scope, element, attrs) {
        	element.tooltip();
        };
    }); 