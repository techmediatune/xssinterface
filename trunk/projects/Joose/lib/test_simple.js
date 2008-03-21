
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
		say("<pre>"+name+" -> "+value+"</pre>")
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

function endTests() {
	say("<hr />")
}

function doTestFile(url) {
	
	var script = new Joose.SimpleRequest().getText(url);
	
	script = "(function () {"+script+"})()"
	
	eval(script);
	
	/*var script = document.createElement("script");
	script.src = url;
	document.body.appendChild(script)*/
}