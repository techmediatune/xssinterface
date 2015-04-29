# Introduction #

xssinterface enables websites to expose a certain set of javascript callback methods to pages residing on different domains. The site specifies which methods may be called as well as which domains are allowed to call the methods.

# Synopsis #

Place this on the container page to call the method "hello" on a page residing on www.listener.com (In this example the container page resides on www.caller.com):

```
function sayHello() {
	var caller = new XSSInterface.Caller("www.listener.com","/xssinterface/html/cookie_setter.html","channel1");
	caller.call("hello", "Hello World")
}
```

Place this in the iframe (which in this examples resides on www.listener.com):

```
window.xssListener = new XSSInterface.Listener("1234567890","channel1");
// Allow calls from www.caller.com
window.xssListener.allowDomain("www.caller.com", "/xssinterface/html/cookie_setter.html", "/xssinterface/js/gears_listener.js");

// register a method under the name "hello"
window.xssListener.registerCallback("hello", function (msg) { alert(msg) } )
window.xssListener.startEventLoop()
```

[Example](http://www.avantaxx.de/xssinterface/examples/basic/)

# How it works? #

For Browsers that support it, we use the [postMessage()](http://developer.mozilla.org/en/docs/DOM:window.postMessage) interface.

If the Browser has [Google Gears](http://gears.google.com) installed, we use [Gears cross origin workers](http://code.google.com/apis/gears/api_workerpool.html).

For all other browsers, we use the following mechanism:

All sites that participate in the cross domain calls must provide an html file ([cookie\_setter.html](http://code.google.com/p/xssinterface/source/browse/trunk/html/cookie_setter.html)), that is provided by this library, that enables other domains to place a certain cookie under the domain of the site.

The library uses this mechanism to place cookies on the target domain that are then read and evaluated by the target page.

Pages must explicitly grant access to their domain by setting a security token cookie under a domain that is allowed to access the callbacks.

# Usage #

Lets assume the following:

http://www.caller.com hosts an iframe located at
http://www.listener.com

The following URLs return the file cookie\_setter.html from this library:

  * http://www.caller.com/cookie_setter.html
  * http://www.listener.com/cookie_setter.html

You might need to edit the file cookie\_setter.html to integrate the correct javascript file locations.

The following URL returns the file [gears\_listener.js](http://code.google.com/p/xssinterface/source/browse/trunk/js/gears_listener.js) from this library:
  * http://www.caller.com/gears_listener.js

## Caller Side ##

The following function calls the message "hello" with the parameter "Hello World" on the domain www.two.com:

```
function sayHello() {
	var caller = new XSSInterface.Caller("www.listener.com","/cookie_setter.html","channel1");
	caller.call("hello", "Hello World")
}
```

## Listener Side ##

We register an onload-handler that creates a cross domain message listener:

```
window.onload = function () {
	window.xssListener = new XSSInterface.Listener("1234567890","channel1");
	window.xssListener.allowDomain("www.caller.com", "/cookie_setter.html", "/gears_listener.js");

	window.xssListener.registerCallback("hello", function (msg) {alert(msg)} )
	window.xssListener.startEventLoop()
}
```

The listener defined a security token (123456789). This should be a cryptographically secure hash such as a hash of the users session id. Do not use the session id directly, because the token will be communicated to other domains. The parameter "channel1" tells the listener to respond only to messages on channel1.

The call to allowDomain() allows www.caller.com to call methods on this listener. The second parameter tells the listener where it finds the cookie\_setter.html on www.caller.com and the third parameter tells it where to find the gears\_listener.js file on www.caller.com.

registerCallback() registers a callback called "hello" that shows an alert box with its parameter when called.

And finally startEventLoop() tells the listener to start listening for calls.

### Disabling Google Gears ###

Usage of Google Gears triggers a one time permission request for each visitor. In case you want to avoid this, you can disable Gears support, by setting the variable XSSInterfaceEnableGoogleGearsSupport to false. (See the top of xssinterface.js)

# Further Reading #

  * [Security](Security.md)
  * BrowserIssues
  * [The Source](http://code.google.com/p/xssinterface/source/browse/trunk/js/xssinterface.js)