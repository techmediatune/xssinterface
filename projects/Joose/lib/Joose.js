Joose = function () {
	this.cc              = null;  // the current class
	this.currentModule   = null
	this.top             = window;
	this.globalObjects   = [];
};


Joose.A = {};
Joose.A.each = function (array, func) {
	for(var i = 0; i < array.length; i++) {
		func(array[i], i)
	}
}
Joose.A.exists = function (array, value) {
	for(var i = 0; i < array.length; i++) {
		if(array[i] == value) {
			return true
		}
	}
	return false
}
Joose.A.concat = function (source, array) {
	source.push.apply(source, array)
	return source
}

Joose.A.grep = function (array, func) {
	var a = [];
	Joose.A.each(array, function (t) {
		if(func(t)) {
			a.push(t)
		}
	})
	return a
}
Joose.S = {};
Joose.S.uppercaseFirst = function (string) { 
	var first = string.substr(0,1);
	var rest  = string.substr(1,string.length-1);
	first = first.toUpperCase()
	return first + rest;
}

Joose.O = {};
Joose.O.each = function (object, func) {
	for(var i in object) {
		func(object[i], i)
	}
}

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
		Joose.O.each(Joose.Builders, function (func, name) {
			joose.top[name] = func
		});
	},
	components: function () {
		return [
			"Joose.Builders",
			"Joose.Class",
			"Joose.Method",
			"Joose.ClassMethod",
			"Joose.Method",
			"Joose.Attribute",
			"Joose.Role",
			"Joose.SimpleRequest",
			"Joose.Gears",
			"Joose.Storage",
			"Joose.Storage.Unpacker",
			"Joose.Decorator",
			"Joose.Module"
		]
	},

	loadComponents: function (basePath) {
		var html = "";
		Joose.A.each(this.components(), function (name) {
			var url    = ""+basePath + "/" + name.split(".").join("/") + ".js";
			html += '<script type="text/javascript" src="'+url+'"></script>'
		})
		document.write(html)
	}
}

Joose.copyObject = function (source, target) {
	var keys = "";
	Joose.O.each(source, function (value, name) {  keys+=", "+name; target[name] = value })
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
	Joose.Builders.joosify("Joose.Attribute", Joose.Attribute)
}

