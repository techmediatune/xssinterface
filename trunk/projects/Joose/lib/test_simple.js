
var testCounter = 1;

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
	log.innerHTML = msg + "<br />\n" +log.innerHTML
}

function diag(msg) {
	say("# " + msg)
}

function ok(bool, msg) {
	
	var output = "" + testCounter + (msg ? (" - " + msg) : "")
	if(bool) {
		say("OK "+output)
	} else {
		say("<span style='color: red'>NOT OK "+output+"</span>")
	}
	testCounter++
}

function dump(o) {
	o.each(function(value,name) {
		say(""+name+" -> "+value)
	})
}

function isNull(v, msg) {
	if(v == null) {
		ok(true, msg)
	} else {
		ok(false, msg)
	}
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