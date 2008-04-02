
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
				
				object.detach();
				object.meta.addRole(this.getClassObject());
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