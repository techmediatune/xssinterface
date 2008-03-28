
/*
 * An Implementation of Traits
 * see http://www.iam.unibe.ch/~scg/cgi-bin/scgbib.cgi?query=nathanael+traits+composable+units+ecoop
 * 
 * Current Composition rules:
 * - At compile time we override existing (at the time of rule application) methods
 * - At runtime we dont
 */
Class("Joose.Role", {
	isa: Joose.Class,
	has: ["requiresMethodNames"],
	methods: {
		
		addInitializer: Joose.emptyFunction,
		
		defaultClassFunctionBody: function () {
			var f = function () {
				throw "Roles may not be instantiated."
			};
			f.toString = function () { return this.meta.className() }
			return f
		},
		
		addSuperClass: function () {
			throw "Roles may not inherit"
		},
		
		initialize: function () {
			this._name               = "Joose.Role"
			this.requiresMethodNames = [];
		},
		
		addRequirement: function (methodName) {
			this.requiresMethodNames.push(methodName)
		},
	
		apply: function (object) {
			
			if(joose.isInstance(object)) {
				// Create an anonymous subclass ob object's class
				var meta = object.meta;
				var c    = meta.createClass(meta.className()+"__"+this.className()+"__"+Joose.Role.anonymousClassCounter);
				c.meta.addSuperClass(object.meta.getClassObject());
				// appy the role to the anonymous class
				c.meta.addRole(this.getClassObject())
				// swap meta class of object with new instance
				object.meta      = c.meta;
				// swap __proto__ chain of object to its new class
				// unfortunately this is not available in IE :(
				// object.__proto__ = c.prototype
				// Workaround for IE:
				for(var i in c.prototype) {
					if(object[i] == null) {
						object[i] = c.prototype[i]
					}
				}
			} else {
				// object is actually a class
				var me    = this;
				var names = this.getMethodNames();
		
				//alert("Super"+me.name + " -> "+classObject.meta.name +"->" + names)
		
				Joose.A.each(names, function (name) {
					var m = me.dispatch(name);
					object.meta.addMethodObject(m.meta)
				})
			}
		},
	
		hasRequiredMethods: function (classObject) {
			var complete = true
			Joose.A.each(this.requiresMethodNames, function (value) {
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
	}
})

Joose.Role.anonymousClassCounter = 0;