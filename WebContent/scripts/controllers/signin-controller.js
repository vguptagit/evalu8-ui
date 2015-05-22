angular.module('e8MyTests').controller('SigninController', ['$scope', '$rootScope', '$location', '$http', 'AuthenticationService',
function($scope, $rootScope, $location, $http, AuthenticationService) {
	
	piSession.getToken(function(error, token) {
		
    	if(piSession.currentToken()) {
    		
			var piconfig = {
					headers : {
						'AccessToken' : token,
						'Accept' : 'application/json;odata=verbose'
					}
				};
			
			$http.get(evalu8config.apiUrl + '/login', '', piconfig)
			.success(function (response) {						
				
				AuthenticationService.SetCredentials(response.token, response.loginCount);
				
				if(response.loginCount > evalu8config.welcomeLoginCount) {
					window.location.href = evalu8config.homeUrl;
				} else {
					window.location.href = evalu8config.welcomeUrl;
				}
				
			})
			.error(function(data, status) {
				
				AuthenticationService.ClearCredentials();
			})				    			
    	} else {
    		
    		piSession.login(evalu8config.signinUrl, evalu8config.loginGraceTimeSeconds);
    	}
	});
	
}]);
