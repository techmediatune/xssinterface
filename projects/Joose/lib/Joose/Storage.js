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
			Joose.A.each(this.meta.attributeNames, function (name) {
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
			Joose.O.each(data, function (value,name) {
				if(name == "__CLASS__") {
					var className = Joose.Storage.Unpacker.packedClassNameToJSClassName(value)
					if(className != me.meta.className()) {
						throw "Storage data is of wrong type "+className+". I am "+me.meta.className()+"."
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