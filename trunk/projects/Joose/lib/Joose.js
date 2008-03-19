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



Joose.emptyFunction = function () {};

var joose = new Joose();

Joose.Builders = {
	Class:	function (name, props) {
		
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
			
			var metaClass   = Joose.Class;
			if(props && props.meta) {
				metaClass = props.meta
				delete props.meta
			}
			
			var aClass      = new metaClass();

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
		if(props) {
			props.each(function (value, name) { 
				var builder = Joose.Builders[name];
				if(!builder) {
					throw "Called invalid builder "+name+" while creating class "+c.meta.name
				}
				var paras   = value;
				if(!paras.length) {
					paras = [value]
				}
				builder.apply(Joose.Builder, paras)
			})
		}
	},
	
	joosify: function (standardClassName, standardClassObject) {
		var c    = standardClassObject;
		var metaClass = new Joose.Class();
		c        = metaClass.createClass(standardClassName, c)
	
		var meta = c.meta;
	
		for(var name in standardClassObject.prototype) {
			var value = c.prototype[name]
			if(typeof(value) == "function") {
				meta.addMethod(name, value)
			} else {
				meta.addAttribute(name, {init: value})
			}
		}
	},
	
	requires:	function (methodName) {
		if(!joose.cc.meta.meta.isa(Joose.Role)) { // XXX should this be does?
			throw("Keyword 'requires' only available classes with a meta class of type Joose.Role")
		}
		joose.cc.meta.addRequirement(methodName)
	},
	
	check:	function () {
		joose.cc.meta.validateClass()
	},
	
	isa:	function (classObject) {
		joose.cc.meta.addSuperClass(classObject)
	},
	
	does:	function (roleClass) {
		joose.cc.meta.addRole(roleClass)
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

	Joose.MetaClass = BOOT.createClass("Joose.MetaMetaClass");

	Joose.MetaClass.meta.addNonJooseSuperClass("Joose.MetaClassBootstrap", BOOT)
	
	Joose.MetaClass.meta.addMethod("initialize", function () { this.name = "Joose.MetaClass" })

	var META = new Joose.MetaClass();
	
	Joose.Class = META.createClass("Joose.Class")
	Joose.Class.meta.addSuperClass(Joose.MetaClass);
	
	Joose.Class.meta.addMethod("initialize", function () { this.name = "Joose.Class" })
	
	Joose.Builders.joosify("Joose.Method", Joose.Method)
}

Joose.MetaClassBootstrap = function () {
	this.name				=    "Joose.MetaClassBootstrap";
	this.methodNames		=	 [];
	this.attributeNames		=	 ["name", "methodNames", "attributeNames", "methods", "parentClasses"];
	this.methods			=    {};
	this.parentClasses		= 	 [];
	this.roles              =    [];
}
Joose.MetaClassBootstrap.prototype = {
	
	newMetaClass: function () {
		
		var me = this;
		var c  = Joose.copyObject(this, function () {});
		c.name = this.name
		
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
			meta.name = "__anonymous__" 
		} else {
			meta.name = name;
		}
		meta.c = c;
		
		meta.addMethod("initialize", Joose.emptyFunction)
		return c;
	},
	
	addRole: function (roleClass) {
		this.roles.push(roleClass);
		roleClass.meta.exportTo(this.getClassObject())
	},
	
	getClassObject: function () {
		return this.c
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
		var name = classObject.meta.name
		// Same type
		if(this.name == name) {
			return true
		}
		// Look up into parent classes
		for(var i = 0; i < this.parentClasses.length; i++) {
			var parent = this.parentClasses[i].meta
			if(parent.name == name) {
				return true
			}
			if(parent.isa(classObject)) {
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
		if(props && props.init) {
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
	},
	
	can: function (methodName) {
		return this.methodNames.exists(methodName)
	},
	
	does: function (classObject) {
		return classObject.meta.implementsMyMethods(this.getClassObject())
	},
	
	implementsMyMethods: function (classObject) {
		var complete = true
		this.getMethodNames().each(function (value) {
			var found = classObject.meta.can(value)
			if(!found) {
				complete = false
			}
		})
		return complete
	},
	
	// Checks whether class is valid
	validateClass: function () {
		var c  = this.getClassObject();
		var me = this;
		this.roles.each(function(role) {
			if(!role.meta.isImplementedBy(c)) {
				throw("Class "+me.name+" does not fully implement the role "+role.meta.name)
			}
		})
	}
	
})


/*
 * An Implementation of Traits
 * see http://www.iam.unibe.ch/~scg/cgi-bin/scgbib.cgi?query=nathanael+traits+composable+units+ecoop
 */
Class("Joose.Role");
isa(Joose.Class);
has("requiresMethodNames")
methods({
	initialize: function () {
		this.name                = "Joose.Role"
		this.requiresMethodNames = [];
	},
	
	addRequirement: function (methodName) {
		this.requiresMethodNames.push(methodName)
	},
	
	exportTo: function (classObject) {
		classObject.meta.importMethods(this.getClassObject())
	},
	
	hasRequiredMethods: function (classObject) {
		var complete = true
		this.requiresMethodNames.each(function (value) {
			var found = classObject.meta.can(value)
			if(!found) {
				complete = false
			}
		})
		return complete
	},
	
	isImplementedBy: function (classObject) {
		
		var complete = this.hasRequiredMethods(classObject);
	
		if(complete) {
			complete = this.implementsMyMethods(classObject);
		}
		return complete
	}
})
	