Joose.MetaClassBootstrap = function () {
	this._name			  = "Joose.MetaClassBootstrap";
	this.methodNames	  =	[];
	this.attributeNames   =	["_name", "methodNames", "attributeNames", "methods", "parentClasses", "roles", "c"];
	this.attributes       = {},
	this.methods		  = {};
	this.parentClasses	  = [];
	this.roles            = [];
}
Joose.MetaClassBootstrap.prototype = {
	
	className: function () {
		return this._name
	},
	
	getName: function () {
		return this.className()
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
		c.attributes     = {}
		
		return c
	},
	
	createClass:	function (name, optionalClassObject, optionalModuleObject) {
		
		var meta  = this.newMetaClass();
		meta.meta = this;
		
		var c;
		
		if(optionalClassObject) {
			c = optionalClassObject
		} else {
			c = this.defaultClassFunctionBody()
			
			if(optionalModuleObject) {
				optionalModuleObject.addElement(c)
				// meta.setModule(optionalModuleObject)
			}
		}
		
		c.prototype.meta = meta
		c.meta    = meta;
		if(name == null) {
			meta._name = "__anonymous__" 
		} else {
			var className = name;
			if(optionalModuleObject) {
				className = optionalModuleObject.getName() + "." + name
			}
			meta._name = className;
		}
		meta.c = c;
		
		// store them in the global object if they have no namespace
		// They will end up in the Module __JOOSE_GLOBAL__
		if(!optionalModuleObject) {
			// Because the class Joose.Module might not exist yet, we use this temp store
			// that will later be in the global module
			joose.globalObjects.push(c)
		}
		
		meta.addInitializer()
		meta.addToString()
		return c;
	},
	
	defaultClassFunctionBody: function () {
		var f = function () {
			this.initialize.apply(this, arguments);
		};
		f.toString = function () {
			return this.meta.className()
		}
		return f;
	},
	
	addToString: function () {
		this.addMethod("toString", function () {
			return "a "+ this.meta.className()
		})
	},
	
	addInitializer: function () {
		if(!this.c.prototype.initialize) {
			this.addMethod("initialize", this.initializer())
		}
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
		
		Joose.O.each(object, function(value, name) {
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
		
		Joose.A.each(names, function (name) {
			var m = classObject.meta.dispatch(name);
			me.addMethodObject(m.meta)
		})
	},
	
	addSuperClass:	function (classObject) {
		var me    = this;
		
		this._fixMetaclassIncompatability(classObject)
		
		this.importMethods(classObject)		
		
		Joose.O.each(classObject.meta.attributes, function (attr, name) {
			me.addAttribute(name, attr.getProps())
		})
		
		this.parentClasses.unshift(classObject)
	},
	
	_fixMetaclassIncompatability: function (superClass) {
		
		var superMeta     = superClass.meta.meta;
		var superMetaName = superMeta.className();
		
		if(
		  superMetaName == "Joose.Class"         ||
		  superMetaName == "Joose.MetaMetaClass" || 
		  superMetaName == "Joose.MetaClassBootstrap") {
			return
		}
		
		// we are compatible
		if(this.meta.meta.isa(superMeta)) {
			return
		}
		
		// fix this into becoming a superMeta
		var patched = superMeta.meta.instantiate(this);
		
		for(var i in patched) {
			this[i] = patched[i]
		}
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
		if(!Joose.A.exists(this.methodNames, name)) {
			this.methodNames.push(name);
		}
		this.methods[name] = m;
		
		method.addToClass(this.c)
	},
	
	addAttribute:	 function (name, props) {
		
		var at = new Joose.Attribute(name, props);
		
		at.apply(this.c)
	},
	
	getAttributes: function () {
		return this.attributes
	},
	
	getAttribute: function (name) {
		return this.attributes[name]
	},
	
	setAttribute: function (name, attributeObject) {
		return this.attributes[name] = attributeObject
	},
	
	getMethodObject: function (name) {
		return this.methods[name]
	},
	
	getAttributeNames: function () {
		return this.attributeNames;
	},
	
	getInstanceMethods: function () {
		var a = [];
		Joose.O.each(this.methods, function (m) {
			if(!m.isClassMethod()) {
				a.push(m)
			}
		})
		return a
	},
	
	getClassMethods: function () {
		var a = [];
		Joose.O.each(this.methods, function (m) {
			if(m.isClassMethod()) {
				a.push(m)
			}
		})
		return a
	},

	getSuperClasses:	function () {
		return this.parentClasses;
	},
	
	getRoles:	function () {
		return this.roles;
	},
	
	getMethodNames:	function () {
		return this.methodNames;
	}
};

Joose.Attribute = function (name, props) {
	this.initialize(name, props)
}

Joose.Attribute.prototype = {
	
	_name:  null,
	_props: null,
	
	getName:	function () { return this._name },
	getProps:	function () { return this._props },
	
	initialize: function (name, props) {
		this._name  = name;
		this.setProps(props);
	},
	
	setProps: function (props) {
		if(props) {
			this._props = props
		} else {
			this._props = {};
		}
	},
	
	addSetter: function (classObject) {
		var meta  = classObject.meta;
		var name  = this.getName();
		var props = this.getProps();
		
		var isa   = props.isa;

		var func;
		if(isa) {
			func = function (value) {
				if(!value || !value.meta) {
					throw "The attribute "+name+" only accepts values that have a meta object."
				}
				// TODO add does
				if(!value.meta.isa(isa)) {
					throw "The attribute "+name+" only accepts values that are objects of type "+isa.meta.className()+"."
				}
				this[name] = value
				return this;
			}
		} else {
			func = function (value) {
				this[name] = value
				return this;
			}
		}
		meta.addMethod("set"+Joose.S.uppercaseFirst(this.toPublicName()), func);
	},
	
	addGetter: function (classObject) {
		var meta  = classObject.meta;
		var name  = this.getName();
		var props = this.getProps();
		
		meta.addMethod("get"+Joose.S.uppercaseFirst(this.toPublicName()), function () {
			return this[name]
		});
	},
	
	isPrivate: function () {
		return this.getName().charAt(0) == "_"
	},
	
	toPublicName: function () {
		var name = this.getName();
		if(this.isPrivate()) {
			return name.substr(1)
		}
		return name
	},
	
	handleIs: function (classObject) {
		var meta  = classObject.meta;
		var name  = this.getName();
		var props = this.getProps();
		
		var is    = props.is;

		if(is == "rw" || is == "ro") {
			this.addGetter(classObject);
		}
		if(is == "rw") {
			this.addSetter(classObject)
		}
	},
	
	handleInit: function (classObject) {
		var props = this.getProps();
		var name  = this.getName();
		
		classObject.prototype[name]     = null;
		if(props.init != null) {
			classObject.prototype[name] = props.init;
		}
	},
	
	handleProps: function (classObject) {
		this.handleIs(classObject);
		this.handleInit(classObject)
	},
	
	apply: function (classObject) {
		
		var meta  = classObject.meta;
		var name  = this.getName();
		
		this.handleProps(classObject)
		
		meta.attributeNames.push(name)
		
		meta.setAttribute(name, this)
		meta.attributes[name] = this;
	}
}

Joose.Method = function (name, func, props) {
	this.initialize(name, func, props)
}

Joose.Method.prototype = {
	
	_name: null,
	_body: null,
	_props: null,
	
	getName:	function () { return this._name },
	getBody:	function () { return this._body },
	getProps:	function () { return this._props },
	
	initialize: function (name, func, props) {
		this._name  = name;
		this._body  = func;
		this._props = props;
		
		func.name = "test"+name
	
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








	


