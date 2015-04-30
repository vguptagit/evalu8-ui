'use strict';

// declare modules
angular.module('e8Login', []);
angular.module('e8Books', []);
angular.module('e8Chapters', []);
angular.module('e8SelectDisciplines', []);
angular.module('e8SelectBooks', []);
angular.module('e8SelectQuestionMetadata', []);
angular.module('e8SelectPrintSettings', []);
angular.module('e8MyTests', []);
angular.module('e8PublisherTests', []);
angular.module('e8QuestionBanks', []);
angular.module('e8CustomQuestionBanks', []);


angular.module('evalu8Demo', [
    'e8Login',
    'e8Books',
    'e8Chapters',
    'e8SelectDisciplines',
    'e8SelectBooks',
    'e8SelectQuestionMetadata',
    'e8SelectPrintSettings',
    'e8MyTests',
    'e8PublisherTests',
    'e8QuestionBanks',
    'e8CustomQuestionBanks',
    'ngRoute',
    'ngCookies',
//  'blockUI',
    'ui.bootstrap'
])/*.config(function(blockUIConfig) {
	//blockUIConfig.message = "<div class='loader'>Loading...</div>";
	blockUIConfig.autoInjectBodyBlock = false;
	blockUIConfig.delay = 100;
})*/
.config(['$routeProvider', function ($routeProvider) {

    $routeProvider
        .when('/login', {
            controller: 'LoginController',
            templateUrl: 'views/newLogin.htm'
        })
        .when('/questionBanks', {
            controller: 'QuestionBanksController',
            templateUrl: 'views/questionBanks.htm'
        })
        .when('/publisherTests', {
            controller: 'PublisherTestsController',
            templateUrl: 'views/publisherTests.htm'
        })   
        .when('/myTests', {
            controller: 'MyTestsController',
            templateUrl: 'views/myTests.htm'
        })         
          .when('/customQuestionBanks', {
            controller: 'CustomQuestionBanksController',
            templateUrl: 'views/customQuestionBanks.htm'
        })   
        .when('/books/:bookid/nodes', {
            controller: 'ChapterController',
            templateUrl: 'views/chapters.htm'
        })          
        .when('/usersettings/disciplines', {
            controller: 'SelectDisciplinesController',
            templateUrl: 'views/usersettings/selectDisciplines.htm'
        })         
        .when('/usersettings/books', {
            controller: 'SelectBooksController',
            templateUrl: 'views/usersettings/selectBooks.htm'
        })        
        .when('/usersettings/questionmetadata', {
            controller: 'SelectQuestionMetadataController',
            templateUrl: 'views/usersettings/selectQuestionMetadata.htm'
        })
        .when('/usersettings/printsettings', {
            controller: 'SelectPrintSettingsController',
            templateUrl: 'views/usersettings/selectPrintSettings.htm'
        })        
        .otherwise({ redirectTo: '/login' });
}])
 
.run(['$rootScope', '$location', '$cookieStore', '$http','$modal',
    function ($rootScope, $location, $cookieStore, $http,$modal) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};
 
        $rootScope.$on('$routeChangeStart', function (event, next, current) {
            // redirect to login page if not logged in
            if ($location.path() !== '/login' && $rootScope.globals.currentUser == '') {
                $location.path('/login');
            }
        });
    }]);