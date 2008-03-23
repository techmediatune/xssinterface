Joose = function () {
	this.cc   = null;  // the current class
	this.top  = window;
	
};

Joose.prototype = {
	
	/*
	 * Differentiates between instances and classes
	 */
	isInstance: function(obj) {
		if(!obj.meta) {
			throw "isInstance only works with Joose objects and classes."
		}
		if(obj.constructor === obj.meta.c) {
			return true
		}
		return false
	},
	
	init: function () {
		Joose.Builders.each(function (func, name) {
			joose.top[name] = func
		});
	},
	components: function () {
		return [
			"Joose.Builders",
			"Joose.Class",
			"Joose.Method",
			"Joose.ClassMethod",
			"Joose.Role",
			"Joose.Method",
			"Joose.SimpleRequest",
			"Joose.Gears",
			"Joose.Storage",
			"Joose.Storage.Unpacker"
		]
	},
	loadComponents: function (basePath) {
		var html = "";
		this.components().each(function (name) {
			var url    = ""+basePath + "/" + name.split(".").join("/") + ".js";
			html += '<script type="text/javascript" src="'+url+'"></script>'
		})
		document.write(html)
	}
}

Joose.copyObject = function (source, target) {
	var keys = "";
	source.each(function (value, name) {  keys+=", "+name; target[name] = value })
	return target
};



Joose.emptyFunction = function () {};

var joose = new Joose();



Joose.bootstrap = function () {
	// Bootstrap
	var BOOT = new Joose.MetaClassBootstrap(); 

	Joose.MetaClass = BOOT.createClass("Joose.MetaMetaClass");

	Joose.MetaClass.meta.addNonJooseSuperClass("Joose.MetaClassBootstrap", BOOT)
	
	Joose.MetaClass.meta.addMethod("initialize", function () { this._name = "Joose.MetaClass" })

	var META = new Joose.MetaClass();
	
	Joose.Class = META.createClass("Joose.Class")
	Joose.Class.meta.addSuperClass(Joose.MetaClass);
	
	Joose.Class.meta.addMethod("initialize", function () { this._name = "Joose.Class" })
}

Joose.bootstrap2 = function () {
	// Turn Joose.Method into a Joose.Class object
	Joose.Builders.joosify("Joose.Method", Joose.Method)
}

Joose.MetaClassBootstrap = function () {
	this._name			  = "Joose.MetaClassBootstrap";
	this.methodNames	  =	[];
	this.attributeNames   =	["_name", "methodNames", "attributeNames", "methods", "parentClasses"];
	this.methods		  = {};
	this.parentClasses	  = [];
	this.roles            = [];
}
Joose.MetaClassBootstrap.prototype = {
	
	className: function () {
		return this._name
	},
	
	newMetaClass: function () {
		
		var me  = this;
		var c   = Joose.copyObject(this, function () {});
		c._name = this._name
		
		c.methodNames    = []
		c.attributeNames = []
		c.methods        = {}
		c.parentClasses  = []
		c.roles          = []
		
		return c
	},
	
	createClass:	function (name, optionalClassObject) {
		
		var meta  = this.newMetaClass();
		meta.meta = this;
		
		var c;
		
		if(optionalClassObject) {
			c = optionalClassObject
		} else {
			c     = function () {
				this.initialize.apply(this, arguments);
			};
		}
		
		c.prototype.meta = meta
		c.meta    = meta;
		if(name == null) {
			meta._name = "__anonymous__" 
		} else {
			meta._name = name;
		}
		meta.c = c;
		
		if(!c.prototype.initialize) {
			meta.addMethod("initialize", this.initializer())
		}
		return c;
	},
	
	initializer: function () {
		return function (paras) {
			if(paras) {
				var names = this.meta.getAttributeNames();
				for(var i = 0; i < names.length; i++) {
					var name = names[i];
					if(typeof paras[name] != "undefined") {
						this[name] = paras[name]
					} 
				}
			}
		}
	},
	
	addRole: function (roleClass) {
		this.roles.push(roleClass);
		roleClass.meta.apply(this.getClassObject())
	},
	
	getClassObject: function () {
		return this.c
	},
	
	classNameToClassObject: function (className) {
		var top    = joose.top;
		var parts  = className.split(".");
		var object = top;
		for(var i = 0; i < parts.length; i++) {
			var part = parts[i];
			object   = object[part];
			if(!object) {
				throw "Unable to find class "+className
			}
		}
		return object
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
	
	importMethods: function (classObject) {
		var me    = this;
		var names = classObject.meta.getMethodNames();
		
		//alert("Super"+me.name + " -> "+classObject.meta.name +"->" + names)
		
		names.each(function (name) {
			var m = classObject.meta.dispatch(name);
			me.addMethodObject(m.meta)
		})
	},
	
	addSuperClass:	function (classObject) {
		var me    = this;
		
		this.importMethods(classObject)		

		classObject.meta.attributeNames.each(function (name) {
			var value = classObject.prototype[name]
			me.addAttribute(name, {init: value})
		})
		
		this.parentClasses.unshift(classObject)
	},
	
	isa:			function (classObject) {
		var name = classObject.meta.className()
		// Same type
		if(this.className() == name) {
			return true
		}
		// Look up into parent classes
		for(var i = 0; i < this.parentClasses.length; i++) {
			var parent = this.parentClasses[i].meta
			if(parent.className() == name) {
				return true
			}
			if(parent.isa(classObject)) {
				return true
			}
		}
		return false
	},
	
	wrapMethod:  function (name, wrappingStyle, func, notPresentCB) {
		
		var orig = this.getMethodObject(name);
		if(orig) {
			this.addMethodObject( orig[wrappingStyle](func) )
		} else {
			if(notPresentCB) {
				notPresentCB()
			} else {
				throw "Unable to apply "+wrappingStyle+" method modifier because method "+name+" does not exist"
			}
		}
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
		var name           = m.getName();
		if(!this.methodNames.exists(name)) {
			this.methodNames.push(name);
		}
		this.methods[name] = m;
		
		method.addToClass(this.c)
	},
	
	addAttribute:	 function (name, props) {
		var is = props ? props.is : props;

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
		if(props && props.init != null) {
			this.c.prototype[name] = props.init;
		}
		
		this.attributeNames.push(name)
	},
	
	getMethodObject: function (name) {
		return this.methods[name]
	},
	
	getAttributeNames: function () {
		return this.attributeNames;
	},
	
	getMethodNames:	function () {
		return this.methodNames;
	}
};

Joose.Method = function (name, func, props) {
	this.initialize(name, func, props)
}

Joose.Method.prototype = {
	getName:	function () { return this._name },
	getBody:	function () { return this._body },
	getProps:	function () { return this._props },
	
	initialize: function (name, func, props) {
		this._name  = name;
		this._body  = func;
		this._props = props;
	
		func.meta   = this
	},
	
	isClassMethod: function () { return false },
	
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
	
	addToClass: function (c) {
		c.prototype[this.getName()] = this.asFunction()
	},
	
	// direct call
	asFunction:	function () {
		return this._body
	}
}

Joose.bootstrap()








	


