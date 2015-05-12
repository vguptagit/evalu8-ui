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
    'ui.bootstrap',
    'ui.router',
    'angularFileUpload',
    'mgo-angular-wizard',
    'cgNotify',
    'angular.filter'
])/*.config(function(blockUIConfig) {
	//blockUIConfig.message = "<div class='loader'>Loading...</div>";
	blockUIConfig.autoInjectBodyBlock = false;
	blockUIConfig.delay = 100;
})*/
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
        })

        //reference
        // nested list with just some random string data
        .state('home.paragraph', {
            url: '/paragraph',
            template: 'I could sure use a drink right now.'
        })
        // nested list with custom controller
        .state('home.list', {
            url: '/list',
            templateUrl: 'views/partial-home-list.html',
            controller: function ($scope) {
                $scope.dogs = ['Bernese', 'Husky', 'Goldendoodle'];
            }
        })
        // ABOUT PAGE AND MULTIPLE NAMED VIEWS =================================
        .state('about', {
            url: '/about',
            views: {
                '': { templateUrl: 'partial-about.html' },
                'columnOne@about': { template: 'Look I am a column!' },
                'columnTwo@about': {
                    templateUrl: 'table-data.html',
                    controller: 'scotchController'
                }
            }

        });

})
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
        .when('/', {
            templateUrl: 'views/main.html',
            controller: 'MainCtrl'
        })
      .when('/about', {
          templateUrl: 'views/about.html',
          controller: 'AboutCtrl'
      }).otherwise({ redirectTo: '/login' });
}])

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