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

    $urlRouterProvider.otherwise('/home/questionbanks');

    $stateProvider

        // HOME STATES AND NESTED VIEWS ========================================
    .state('signin', {
        url: '/signin',
        templateUrl: 'views/signin.html',
        controller: 'SigninController',
        data: {
            requireLogin: false
          }
    })    
        .state('login', {
            url: '/login',
            templateUrl: 'views/login.html',
            controller: 'LoginController',
            data: {
                requireLogin: false
              }
        })
        .state('layout', {
            url: '/layout',
            templateUrl: 'views/layout.html',
            data: {
                requireLogin: false
            }
        })
        .state('home', {
            url: '/home',
            templateUrl: 'views/home.html',
            controller: 'HomeController',
            data: {
                requireLogin: true
              }
        })
        .state('home.yourtests', {
            url: '/yourtests',
            templateUrl: 'views/partials/your-tests.html',
            controller: 'MyTestsController',
            data: {
                requireLogin: true
              }
        })
        .state('home.questionbanks', {
            url: '/questionbanks',
            templateUrl: 'views/partials/question-banks.html',
            controller: 'QuestionBanksController',
            data: {
                requireLogin: true
              }
        })
        .state('home.customquestions', {
            url: '/customquestions',
            templateUrl: 'views/partials/custom-questions.html',
            controller: 'CustomQuestionBanksController',
            data: {
                requireLogin: true
              }
        })
         .state('welcome', {
             url: '/welcome',
             controller: 'WelcomeController',
             templateUrl: 'views/welcome.html',
             data: {
                 requireLogin: true
               }
         })
        .state('startup', {
            url: '/startup',
            controller: 'startupWizardController',
            templateUrl: 'views/usersettings/startupWizard.html',
            data: {
                requireLogin: true
              }
        });

})
.run(['$rootScope', '$location', '$cookieStore', '$http', '$modal', 'blockUI', 'AuthenticationService',
    function ($rootScope, $location, $cookieStore, $http, $modal, blockUI, AuthenticationService) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};
    	
        piSession.on(piSession.LogoutEvent, AuthenticationService.onLogout);
        
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {        	        	        	        		        	
        	
			$rootScope.blockPage = blockUI.instances.get('BlockPage');
			$rootScope.blockRightPanel = blockUI.instances.get('RightPanel');
			$rootScope.blockLeftPanel = blockUI.instances.get('leftPanel'); 
			
            var requireLogin = toState.data.requireLogin;

            if (requireLogin) {              
			
            	piSession.login(evalu8config.signinUrl, evalu8config.loginGraceTimeSeconds);                	                  
            }       	

        	/*
        	if(evalu8config.viaPILogin) {
        		
        	} else {
                // redirect to login page if not logged in
            	
                if ($location.path() !== '/login' && $rootScope.globals.currentUser == '') {
                    $location.path('/login');
                }	
        	} */           
        });
    }]);