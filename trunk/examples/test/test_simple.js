
var testCounter = 1;

var numTest     = 0;

function plan(num) {
	numTest = num;
}

function done() {
	if(testCounter - 1 == numTest) {
		diag("All Tests ran!")
	} else {
		diag("We missed a test!")
	}
}

function onErrorFail(e, errorStringPart, msg) {
	diag("Expected error: "+e)
	if(new String(e).indexOf(errorStringPart) != -1) {
		ok(true, msg)
	} else {
		diag("Error was not the expected. Should have include the string ["+errorStringPart+"]")
		ok(false, msg);
	}
}

function fail(func, errorStringPart, msg) {
	try {
		func()
		ok(false, msg)
	} catch (e) {
		onErrorFail(e)
	}
}

function nofail(func, msg) {
	try {
		func()
		ok(true, msg)
	} catch (e) {
		ok(false, msg);
		diag(e)
	}
}


function initializeTests() {
	var log = $("testLog");
	log.innerHTML = "";
	testCounter = 1;
}

function say(msg) {
	var log = $("testLog");
	log.innerHTML =  msg + "<br />\n" + log.innerHTML; 
}

function diag(msg) {
	say("<b># " + msg+"</b>")
}

function ok(bool, msg) {
	
	var output = "" + testCounter + " of " + numTest + (msg ? (" - " + msg) : "")
	if(bool) {
		say("OK "+output)
	} else {
		say("<span style='color: red'>NOT OK "+output+"</span>")
	}
	testCounter++
}

function isEq(a, b, msg) {
	ok(a == b, msg)
}

function isNotEq(a, b, msg) {
	ok(a != b, msg)
}

function jsonEq(a, b, msg) {
	ok(JSON.stringify(a) == JSON.stringify(b), msg)
}