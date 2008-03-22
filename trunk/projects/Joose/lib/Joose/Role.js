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
	}
})