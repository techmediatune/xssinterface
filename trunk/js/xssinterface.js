
var XSSInterfacePollIntervalMilliSeconds = 300;
var XSSInterfaceCookieName               = "XSSData";
var XSSInterfaceSecurityTokenCookieName  = "XSSSecurityToken";
var XSSInterfaceDebug                    = false;


XSSInterface = {};

XSSInterface.Listener  = function (securityToken,channelId) {
	this.callbacks     = {};
	this.callbackNames = [];
	
	if(securityToken  == "" || securityToken == null) throw("Missing Parameter securityToken")
	this.securityToken = securityToken;
	
	this.channelId  = channelId;
	if(this.channelId == null) {
		this.channelId = ""
	}
	
	this.cookie        = new XSSInterface.Cookie()
}

XSSInterface.Listener.prototype = {
	parse: function () {

		var json   = this.read();	
	
		if(json != null && json != "") {

			this.clear();

		 	json = new String(json)
			return JSON.parse(json);
		}
		return null

	},
	
	dataCookieName:	function () {
		return XSSInterfaceCookieName+this.channelId
	},

	read: function() {
		return this.cookie.get(this.dataCookieName());
	},

	clear: function() {
		this.cookie.set(this.dataCookieName(),"");
	},

	
	allowDomain: function(hostname, pathToCookieSetterHTMLFile) {
		var me = this;
		// the timeout makes Firefox happy
		
		var url = "http://"+hostname+pathToCookieSetterHTMLFile
		
		window.setTimeout(function () {
			me.cookie.setCrossDomain(url, "token", me.securityToken, me.channelId)
		}, 1);
	},


	registerCallback: function (name, func) {
		this.callbacks[name] = func;
		this.callbackNames.push(name)
	},


	execute: function () {
		var data = this.parse();

		if(data == null) {
			return
		}
		
		if(data.token != this.securityToken) {
			throw("Received wrong security token. Expected: "+this.securityToken+" Received: "+data.token)
		}

		var name  = data.name;
		var paras = data.paras;
		var from  = data.from;
		
		
		// check whether $name is really a registered function and not something that leaked into this.callbacks through prototype extension
		var found = false;
		for(var i = 0; i < this.callbackNames.length; i++) {
			if(this.callbackNames[i] == name) {
				found = true;
				break;
			} 
		}
		if(!found) {
			throw("XSSInterface Error: unknown remote method ["+name+"] called by "+from)
		}
		
		// Get the actual function
		var func  = this.callbacks[name];
		

		var call_info = {
			name:   name,
			paras:  paras,
			from:   from
		};

		if(func != null) {
			func.apply(call_info, paras)
		}

	},

	startEventLoop: function () {
		var me = this;
		window.setInterval( function () { me.execute() }, XSSInterfacePollIntervalMilliSeconds )
	}	
};


XSSInterface.Caller = function (targetDomain,cookieSetterHTMLFile,channelId) {
	this.domain                     = targetDomain;
	this.pathToCookieSetterHTMLFile = cookieSetterHTMLFile
	
	this.cookie                     = new XSSInterface.Cookie(XSSInterfaceCookieName)
	
	this.channelId  = channelId;
	if(this.channelId == null) {
		this.channelId = ""
	}
}

XSSInterface.Caller.prototype = {

    save: function(data) {
    	
    	var url = 'http://'+this.domain+this.pathToCookieSetterHTMLFile
    	
		this.cookie.setCrossDomain(url, "data", this.serialize(data), this.channelId)
	},

	serialize: function (data) {
    	var str = JSON.stringify(data);
    	return str
    },
	
	securityTokenToTargetDomain: function () {
		var name = XSSInterfaceSecurityTokenCookieName+this.domain
		return this.cookie.get(name)
	},

	call: function (name) {
		
		var args = [];
		for(var i = 1; i < arguments.length; i++) { // copy arguments, leave out first, because it is the function name
			XSSdebug("Arg: "+arguments[i])
			args.push(arguments[i]);
		}
		
		var data = {
			name:  name,
			paras: args,
			from:  document.location.hostname,
			token: this.securityTokenToTargetDomain()
		};
		
		
		this.save(data)
	}

};


