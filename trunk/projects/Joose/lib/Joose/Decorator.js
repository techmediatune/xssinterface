Class("Joose.Decorator", {
	meta: Joose.Role,
	methods: {
		decorate: function (classObject, attributeName) {
			var me = this;
			classObject.meta.getInstanceMethods().each(function (m) {
				var name    = m.getName();
				var argName = attributeName;
				// only override non existing methods
				if(!me.can(name)) {
					me.addMethod(name, function () {
						var d = this[argName];
						return d[name].apply(d, arguments)
					});
				}
			})
		}
	}
})

Joose.Decorator.meta.apply(Joose.Class)