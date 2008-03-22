// Extend Joose.Class using Joose's mechanism
Class("Joose.Class", {
	methods: {
	
		instantiate: function () {
			//var o = new this.c.apply(this, arguments);
		
			// Ough! Calling a constructor with arbitrary arguments hack
  			var f = function () {};
  			f.prototype = this.c.prototype;
  			f.prototype.constructor = this.c;
  			var obj = new f();
  			this.c.apply(obj, arguments);
  			return obj;
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
					throw("Class "+me.className()+" does not fully implement the role "+role.meta.className())
				}
			})
		}
	
	}
})

Joose.bootstrap2()