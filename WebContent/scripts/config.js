(function(ns) {
	
    ns.host = window.location.protocol + "//" + window.location.host + "/mytest";
	ns.homeEndpoint = "/home/questionbanks";
	ns.homeTestGen = "/questionBanks";
	ns.welcome = "/welcome";
	
	ns.viaPILogin = true;
	ns.signinUrl = "http://localhost.dev-prsn.com:8080/evalu8-ui/#/signin";
	ns.homeUrl = "http://localhost.dev-prsn.com:8080/evalu8-ui/#/home/questionbanks";
	ns.welcomeUrl = "http://localhost.dev-prsn.com:8080/evalu8-ui/#/welcome";
	ns.loginGraceTimeSeconds = 2; 
	ns.welcomeLoginCount = 5;
		
})(window.evalu8config = window.evalu8config || {})