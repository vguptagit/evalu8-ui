(function(ns) {
	
	ns.domain = window.location.protocol + "//" + window.location.host;	
    ns.uiUrl = ns.domain;    
    ns.apiUrl = ns.domain + "/api";    
	
	ns.viaPILogin = true;
	
	ns.clientId = "Odnmv55kBQbCBQfbRd4pCSHpvzmQmQ7u";
	ns.signinUrl = ns.uiUrl + "/#/signin";
	ns.homeUrl = ns.uiUrl + "/#/home/questionbanks";
	ns.welcomeUrl = ns.uiUrl + "/#/welcome";
	
	ns.loginGraceTimeSeconds = 2; 
	ns.welcomeLoginCount = 1;
	ns.messageTipTimeMilliSeconds = 5000;
	
	ns.messageTipLoginCount = 2;
	
	ns.maxSizeForTestPackage="4194304";
	
	
	/// Google Analytics related configuration
	ns.gaEnabled = false;
	ns.gaTracking = 'UA-63894857-1';
		
})(window.evalu8config = window.evalu8config || {})