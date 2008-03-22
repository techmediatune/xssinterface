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
				if(! (paras instanceof Array )) {
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
	
	has:	function (map) {
		if(typeof map == "string") {
			var name  = arguments[0];
			var props = arguments[1];
			joose.cc.meta.addAttribute(name, props)
		} else { // name is a map
			map.each(function (props, name) {
				joose.cc.meta.addAttribute(name, props)
			})
		}
	},
	
	method: function (name, func, props) {
		joose.cc.meta.addMethod(name, func, props)
	},
	
	methods: function (map) {
		map.each(function (func, name) {
			joose.cc.meta.addMethod(name, func)
		})
	},
	
	classMethods: function (map) {
		map.each(function (func, name) {
			joose.cc.meta.addMethodObject(new Joose.ClassMethod(name, func))
		})
	},
	
	workers: function (map) {
		map.each(function (func, name) {
			joose.cc.meta.addWorker(name, func)
		})
	},
	
	before: function(map) {
		map.each(function (func, name) {
			joose.cc.meta.wrapMethod(name, "before", func);
		}) 
	},
	
	after: function(map) {
		map.each(function (func, name) {
			joose.cc.meta.wrapMethod(name, "after", func);
		}) 
	},
	
	around: function(map) {
		map.each(function (func, name) {
			joose.cc.meta.wrapMethod(name, "around", func);
		}) 
	},
	
	override: function(map) {
		map.each(function (func, name) {
			joose.cc.meta.wrapMethod(name, "override", func);
		}) 
	},
	
	augment: function(map) {
		map.each(function (func, name) {
			joose.cc.meta.wrapMethod(name, "augment", func, function () {
				joose.cc.meta.addMethod(name, func)
			});
		}) 
	},
	
	rw: "rw",
	ro: "ro"
	 
};

joose.init();