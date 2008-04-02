/**
 * Joose.Class is the standard meta class for all classes
 * @name Joose.Class
 * @constructor
 */
Class("Joose.Class", {
	methods: {
		
		/**
		 * Returns a new instance of the class that this meta class instance is representing
		 * @function
		 * @name instantiate
		 * @memberof Joose.Class
		 */	
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
		/**
		 * Returns true if the class implements the method 
		 * @function
		 * @name can
		 * @param {string} methodName The method
		 * @memberof Joose.Class
		 */	
		can: function (methodName) {
			return Joose.A.exists(this.methodNames, methodName)
		},
		
		/**
		 * Returns true if the class implements all methods of the given class object 
		 * @function
		 * @name does
		 * @param {Joose.Class} methodName The class object
		 * @memberof Joose.Class
		 */	
		does: function (classObject) {
			return classObject.meta.implementsMyMethods(this.getClassObject())
		},
		
		/**
		 * Returns true if the given class implements all methods of the class 
		 * @function
		 * @name does
		 * @param {Joose.Class} methodName The class object
		 * @memberof Joose.Class
		 */	
		implementsMyMethods: function (classObject) {
			var complete = true
			Joose.A.each(this.getMethodNames(), function (value) {
				var found = classObject.meta.can(value)
				if(!found) {
					complete = false
				}
			})
			return complete
		},
	
		/**
		 * Throws an exception if the class does not implement all methods required by it's roles
		 * @function
		 * @name validateClass
		 * @memberof Joose.Class
		 */	
		validateClass: function () {
			var c  = this.getClassObject();
			var me = this;
			Joose.A.each(this.roles, function(role) {
				if(!role.meta.isImplementedBy(c)) {
					throw("Class "+me.className()+" does not fully implement the role "+role.meta.className())
				}
			})
		}
	}
})

Joose.bootstrap2()