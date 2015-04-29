The xssinterface javascript library enables communication of multiple pages (or pages and iframes) via javascript functions across domain boundaries. This may be useful for websites that want to expose a limited javascript interface to embedded widgets.

xssinterface is _not_ a library to perform XSS attacks. To the contrary, it enables javascript messaging between pages from different origins using explicit white-list authorization to prevent XSS security holes.

xssinterface works in all browsers that support the postMessage() interface and implements a fallback mechanism that works in most current browsers.

  * [Demo-Application](http://www.avantaxx.de/xssinterface/examples/widget/)
  * [Documentation](Documentation.md)
  * [Security](Security.md)
  * [BrowserIssues](BrowserIssues.md)
  * [WorkaroundIdeas](WorkaroundIdeas.md)
  * [AutomatedTests](AutomatedTests.md)

PS: If you want a commit bit, feel free to ask :)