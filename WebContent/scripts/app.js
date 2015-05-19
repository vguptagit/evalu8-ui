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
    'blockUI',
    'ui.bootstrap',
    'ui.router',
    'angularFileUpload',
    'mgo-angular-wizard',
    'cgNotify',
    'angular.filter'
]).config(function(blockUIConfig) {
	//blockUIConfig.message = "<div class='loader'>Loading...</div>";
	blockUIConfig.autoInjectBodyBlock = false;
	blockUIConfig.delay = 100;
})
.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/home');

    $stateProvider

        // HOME STATES AND NESTED VIEWS ========================================
        .state('login', {
            url: '/login',
            templateUrl: 'views/login.html',
            controller: 'LoginController'
        })
        .state('home', {
            url: '/home',
            templateUrl: 'views/home.html',
            controller: 'HomeController'
        })
        .state('home.yourtests', {
            url: '/yourtests',
            templateUrl: 'views/partials/your-tests.html',
            controller: 'MyTestsController'
        })
        .state('home.questionbanks', {
            url: '/questionbanks',
            templateUrl: 'views/partials/question-banks.html',
            controller: 'QuestionBanksController'
        })
        .state('home.customquestions', {
            url: '/customquestions',
            templateUrl: 'views/partials/custom-questions.html',
            controller: 'CustomQuestionBanksController'
        })
         .state('welcome', {
             url: '/welcome',
             controller: 'WelcomeController',
             templateUrl: 'views/welcome.html'
         })
        .state('startup', {
            url: '/startup',
            controller: 'startupWizardController',
            templateUrl: 'views/usersettings/startupWizard.html'
        });

})
.run(['$rootScope', '$location', '$cookieStore', '$http', '$modal',
    function ($rootScope, $location, $cookieStore, $http, $modal) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};

        $rootScope.$on('$routeChangeStart', function (event, next, current) {
            // redirect to login page if not logged in
            if ($location.path() !== '/login' && $rootScope.globals.currentUser == '') {
                $location.path('/login');
            }
        });
    }]);