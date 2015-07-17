angular
.module('e8MyTests')
.controller('SigninController', ['$scope', '$rootScope', '$location', '$http', 'AuthenticationService', 'notify',
function($scope, $rootScope, $location, $http, AuthenticationService, notify) {
	
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
					$scope.showErrorMessage();
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
	
	$scope.showErrorMessage = function(){
		var msg = e8msg.error.login;
		var messageTemplate ='<p class="alert-danger"><span class="glyphicon glyphicon-alert"></span><span class="warnMessage">' + msg  + '</p> ';
		$scope.positions = ['center', 'left', 'right'];
		$scope.position = $scope.positions[0];
		notify({
			messageTemplate: messageTemplate,						                
			classes: 'alert alert-danger',	
			position: $scope.position,
			duration: '4000'
		});
	};
}]);
