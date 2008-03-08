
function bind() {
	window.xssCaller1  = new XSSInterface.Caller("it2.test.avantaxx.de","/xssinterface/html/cookie_setter.html","iframe1");
	window.xssCaller2  = new XSSInterface.Caller("it2.test.avantaxx.de","/xssinterface/html/cookie_setter.html","iframe2");
	
	window.xssListener = new XSSInterface.Listener("1234567890","return");
    window.xssListener.allowDomain("it2.test.avantaxx.de", "/xssinterface/html/cookie_setter.html", "/xssinterface/js/gears_listener.js");

    window.xssListener.registerCallback("ok", ok );
    window.xssListener.registerCallback("isEq", isEq );
    window.xssListener.registerCallback("isNotEq", isNotEq );
    window.xssListener.registerCallback("jsonEq", jsonEq );
    window.xssListener.registerCallback("nextBlock", nextBlock );
}

function runTest() {
	initializeTests()

	$('runButton').value = "reload to run again"
	
	diag("postMessage Support "  + (XSSInterfaceEnablePostMessageSupport ? "On" : "Off"))
	diag("Google Gears Support " + (XSSInterfaceEnableGoogleGearsSupport ? "On" : "Off"))
	
	runTestOnce()

}

function runTestOnce() {
	
	plan(16)
	
	diag("Sanity")
	ok(window.xssCaller1,   "We have a caller");
	ok(window.xssCaller2,   "We have another caller")
	ok(window.xssListener,  "We have a Listener for return messages")
	ok(window.xssListener.startEventLoop, "We could start the event loop")
	window.xssListener.startEventLoop();
	diag("Starting loop, waiting 1 seconds");
	
	// 
	window.setTimeout(function () {
		diag("Round trip tests")
		window.xssCaller1.call("identity", "ok", true, "We can make a round trip message (Call somebody and get a return)");
		window.xssCaller1.call("identity", "isEq", 1, 1,  "Integers are kept intact");
		window.xssCaller1.call("identity", "isEq", 1.0, 1.0,  "Floats are kept intact");
		window.xssCaller1.call("identity", "isEq", false, false,  "Bools are kept intact");
		window.xssCaller1.call("identity", "isEq", "hallo", "hallo", "Strings are kept intact");
		window.xssCaller1.call("identity", "isNotEq", "hallo", "ciao", "Different Strings are different");
		window.xssCaller1.call("identity", "isNotEq", 1, 2, "Different Numbers are different");
		window.xssCaller1.call("identity", "jsonEq", {}, {}, "Simple hashes are kept intact");
		window.xssCaller1.call("identity", "jsonEq", [], [], "Simple arrays are kept intact");
		var t = {a:[1,"2",[3,{4: 5}]]};
		window.xssCaller1.call("identity", "jsonEq", t, t, "Nested datastructure are kept intact");
		
		
		window.xssListener.methodNotFoundCallback = function (name) { isEq(name, "unregisteredMethod", "Unregistered method not called: "+name) }
		window.xssCaller1.call("identity", "unregisteredMethod");
		
		NEXT(function () {
	
			window.xssListener.methodNotFoundCallback = null
	
			// block messages from unauthorized recipients
			window.xssListener.securityToken  = "somethingElse";
			window.xssListener.allowedDomains = ["somethingElse.com"]
			window.xssListener.blockedMessageCallback = function (name) { ok(true, "Unauthorized message blocked: "+name) }
			window.xssCaller1.call("identity", "ok", false, "Unauthorized message blocked");
		})
		
	}, 1000);
}


// delay execution until after all previous calls completed
function NEXT(func) {
	window.nextTest = func
	window.xssCaller1.call("identity", "nextBlock")
}

function nextBlock() {
	var n = window.nextTest;
	window.nextTest = null;
	n();
}


