
// Low-Level HTTP Request
Class("Joose.SimpleRequest", {
	has: {_req: {}},
	methods: {
		initialize: function () {
			if (window.XMLHttpRequest) {
        		this._req = new XMLHttpRequest();
    		} else {
        		this._req = new ActiveXObject("Microsoft.XMLHTTP");
    		}
		},
		getText: function (url) {
        	this._req.open("GET", url, false);
        	try {
        	    this._req.send(null);
        	    if (this._req.status == 200 || this._req.status == 0)
        	        return this._req.responseText;
        	} catch (e) {
        	    throw("File not found: " + url);
        	    return null;
        	};

        	throw("File not found: " + url);
        	return null;
    	}
	}
})


Class("Joose.Gears", {
	isa: Joose.Class,
	has: {
		wp: {  },
		calls: { init: {} },
		callIndex: { init: 0 }
	},
	
	methods: {
		initialize: function () {
			JooseGearsInitializeGears() 
			this.wp = google.gears.factory.create('beta.workerpool');
			var me = this;
			this.wp.onmessage = function (a,b,message) {
				var paras  = JSON.parse(message.text);
				var cbName = paras.to;
				var ret    = paras.ret;
				var object = me.calls[paras.index];
				object[cbName].call(object, ret)
				delete me.calls[paras.index]
			}
		},
		addWorker:		 function (name, func, props) {
			
			var json = new Joose.SimpleRequest().getText("json2.js")
				
			var source = "function aClass () {}; aClass.prototype."+name+" = "+func.toString()+"\n\n"+
			  "var wp = google.gears.workerPool\n" +
			  "wp.onmessage = function (a,b,message) {\n"+
			  "var paras = JSON.parse(message.text)\n"+
			  "var o = new aClass(); var ret = o."+name+".apply(o, paras.args); wp.sendMessage(JSON.stringify({ ret: ret, to: paras.cbName, index: paras.index }), message.sender)"+
			  "\n}\n\n";
		
			
			source += json
			
			var wp      = this.wp;
			
			var childId = wp.createWorker(source)

			var cbName  = "on"+name.uppercaseFirst()
			
			var me      = this
				
			var wrapped = function () {
				var message = JSON.stringify({ args: arguments, cbName: cbName, index: me.callIndex })
				wp.sendMessage(message, childId);
				me.calls[me.callIndex] = this
				me.callIndex++
				
			}
			this.addMethod(name, wrapped, props)

		}
	}
})

// Copyright 2007, Google Inc.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//  1. Redistributions of source code must retain the above copyright notice,
//     this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice,
//     this list of conditions and the following disclaimer in the documentation
//     and/or other materials provided with the distribution.
//  3. Neither the name of Google Inc. nor the names of its contributors may be
//     used to endorse or promote products derived from this software without
//     specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
// EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
// OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
// OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// Sets up google.gears.*, which is *the only* supported way to access Gears.
//
// Circumvent this file at your own risk!
//
// In the future, Gears may automatically define google.gears.* without this
// file. Gears may use these objects to transparently fix bugs and compatibility
// issues. Applications that use the code below will continue to work seamlessly
// when that happens.

// Sorry Google for modifying this :) 
function JooseGearsInitializeGears() {
  // We are already defined. Hooray!
  if (window.google && google.gears) {
    return;
  }

  var factory = null;

  // Firefox
  if (typeof GearsFactory != 'undefined') {
    factory = new GearsFactory();
  } else {
    // IE
    try {
      factory = new ActiveXObject('Gears.Factory');
      // privateSetGlobalObject is only required and supported on WinCE.
      if (factory.getBuildInfo().indexOf('ie_mobile') != -1) {
        factory.privateSetGlobalObject(this);
      }
    } catch (e) {
      // Safari
      if (navigator.mimeTypes["application/x-googlegears"]) {
        factory = document.createElement("object");
        factory.style.display = "none";
        factory.width = 0;
        factory.height = 0;
        factory.type = "application/x-googlegears";
        document.documentElement.appendChild(factory);
      }
    }
  }

  // *Do not* define any objects if Gears is not installed. This mimics the
  // behavior of Gears defining the objects in the future.
  if (!factory) {
    return;
  }

  // Now set up the objects, being careful not to overwrite anything.
  //
  // Note: In Internet Explorer for Windows Mobile, you can't add properties to
  // the window object. However, global objects are automatically added as
  // properties of the window object in all browsers.
  if (!window.google) {
    google = {};
  }

  if (!google.gears) {
    google.gears = {factory: factory};
  }
}


