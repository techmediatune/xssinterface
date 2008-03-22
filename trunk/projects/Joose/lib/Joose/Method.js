Class("Joose.Method", {
	methods: {
		
		// creates a new method object with the same name
		_makeWrapped: function (func) {
			return this.meta.instantiate(this.getName(), func); // Should there be , this.getProps() ???
		},
		
		wrap: function (func) {
			var orig = this.getBody();
			return this._makeWrapped(function () {
				var me = this;
				var bound = function () { return orig.apply(me, arguments) }
				return func.apply(this, [bound].pushArray(arguments))
			})			
		},
		before: function (func) {
			var orig = this.getBody();
			return this._makeWrapped(function () {
				func.apply(this, arguments)
				return orig.apply(this, arguments);
			})		
		},
		after: function (func) {
			var orig = this.getBody();
			return this._makeWrapped(function () {
				var ret = orig.apply(this, arguments);
				func.apply(this, arguments);
				return ret
			})
		},
		
		override: function (func) {
			var orig = this.getBody();
			return this._makeWrapped(function () {
				var me      = this;
				var bound   = function () { return orig.apply(me, arguments) }
				var before  = this.SUPER;
				this.SUPER  = bound;
				var ret     = func.apply(this, arguments);
				this.SUPER  = before;
				return ret
			})			
		}
	}
})