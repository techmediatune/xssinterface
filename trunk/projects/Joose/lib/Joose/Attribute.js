Class("Joose.Attribute", {
	after: {
		handleProps: function (classObject) {
			this.handleHandles(classObject);
			this.handlePredicate(classObject);
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
		},
		
		handlePredicate: function (classObject) {
			var meta  = classObject.meta;
			var name  = this.getName();
			var props = this.getProps();
			
			var predicate = props.predicate;
			
			var getter    = this.getterName()
			
			if(predicate) {
				meta.addMethod(predicate, function () {
					var val = this[getter]();
					return val ? true : false
				})
			}
		}
	}
})