
var totalTestCounter = 0;
var totalTestErrors  = 0;
var totalTestCount   = 0;

function nofail(func, msg) {
	try {
		func()
		ok(true, msg)
	} catch (e) {
		ok(false, msg);
		diag(e)
	}
}

function fail(func, errorMsgPart, msg) {
	try {
		func()
	} catch(e) {
		if(e.indexOf(errorMsgPart != -1)) {
			ok(true, msg)
			return
		} else {
			ok(false, msg + " [Wrong error: "+e+"]")
			return
		}
	}
	ok(false, msg + " [No error]")
}


function plan(count) {
	testCount   = count
	testCounter = 0;
	testErrors  = 0;
	say("<hr />")
}

function say(msg) {
	var log = $("testLog");
	log.innerHTML = msg + "<br />\n" +log.innerHTML
}

function diag(msg) {
	say("# " + msg)
}

function ok(bool, msg) {
	
	var output = "" + (testCounter+1) + (msg ? (" - " + msg) : "")
	if(bool) {
		say("OK "+output)
	} else {
		say("<span style='color: red'>NOT OK "+output+"</span>")
		testErrors++
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

function testReport() {
	say("<hr />")
	var color = "green";
	if(totalTestErrors > 0) {
		color = "red"
	}
	say("Tests done.")
	say("<strong><span style='color:"+color+"'>Ran "+totalTestCounter+" of "+totalTestCount+" tests and failed "+totalTestErrors+" tests.</span></strong>")
}

function endTests() {
	if(testCount) {
		var message = "All tests successfull.";
		if(testErrors > 0) {
			totalTestErrors += testErrors
			message = ""+testErrors + " tests failed."
		}
		totalTestCount   += testCount
		totalTestCounter += testCounter
		diag("Ran "+testCounter+" of "+testCount+" tests. " + message)
		
	}
}

function doTestFile(url) {
	
	/*var script = new Joose.SimpleRequest().getText(url);
	
	script = "(function () {"+script+"})()"
	
	eval(script);
	*/
	var script = document.createElement("script");
	script.src = url;
	document.body.appendChild(script)
}