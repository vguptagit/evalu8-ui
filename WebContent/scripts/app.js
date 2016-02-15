	'use strict';

	// declare modules
	angular.module('e8Login', []);
	angular.module('e8SelectPrintSettings', []);
	angular.module('e8MyTests', []);
	angular.module('e8QuestionBanks', []);
	angular.module('e8CustomQuestionBanks', []);


	angular.module('evalu8Demo', [
		'e8Login',
		'e8SelectPrintSettings',
		'e8MyTests',
		'e8QuestionBanks',
		'e8CustomQuestionBanks',
		'ngRoute',
		'ngCookies',
		'blockUI',
		'ui.tree',
		'ui.bootstrap',
		'ui.router',
		'angularFileUpload',
		'mgo-angular-wizard',
		'cgNotify',
		'angular.filter',
		'angulartics',
		'angulartics.google.analytics',
		 'ckeditor',
		 'ckeditorPlaceholder'
	]).config(function ($stateProvider, $urlRouterProvider, $httpProvider) {

		//initialize get if not there
		if (!$httpProvider.defaults.headers.get) {
			$httpProvider.defaults.headers.get = {};    
		} 
		//disable IE ajax request caching
		$httpProvider.defaults.headers.get['If-Modified-Since'] = '0';

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
		.state('home.yourquestions', {
			url: '/yourquestions',
			templateUrl: 'views/partials/your-questions.html',
			controller: 'MyQuestionsController',
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
	.run(function ($templateCache, $http) {      
         $http.get('views/editortmpl/mc.html', { cache: $templateCache });
		 $http.get('views/editortmpl/mr.html', { cache: $templateCache });
		 $http.get('views/editortmpl/mf.html', { cache: $templateCache });
		 $http.get('views/editortmpl/es.html', { cache: $templateCache });
		 $http.get('views/editortmpl/fb.html', { cache: $templateCache });
		 $http.get('views/editortmpl/sa.html', { cache: $templateCache });
		 $http.get('views/editortmpl/tf.html', { cache: $templateCache });
		 $http.get('views/editortmpl/vb.html', { cache: $templateCache });
    })
	.config(function(blockUIConfig) {

		blockUIConfig.autoInjectBodyBlock = false;
		blockUIConfig.delay = 100;	
	})
	.factory('myHttpInterceptor',  function ( $location, $q) {
		return {
			responseError: function (response) {
				if(response.status == 403) {            	

					piSession.logout();	
					$location.path("/signin");            	

					return;
				} else { 
					
					return $q.reject(response);
				}

			}
		};
	})
	.config(function ($httpProvider) {
		$httpProvider.interceptors.push('myHttpInterceptor');
	})
	
	.run(['$rootScope', '$location', '$cookieStore', '$http', '$modal', 'blockUI', 'AuthenticationService',
		function ($rootScope, $location, $cookieStore, $http, $modal, blockUI, AuthenticationService) {        				
		
			$rootScope.blockPage = blockUI.instances.get('BlockPage');
			$rootScope.blockRightPanel = blockUI.instances.get('RightPanel');
			$rootScope.blockLeftPanel = blockUI.instances.get('LeftPanel');

			piSession.on(piSession.LogoutEvent, AuthenticationService.onLogout);
			
			piSession.on(piSession.RefreshEvent, AuthenticationService.onRefresh);
			
			if(sessionStorage.getItem('globals') === null) {
				$location.path("/signin");
				return;
			}
			
			$rootScope.globals = JSON.parse(sessionStorage.getItem('globals'));    	
			
			$rootScope.$on('$stateChangeStart', function (event, toState, toParams) {        	        	        	        		        	        	 
				
				var requireLogin = toState.data.requireLogin;

				if (requireLogin) {              
				
					piSession.login(evalu8config.signinUrl, evalu8config.loginGraceTimeSeconds);                	                  
				}       	          
			});	
					
		}
	]);