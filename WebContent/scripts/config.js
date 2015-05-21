(function(ns) {
	
	ns.domain = window.location.protocol + "//" + window.location.host;
	
    ns.host = ns.domain + "/mytest";
	ns.homeEndpoint = "/home/questionbanks";
	ns.homeTestGen = "/questionBanks";
	ns.welcome = "/welcome";
	
	ns.viaPILogin = true;
	
	ns.signinUrl = ns.domain + "/evalu8-ui/#/signin";
	ns.homeUrl = ns.domain + "/evalu8-ui/#/home/questionbanks";
	ns.welcomeUrl = ns.domain + "/evalu8-ui/#/welcome";
	
	ns.loginGraceTimeSeconds = 2; 
	ns.welcomeLoginCount = 5;
		
})(window.evalu8config = window.evalu8config || {})