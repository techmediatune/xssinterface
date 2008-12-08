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
 * TODO
 * - Factor out cookie/postMessage messaging backends into individual classes^
 * - Turns documentation into nice JSDoc
 * 
 */

// Only disable this for debugging
var XSSInterfaceEnablePostMessageSupport	= true;

// Only disable this for debugging
var XSSInterfaceEnableSameDomainSupport	= true;

// Enables debug mode. You might want to add <div id=log></div> to your pages
var XSSInterfaceDebug											= false;

var XSSMaximumQueryStringLength					= document.all ? 2000 : 6000;

XSSInterface = {
	canPostMessage:	function () {
		if(XSSInterfaceEnablePostMessageSupport && ( window.postMessage || document.postMessage) )
			return true;
		return false;
	},

	canSameDomainMessage:	function (domain) {
		if(!XSSInterfaceEnableSameDomainSupport || this.canPostMessage()) {
			return false;
		}
		if(this.domain){ // for caller
			return window.location.protocol + "//" + window.location.host == this.domain;
		}
		if(this.allowedDomains && this.allowedDomains.length>0){ // for listener
			var ok = false;
			for(var i = 0; !ok && i < this.allowedDomains.length; i++) {
				ok = (this.allowedDomains[i] == window.location.host);
			}
			return ok;
		}
		return false;
	},
	
	canHashMessage: function () {
		return !this.canPostMessage() && !this.canSameDomainMessage();
	}
}

/* A listener for cross domain callbacks
 * 
 * @param securityToken should be a cryptographically secure random string. It should be equal for all listener of
 *  a users and a given domain. sha1(session_id) should work. This id is exchanged with sites that are allowed to
 *  call this listener.
 * @param channelId is an identifier that groups listeners and callers. If you have multiple iframes, create one channel for each of them.
*/
XSSInterface.Listener   = function (channelId, channelId_compat) {
	this.channelId = channelId_compat ? channelId_compat : channelId ? channelId : "";
	
	this.callbacks = {};
	this.callbackNames = [];	
	this.allowedDomains = [];
	
	// Error Callbacks
	// When defined called with (methodName,callerDomain) when an unknown message is found
	this.methodNotFoundCallback = null;
	// When defined called with (methodName,callerDomain,securityToken) when an unauthorized message is called
	this.blockedMessageCallback = null;
}

XSSInterface.Listener.prototype = {
	
	/*
	 * call this to enable hostname to send messages to this listener
	 * @param hostname that may send messages
	 */
	allowDomain: function(hostname) {
		if(hostname.indexOf("://")==-1) hostname = "http://"+hostname;
		this.allowedDomains.push(hostname);
	},

	/*
	 * register a callback with a given name
	 * func must be a function reference
	 */
	registerCallback: function (name, func) {
		this.callbacks[name] = func;
		this.callbackNames.push(name);
	},
	
	/*
	 * As soon as this method is called the listener will respond to calls.
	 * This should be called from the window.onload event
	 */
	startEventLoop: function () {
		
		if(this.canPostMessage()) {
			document.addEventListener("message", this.makePostMessageHandler(), false);
			window.addEventListener("message", this.makePostMessageHandler(), false);
		}else if(this.canSameDomainMessage() || this.canHashMessage()) {
			if(!window.XSSInterfaceHashMap){
				window.XSSInterfaceHashMap = new Array();
				var me = this;
				window.XSSInterfaceCallback = function (param){
					var channelId = null;
					var value = null;
					if(param.location){
						var query  = new XSSInterface.Query(param);
						channelId = query.param("id");
						value = query.param("data");
					}else if(param.data){
						value = param.data;
						channelId = param.id;
					}
					if(channelId && value){
						var listener = window.XSSInterfaceHashMap[channelId];
						if(listener) listener.handleCustomMessage(value);
					}
				};
			}
			window.XSSInterfaceHashMap[this.channelId] = this;
		}			
	},	
	
	// private
	/*
	 * Determines whether we can use the postMessage-Interface
	 */
	canPostMessage:	 XSSInterface.canPostMessage,
	canSameDomainMessage: XSSInterface.canSameDomainMessage,
	canHashMessage:   XSSInterface.canHashMessage,
	
	// private
	/*
	 * Reads a message cookie. If successful, clears the cookie and parses its contents as JSON
	 */
	parse: function (json) {
		if(json && json != "") {
		 	json = new String(json);
			return JSON.parse(json);
		}
	},
	
	makePostMessageHandler: function () {
		var me = this;
		return function (event) {
			me.handlePostMessage(event)
		}
	},
	
	/*
	 * Handle a message send via window.postMessage() 
	 */
	handlePostMessage: function (event) {
		var data   = this.parse(event.data);
		XSSdebug("handlePostMessage with "+event.data);
		if(event.origin == data.from) this.execute(data);
	},
	
	handleCustomMessage: function (value) {
		var data   = this.parse(value);
		this.execute(data);
	},

	// private
	/*
	 * Executes a method.
	 * Throws an error if the security token provided by the message is wrong or if
	 * the callback name is unknown.
	 * Throws an error if the method name is unknown.
	 */
	execute: function (data) {
		if(!data) return;
		if(!this.authorizeCall(data)) {
			return; // do nothing
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
			if(this.methodNotFoundCallback) {
				this.methodNotFoundCallback(name, from);
				return;
			}
			throw("XSSInterface Error: unknown remote method ["+name+"] called by "+from);
		}
		
		// Get the actual function
		var func  = this.callbacks[name];
		

		var call_info = {
			name:   name,
			paras:  paras,
			from:   from
		};

		if(func != null) {
			// call the method. The methods receives the trasmitted paras as regular parameters
			// the method's this variable contains the call_info object
			func.apply(call_info, paras);
		}

	},
	// private
	/*
	 * checks whether this call is authorized
	 * Throws an error if the security token provided by the message is wrong or if
	 * the callback name is unknown.
	 */
	authorizeCall: function (data) {
		if(data.channelId == this.channelId){
			for(var i = 0; i < this.allowedDomains.length; i++) {
				if(this.allowedDomains[i] == data.from) {
					return true
				}
			}
		}
		if(this.blockedMessageCallback) {
			// Optional callback (Mostly for testing of errors)
			this.blockedMessageCallback(data.name, data.from)
		}
		XSSdebug("Bocked message from "+data.from)
		return false		
	}
};



