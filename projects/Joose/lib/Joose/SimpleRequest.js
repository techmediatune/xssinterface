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