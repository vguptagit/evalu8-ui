(function(ns) {
	
	ns.domain = window.location.protocol + "//" + window.location.host;	
    ns.uiUrl = ns.domain + "/evalu8";    
    ns.apiUrl = ns.domain + "/mytest";    
	
	ns.viaPILogin = true;
	
	ns.clientId = "Odnmv55kBQbCBQfbRd4pCSHpvzmQmQ7u";
	ns.signinUrl = ns.uiUrl + "/#/signin";
	ns.homeUrl = ns.uiUrl + "/#/home/questionbanks";
	ns.welcomeUrl = ns.uiUrl + "/#/welcome";
	
	ns.loginGraceTimeSeconds = 2; 
	ns.welcomeLoginCount = 1;
	
	ns.messageTipLoginCount = 2;
		
})(window.evalu8config = window.evalu8config || {})