/*
 * Class for performing cross domain javascript function calls.
 * 
 * @param targetDomain is the hostname to which call should be send.
 * @param pathToCookieSetterHTMLFile must be a path residing on targetDomain to the cookie_setter.html file that is provided by this library
 *  "http://" + targetDomain + pathToCookieSetterHTMLFile
 * @param channelId is an identifier that groups listeners and callers. If you have multiple iframes, create one channel for each of them.
 * @param win is the window or iframe to which calls are performed
 */
XSSInterface.Caller = function (targetDomain, pathToHash2parentFile, channelId, win) {
	this.scheduledCalls = [];
	this.lastCallTime = 0;
	
	this.domain = ((targetDomain.indexOf("://")==-1)?"http://":"")+targetDomain;
	this.win = win ? win : window.frames[channelId]
	
	this.channelId  = channelId ? channelId : "";
	
	if(this.canHashMessage()){
		this.pathToHash2parentFile = pathToHash2parentFile;
		
		this.iframeContainer = document.createElement("iframe");
		this.iframeContainer.setAttribute("src", this.domain + pathToHash2parentFile);
		this.iframeContainer.setAttribute("width", "1");
		this.iframeContainer.setAttribute("height", "1");
		this.iframeContainer.setAttribute("border", "0");
		this.iframeContainer.setAttribute("frameborder", "0");
		
		document.getElementsByTagName('body').item(0).appendChild(this.iframeContainer);		
	}
}

XSSInterface.Caller.prototype = {
	
	/*
	 * Call a method called name on the target domain.
	 * @param name Name of the method
	 * All extra parameters to will be forwarded to the remote method.
	 */
	call: function (name) {
		
		var args = [];
		for(var i = 1; i < arguments.length; i++) { // copy arguments, leave out first, because it is the function name
			XSSdebug("Arg: "+arguments[i]);
			args.push(arguments[i]);
		}
		
		var data = {
			name:  name,
			paras: args,
			from:  document.location.protocol+"//"+document.location.host,
			channelId: this.channelId
		};
		
		
		this.save(data);
	},

	// private
	/*
	 * Save a message cookie under the dall target domain
	 */
    save: function(data) {
		var message = this.serialize(data);
    	if(this.canPostMessage())
    		this.postMessage(this.win, message);
    	else if(this.canSameDomainMessage())
    		this.sendSameDomainMessage(this.win, message);
    	else if(this.canHashMessage())
    		this.sendHashMessage(this.win, message);
	},
	
	sendHashMessage: function (win, message) {
		XSSdebug("sendHashMessage "+message);
		var iframeName = (win==parent)?"parent":this.channelId;
		var src = this.domain + this.pathToHash2parentFile + '?id='+escape(this.channelId)+"&data="+escape(message)+"&"+(new Date().getMilliseconds())+"#"+iframeName;
		this.iframeContainer.setAttribute("src",src);
	},
	
	sendSameDomainMessage: function(win, message) {
		 if(win.XSSInterfaceCallback){
			XSSdebug("send "+message+" via window.XSSInterfaceCallback");
			return win.XSSInterfaceCallback({"data":message, "id":this.channelId});
		}
	},
	// private
	/* 
	 * Cross Browser postMessage()
	 */
	postMessage: function (win, message) {
		var targetOrigin = this.domain; // XXX extend api to specify scheme and port
		if(window.postMessage) { // HTML 5 Standard
			XSSdebug("send "+message+" via window.postMessage");
			return win.postMessage(message, targetOrigin);
		}else if(window.document && window.document.postMessage) { // Opera 9
			XSSdebug("send "+message+" via window.document.postMessage");
			return win.document.postMessage(message, targetOrigin);
		}
	},

	// private
	/*
	 * Turn the message data into JSON
	 */
	serialize: function (data) {
    	var str = JSON.stringify(data);
    	return str
    },
	
	canPostMessage:	 XSSInterface.canPostMessage,
	canSameDomainMessage: XSSInterface.canSameDomainMessage,
	canHashMessage: XSSInterface.canHashMessage
};

XSSInterface.Query = function (win) {
	var cur_win = (win)?win:window;
	this.queryString = cur_win.location.search;
	this.query       = this.parse();
}

XSSInterface.Query.prototype = {
	
	asHash: function () {
		return this.query;
	},
	
	param: function (name) {
		return this.query[name]
	},
	
	parse: function () {
		var query  = {};
		var search = this.queryString;
		var parts  = search.split("?");
		var search = parts[1]?parts[1]:"";
	
		parts      = search.split("&");
	
		for(var i = 0; i < parts.length; i++) {
			var pair = parts[i].split("=");
			query[unescape(pair[0])] = unescape(pair[1])
		}
		
		return query;
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
		log.innerHTML= html.substring(0,1000);
	} else {
		alert("XSSdebug : "+message);
	}
}