XSSInterface.Cookie = function () {
	this.doc  = document;
};


XSSInterface.Cookie.prototype = {


	// Extremely ugly code that seems to work follows. a more robust replacement is more that welcome
	get:	function (name) {
		
		XSSdebug("Trying read "+name)
		
        var dc   = this.doc.cookie;

        var prefix = name + "=";
        var begin  = dc.indexOf("; " + prefix);
        if (begin == -1) {
                begin = dc.indexOf(prefix);
                if (begin != 0) return ""; // Wenn der Name (Prefix) ohne vorgestelltes ; nicht am Zeilenanfang steht, dann ist er Teil eines anderen Cookies und somit nicht was wir suchen.
        } else {
                begin += 2 // Plus 2 damit der Index nicht mehr auf dem ; steht
        }
        var end = this.doc.cookie.indexOf(";", begin);
        if (end == -1) { // Wenn kein ; vorhanden ist, dann handelt es sich um den letzten Wert im Cookie-String. Somit ist das Ende des Cookie-Strings auch gleich das ende des gesuchten Wertes.
                end = dc.length;
        }
        var value = unescape(dc.substring(begin + prefix.length, end)); // Der Wert des gesuchten Cooki wird als Teilstring aus dem gesamten Cookie-Strings extrahiert.

        if(value == ";") { // bug with IE
                return ""
        }
        
        XSSdebug("Reading cookie "+ value)

        return value;
	},

	set:	function(name, value, expires, secure) {

		XSSdebug("Setting cookie "+name+"="+value)

		var cookie = name + "=" + escape(value) +
        	( ( expires ) ? "; expires=" + expires.toGMTString() : "" ) + 
        	//((path) ? "; path=" + path : "") +
        	"; path=/" + 
        	((secure) ? "; secure" : "");

    	this.doc.cookie = cookie; 
        
        var newval = this.get(name)
        if(newval != value) {
        	XSSdebug("Failed Setting cookie " +name+" "+value+"->"+newval)
        }
        
	},
	
	
	setCrossDomain: function (url, key, value,channelId) { // key may have the values data or token
	
		var from = this.doc.location.hostname;
		
		var src = url + '?from='+escape(from)+';'+key+'='+escape(value)+';channelId='+escape(channelId)
		
		var html = '<iframe src="'+src+'" width=1 height=1 frameborder="0" border="0"></iframe>'
		
		//if(!this.iframeContainer) {
			var span   = this.doc.createElement("span");
			this.doc.body.appendChild(span);
			this.iframeContainer = span
		//}
		
		this.iframeContainer.innerHTML = html
	}

}

XSSInterface.Cookie.setFromLocation = function () {

	var search = window.location.search;
	var parts  = search.split("?");
	var search = parts[1];

	if(search == null) {
		search = "";
	}
	
	parts      = search.split(";");
	
	var query  = {};
	
	for(var i = 0; i < parts.length; i++) {
		var pair = parts[i].split("=");
		query[pair[0]] = unescape(pair[1])
	}
	
	var cookie = new XSSInterface.Cookie()
	

    
    if(query.data) {
    	var expiration = new Date();
		expiration.setTime(expiration.getTime() + 2000);
		
		var name = XSSInterfaceCookieName + query.channelId
		
    	cookie.set(name, query.data, expiration)
    }
    
    if(query.token && query.from) {
    	var name = XSSInterfaceSecurityTokenCookieName + query.from
    	cookie.set(name, query.token)
    }

	
}

XSSdebug = function (txt) {
	
	if(!XSSInterfaceDebug) return;
	
	var message = window.location.hostname + ": "+txt;
	
	var log     = document.getElementById("log");
	
	if(log) {
		var html = message+"<br>"+log.innerHTML;
		
		log.innerHTML= html.substring(0,1000)
	} else {
		alert(message)
	}
}
