
/*
 * An Implementation of Traits
 * see http://www.iam.unibe.ch/~scg/cgi-bin/scgbib.cgi?query=nathanael+traits+composable+units+ecoop
 */
Class("Joose.Role", {
	isa: Joose.Class,
	has: ["requiresMethodNames"],
	methods: {
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
				var c    = meta.createClass(meta.className()+"AnonymousSubclass"+Joose.Role.anonymousClassCounter);
				c.meta.addSuperClass(object.meta.getClassObject());
				// appy the role to the anonymous class
				c.meta.addRole(this.getClassObject())
				// swap meta class of object with new instance
				object.meta      = c.meta;
				// swap __proto__ chain of object to its new class
				object.__proto__ = c.prototype
			} else {
				// object is actually a class
				object.meta.importMethods(this.getClassObject())
			}
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
	}
})

Joose.Role.anonymousClassCounter = 0;