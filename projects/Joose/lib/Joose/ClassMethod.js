Class("Joose.ClassMethod", {
	isa: Joose.Method,
	methods: {
		isClassMethod: function () { return true },
		addToClass: function (c) {
			c[this.getName()] = this.asFunction()
		},
	}
})