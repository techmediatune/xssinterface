Joose = function () {
	this.cc   = null;  // the current class
	this.top  = window;
	
};

Joose.prototype = {
	init: function () {
		Joose.Builders.each(function (func, name) {
			joose.top[name] = func
		});
	}
}

Joose.copyObject = function (source, target) {
	var keys = "";
	source.each(function (value, name) {  keys+=", "+name; target[name] = value })
	return target
};

var joose = new Joose();

Joose.Builders = {
	Class:	function (name) {
		
		var c = null;
		
		if(name) {
			var root       = joose.top;
			var nameString = new String(name);
			var parts      = nameString.split(".")
		
			for(var i = 0; i < parts.length; i++) {
				root = root[parts[i]]
			}
			c = root;
		}

		if(c == null) {
			var aClass      = new Joose.Class();

			var c           = aClass.createClass(name)
			if(name) {
				var root = joose.top;
				var n = new String(name);
				var parts = n.split(".");
				for(var i = 0; i < parts.length - 1; i++) {
					if(root[parts[i]] == null) {
						root[parts[i]] = {};
					}
					root = root[parts[i]]
				}
				root[parts[parts.length - 1]] = c
			}
			
		}
		joose.cc = c;
	},
	
	isa:	function (classObject) {
		joose.cc.meta.addSuperClass(classObject)
	},
	
	has:	function (name, props) {
		joose.cc.meta.addAttribute(name, props)
	},
	
	method: function (name, func, props) {
		joose.cc.meta.addMethod(name, func, props)
	},
	
	methods: function (map) {
		map.each(function (func, name) {
			joose.cc.meta.addMethod(name, func)
		})
	},
	
	rw: "rw",
	ro: "ro"
	 
};

Joose.bootstrap = function () {
	// Bootstrap
	var BOOT = new Joose.MetaClassBootstrap(); 

	Joose.MetaMetaClass = BOOT.createClass("Joose.MetaMetaClass");

	Joose.MetaMetaClass.meta.addNonJooseSuperClass("Joose.MetaClassBootstrap", BOOT)

	var METAMETA = new Joose.MetaMetaClass();

	Joose.MetaClass = METAMETA.meta.createClass("Joose.MetaClass")
	Joose.MetaClass.meta.addSuperClass(Joose.MetaMetaClass)
	
	var META = new Joose.MetaClass();

	Joose.Class = META.meta.createClass("Joose.Class")
	Joose.Class.meta.addSuperClass(Joose.MetaClass)
}

Joose.MetaClassBootstrap = function () {
	this.name				=    null;
	this.methodNames		=	 [];
	this.attributeNames		=	 ["name", "methodNames", "attributeNames", "methods", "parentClasses"];
	this.methods			=    {};
	this.parentClasses		= 	 [];
}
Joose.MetaClassBootstrap.prototype = {
	
	newMetaClass: function () {
		
		var me = this;
		var c  = Joose.copyObject(this, function () {});
		c.name = null;
		
		c.methodNames    = []
		c.attributeNames = []
		c.methods        = {}
		c.parentClasses  = []
		
		return c
	},
	
	createClass:	function (name) {
		
		var meta  = this.newMetaClass();
		meta.meta = this;
		
		var c     = function () {};
		
		c.prototype = {
			meta: meta
		};
		c.meta    = meta;
		if(name == null) {
			meta.name = "__anonymous__" 
		} else {
			meta.name = name;
		}
		meta.c = c;
		return c;
	},
	
	addNonJooseSuperClass: function (name, object) {
		
		var pseudoMeta  = new Joose.MetaClassBootstrap();
		var pseudoClass = pseudoMeta.createClass(name)
		
		object.each(function(value, name) {
			if(typeof(value) == "function") {
				pseudoClass.meta.addMethod(name, value)
			} else {
				pseudoClass.meta.addAttribute(name, {init: value})
			}
		})
		
		this.addSuperClass(pseudoClass);
	},
	
	addSuperClass:	function (classObject) {
		var me    = this;
		var names = classObject.meta.getMethodNames();
		
		//alert("Super"+me.name + " -> "+classObject.meta.name +"->" + names)
		
		names.each(function (name) {

			var m = classObject.meta.dispatch(name);
			
			me.addMethodObject(m.meta)
		})
		

		classObject.meta.attributeNames.each(function (value,name) {
			me.addAttribute(name, {init: value})
		})
		
		this.parentClasses.unshift(classObject)
	},
	
	isa:			function (classObject) {
		var name = classObject.meta.name
		for(var i = 0; i < this.parentClasses.length; i++) {
			if(this.parentClasses[i].meta.name == name) {
				return true
			}
		}
		return false
	},
	
	dispatch:		function (name) {
		return this.getMethodObject(name).asFunction()
	},
	
	addMethod:		 function (name, func, props) {
		var m = new Joose.Method(name, func, props);
		
		this.addMethodObject(m)
	},
	
	addMethodObject:		 function (method) {
		var m              = method;
		var name           = m.name();
		if(!this.methodNames.exists(name)) {
			this.methodNames.push(name);
		}
		this.methods[name] = m;
		
		this.c.prototype[name] = m.asFunction();
	},
	
	addAttribute:	 function (name, props) {
		var is = props.is;
		if(is == null) {
			is = props
		}
		if(is == "rw" || is == "ro") {
			this.addMethod("get"+name.uppercaseFirst(), function () {
				return this[name]
			});
		}
		if(is == "rw") {
			this.addMethod("set"+name.uppercaseFirst(), function (value) {
				this[name] = value
				return this;
			});
		}
		this.c.prototype[name] = null;
		if(props.init) {
			this.c.prototype[name] = props.init;
		}
		
		this.attributeNames.push(name)
	},
	
	getMethodObject: function (name) {
		return this.methods[name]
	},
	
	getMethodNames:	function () {
		return this.methodNames;
	}
};

Joose.Method = function (name, func, props) {
	this._name  = name;
	this._body  = func;
	this._props = props;
	
	func.meta   = this
}

Joose.Method.prototype = {
	name:	function () { return this._name },
	body:	function () { return this._body },
	props:	function () { return this._props },
	
	apply:	function (thisObject, args) {
		return this._body.apply(thisObject, args)
	},
	
	// allows wrapping
	asFunction: function () {
		var me = this
		return function () {
			var args = arguments;
			return me.apply(this, args)
		}
	},
	
	// direct call
	asFunction:	function () {
		return this._body
	}
}

Joose.bootstrap()
joose.init();

Class("Joose.Class");
methods({
	instantiate: function () {
		return new this.c();
	}
})
