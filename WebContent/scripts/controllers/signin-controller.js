angular
.module('e8MyTests')
.controller('SigninController', ['$scope', '$rootScope', '$location', '$http', 'AuthenticationService', 'CommonService', 'HttpService',
function($scope, $rootScope, $location, $http, AuthenticationService, CommonService, HttpService) {
	
	$scope.unauthorised = false;
	
	piSession.getToken(function(error, token) {
		
    	if(piSession.currentToken()) {
    		
			var piconfig = {
					headers : {
						'AccessToken' : token,
						'Accept' : 'application/json;odata=verbose'
					}
				};
			
			HttpService.post(evalu8config.apiUrl + '/login', '', piconfig, true)
			.success(function (response) {						
				
				AuthenticationService.SetCredentials(response.token, response.loginCount, response.givenName, response.familyName, response.emailAddress);
				
				if(response.loginCount > evalu8config.welcomeLoginCount) {
					window.location.href = evalu8config.homeUrl;
				} else {
					window.location.href = evalu8config.welcomeUrl;
				}
				
			})
			.error(function(data, status) {
				
				if(status == 401) {
					$scope.unauthorised = true;
				} else {
					CommonService.showErrorMessage(e8msg.error.cantLogin);
				}
					
				AuthenticationService.ClearCredentials();
			})				    			
    	} else {
    		
    		piSession.login(evalu8config.signinUrl, evalu8config.loginGraceTimeSeconds);
    	}
	});
	
	$scope.logout = function() {

		AuthenticationService.logout();
	}
	
}]);
