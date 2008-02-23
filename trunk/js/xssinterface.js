/*
 * 
 * 
 * The xssinterface javascript library enables communication of 
 * multiple pages (or pages and iframes) via javascript functions 
 * across domain boundaries. This may be useful for websites that 
 * want to expose a limited javascript interface to embedded widgets.
 * 
 * This library requires that you also load the standard JSON library:
 * http://www.json.org/json2.js
 * 
 * 
 * Copyright (c) 2008, Malte Ubl
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *
 *    * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *    * Neither the name of Malte Ubl nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * 
 * 
 */


// Number of milli seconds between polls for new callbacks
var XSSInterfacePollIntervalMilliSeconds = 300;
// Name of cookie that is used for messages. Should not be changed
var XSSInterfaceCookieName               = "XSSData";
// Name of cookie that is used for the security token
var XSSInterfaceSecurityTokenCookieName  = "XSSSecurityToken";
// Enables debug mode. You might want to add <div id=log></div> to your pages
var XSSInterfaceDebug                    = false;


XSSInterface = {};

/* A listener for cross domain callbacks
 * 
 * securityToken should be a cryptographically secure random string. It should be equal for all listener of
 * a users and a given domain. sha1(session_id) should work. This id is exchanged with sites that are allowed to
 * call this listener.
 * 
 * channelId is an identifier that groups listeners and callers. If you have multiple iframes, create one channel for each of them.
*/
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
	
	/*
	 * call this to enable hostname to send messages to this listener
	 * pathToCookieSetterHTMLFile must be a path residing on hostname to the cookie_setter.html file that is provided by this library
	 *  "http://" + hostname + pathToCookieSetterHTMLFile
	 * 
	 */
	allowDomain: function(hostname, pathToCookieSetterHTMLFile) {
		var me = this;
		// the timeout makes Firefox happy
		
		var url = "http://"+hostname+pathToCookieSetterHTMLFile
		
		window.setTimeout(function () {
			me.cookie.setCrossDomain(url, "token", me.securityToken, me.channelId)
		}, 300);
	},

	/*
	 * register a callback with a given name
	 * func must be a function reference
	 */
	registerCallback: function (name, func) {
		this.callbacks[name] = func;
		this.callbackNames.push(name)
	},
	
	/*
	 * As soon as this method is called the listener will respond to calls
	 */
	startEventLoop: function () {
		var me = this;
		window.setInterval( function () { me.execute() }, XSSInterfacePollIntervalMilliSeconds )
	},	
	
	// private
	/*
	 * Reads a message cookie. If successful, clears the cookie and parses its contents as JSON
	 */
	parse: function () {

		var json   = this.read();	
	
		if(json != null && json != "") {

			this.clear();

		 	json = new String(json)
			return JSON.parse(json);
		}
		return null

	},
	
	// private
	/*
	 * Build the message cookie name. It includes the channelId so that we can have multiple message channels.
	 */
	dataCookieName:	function () {
		return XSSInterfaceCookieName+this.channelId
	},
	
	// private
	/*
	 * Retrieves a message cookie
	 */
	read: function() {
		return this.cookie.get(this.dataCookieName());
	},

	// private
	/*
	 * Clears the message cookie
	 */
	clear: function() {
		this.cookie.set(this.dataCookieName(),"");
	},

	// private
	/*
	 * Checks whether there is a new message. If true locates the callback and executes it.
	 * Throws an error if the security token provided by the message is wrong or if
	 * the callback name is unknown.
	 */
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

	}
};

/*
 * Class for performing cross domain javascript function calls.
 * 
 * targetDomain is the hostname to which call should be send.
 * 
 * pathToCookieSetterHTMLFile must be a path residing on targetDomain to the cookie_setter.html file that is provided by this library
 *  "http://" + targetDomain + pathToCookieSetterHTMLFile
 * 
 * channelId is an identifier that groups listeners and callers. If you have multiple iframes, create one channel for each of them.
 */
XSSInterface.Caller = function (targetDomain,pathToCookieSetterHTMLFile,channelId) {
	this.domain                     = targetDomain;
	this.pathToCookieSetterHTMLFile = pathToCookieSetterHTMLFile
	
	this.cookie                     = new XSSInterface.Cookie(XSSInterfaceCookieName)
	
	this.channelId  = channelId;
	if(this.channelId == null) {
		this.channelId = ""
	}
}

XSSInterface.Caller.prototype = {
	
	/*
	 * Call a method called name on the target domain.
	 * All extra parameters to will be forwarded to the remote method.
	 */
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
	},

	// private
	/*
	 * Save a message cookie under the dall target domain
	 */
    save: function(data) {
    	
    	var url = 'http://'+this.domain+this.pathToCookieSetterHTMLFile
    	
		this.cookie.setCrossDomain(url, "data", this.serialize(data), this.channelId)
	},

	// private
	/*
	 * Turn the message data into JSON
	 */
	serialize: function (data) {
    	var str = JSON.stringify(data);
    	return str
    },
	
	// private
	/*
	 * Retrieves the security token that grants access to the call target domain
	 */
	securityTokenToTargetDomain: function () {
		var name = XSSInterfaceSecurityTokenCookieName+this.domain
		return this.cookie.get(name)
	}

};


/*
 * Cookie handling routines
 */
XSSInterface.Cookie = function () {
	this.doc  = document;
};


XSSInterface.Cookie.prototype = {

	/*
	 * Retrieve a cookie called $name
	 */
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
	
	/*
	 * Set a cookie with name and value
	 * expires must be a Date-Object
	 */
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
	
	/*
	 * Set a cookie in a different domain
	 * The cookie will be readable by domain of url
	 * url must point to a cookie_setter.html file that is provided by this library.
	 * The parameters that are appended to the url will be picked up by XSSInterface.Cookie.setFromLocation()
	 */
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


/*
 * Used in cookie_setter.html to set a cookie based on parameters given to the file via the query_string
 * For security reasons the caller cannot determine the cookie name
 */
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
/*
 * Print debug information if in debug mode.
 * if document.getElementById("log") returns something, the output will be send there.
 */
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
