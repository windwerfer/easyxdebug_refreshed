


self.port.on("setCookie", function(cookieStr) {
	
	//console.log(cookieStr);
	
	document.cookie = cookieStr +';'
	
});
