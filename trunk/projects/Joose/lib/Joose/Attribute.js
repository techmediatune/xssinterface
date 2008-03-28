Class("Joose.Attribute", {
	after: {
		handleProps: function (classObject) {
			this.handleHandles(classObject)
		}
	},
	methods: {
		handleHandles: function (classObject) {
			var meta  = classObject.meta;
			var name  = this.getName();
			var props = this.getProps();
			
			var handles = props.handles;
			var isa     = props.isa
			
			if(handles) {
				if(handles == "*") {
					if(!isa) {
						throw "I need an isa property in order to handle a class"
					}
					
					meta.decorate(isa, name)
				} else {
					throw "Unsupported value for handles: "+handles
				}
				
			}
		}
	}
})