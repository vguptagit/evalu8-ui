angular
.module('e8MyTests')
.controller('SigninController', ['$scope', '$rootScope', '$location', '$http', 'AuthenticationService', 'CommonService',
function($scope, $rootScope, $location, $http, AuthenticationService, CommonService) {
	
	$scope.unauthorised = false;
	
	piSession.getToken(function(error, token) {
		
    	if(piSession.currentToken()) {
    		
			var piconfig = {
					headers : {
						'AccessToken' : token,
						'Accept' : 'application/json;odata=verbose'
					}
				};
			
			$http.post(evalu8config.apiUrl + '/login', '', piconfig)
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
					CommonService.showErrorMessage(e8msg.error.login);
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
