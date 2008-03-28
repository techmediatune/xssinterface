Joose.Builders = {
	Module: function (name, functionThatCreateClassesAndRoles) {
		Joose.Module.setup(name, functionThatCreateClassesAndRoles)
	},
	Class:	function (name, props) {
		
		var c = null;
		
		if(name) {
			var className  = name;
			if(joose.currentModule) {
				className  = joose.currentModule.getName() + "." + name
			}
			var root       = joose.top;
			var parts      = className.split(".")
		
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

			var c           = aClass.createClass(name, null, joose.currentModule)
			
			var className   = c.meta.className()
			
			if(name && className) {
				var root = joose.top;
				var n = new String(className);
				var parts = n.split(".");
				for(var i = 0; i < parts.length - 1; i++) {
					if(root[parts[i]] == null) {
						root[parts[i]] = {};
					}
					root = root[parts[i]];
				}
				root[parts[parts.length - 1]] = c
			}
			
		}
		joose.cc = c;
		if(props) {
			Joose.O.each(props, function (value, name) { 
				var builder = Joose.Builders[name];
				if(!builder) {
					throw "Called invalid builder "+name+" while creating class "+c.meta.name
				}
				var paras   = value;
				if(! (paras instanceof Array )) {
					paras = [value]
				}
				builder.apply(Joose.Builder, paras)
			})
		}
	},
	
	joosify: function (standardClassName, standardClassObject) {
		var c         = standardClassObject;
		var metaClass = new Joose.Class();
		
		c.toString = function () { return this.meta.className() }
		c             = metaClass.createClass(standardClassName, c)
	
		var meta = c.meta;
	
		for(var name in standardClassObject.prototype) {
			if(name == "meta") {
				continue
			}
			var value = standardClassObject.prototype[name]
			if(typeof(value) == "function") {
				meta.addMethod(name, value)
			} else {
				var props = {};
				if(typeof(value) != "undefined") {
					props.init = value
				}
				meta.addAttribute(name, props)
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
	
	has:	function (map) {
		if(typeof map == "string") {
			var name  = arguments[0];
			var props = arguments[1];
			joose.cc.meta.addAttribute(name, props)
		} else { // name is a map
			Joose.O.each(map, function (props, name) {
				joose.cc.meta.addAttribute(name, props)
			})
		}
	},
	
	method: function (name, func, props) {
		joose.cc.meta.addMethod(name, func, props)
	},
	
	methods: function (map) {
		Joose.O.each(map, function (func, name) {
			joose.cc.meta.addMethod(name, func)
		})
	},
	
	classMethods: function (map) {
		Joose.O.each(map, function (func, name2) {
			joose.cc.meta.addMethodObject(new Joose.ClassMethod(name2, func))
		})
	},
	
	workers: function (map) {
		Joose.O.each(map, function (func, name) {
			joose.cc.meta.addWorker(name, func)
		})
	},
	
	before: function(map) {
		Joose.O.each(map, function (func, name) {
			joose.cc.meta.wrapMethod(name, "before", func);
		}) 
	},
	
	after: function(map) {
		Joose.O.each(map, function (func, name) {
			joose.cc.meta.wrapMethod(name, "after", func);
		}) 
	},
	
	around: function(map) {
		Joose.O.each(map, function (func, name) {
			joose.cc.meta.wrapMethod(name, "around", func);
		}) 
	},
	
	override: function(map) {
		Joose.O.each(map, function (func, name) {
			joose.cc.meta.wrapMethod(name, "override", func);
		}) 
	},
	
	augment: function(map) {
		Joose.O.each(map, function (func, name) {
			joose.cc.meta.wrapMethod(name, "augment", func, function () {
				joose.cc.meta.addMethod(name, func)
			});
		}) 
	},
	
	decorates: function(map) {
		Joose.O.each(map, function (classObject, attributeName) {
			joose.cc.meta.decorate(classObject, attributeName)
		}) 
	},
		rw: "rw",
	ro: "ro"
	 
};

joose.init();