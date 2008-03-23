Class("Joose.Storage", {
	meta: Joose.Role,
	
	methods: {
		toJSON: function () {
			return this.pack();
		},
		
		pack: function () {
			var o  = {
				__CLASS__: this.packedClassName()
			};
			var me = this;
			this.meta.attributeNames.each(function (name) {
				o[name] = me[name]
			})
			return o
		},
		
		packedClassName: function () {
			var name   = this.meta.className();
			var parts  = name.split(".");
			return parts.join("::");
		}
	},
	
	classMethods: {
		unpack: function (data) {
			var me = this.meta.instantiate();
			var seenClass = false;
			data.each(function (value,name) {
				if(name == "__CLASS__") {
					var className = me.packedClassName()
					if(value != className) {
						throw "Storage data is of wrong type "+value+". I am "+className+"."
					}
					seenClass = true
					return
				}
				me[name] = value
			})
			if(!seenClass) {
				throw("Serialized data needs to include a __CLASS__ attribute.")
			}
			return me
		}
	}
	
})