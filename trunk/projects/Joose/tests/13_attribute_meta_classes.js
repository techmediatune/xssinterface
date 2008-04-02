plan(14)


Class("Wheel", {
	has: {
		state: {init: "stopped"}
	},
	methods: {
		drive: function () { this.state = "running" },
		stop: function () { this.state = "stopped" }
	}
})

Class("Car", {
	has: {
		leftRearWheel: {
			init: new Wheel(), 
			isa: Wheel, 
			is: rw,
			handles: "*"
		},
		driver: {
			init:      function () { return "Joose" },
			lazy:	   true,
			is:        rw,
			predicate: "hasDriver"
		}
	}
})

var car = new Car();

ok(car.stop, "Car got stop method")
ok(car.drive, "Car got drive method")
ok(car.leftRearWheel.meta.isa(Wheel), "leftRearWheel is of correct type" );

ok(car.setLeftRearWheel(new Wheel()), "We can set typed attributes")
fail(function () { car.setLeftRearWheel({}) }, "only accepts values that have a meta object", "Setting to non Joose type {} gives error")
fail(function () { car.setLeftRearWheel([]) }, "only accepts values that have a meta object", "Setting to non Joose type [] gives error")
fail(function () { car.setLeftRearWheel(1) }, "only accepts values that have a meta object", "Setting to non Joose type 1 gives error")
fail(function () { car.setLeftRearWheel(null) }, "only accepts values that have a meta object", "Setting to non Joose type null gives error")
fail(function () { car.setLeftRearWheel(new Car()) }, "only accepts values that are objects of type Wheel", "Setting to wrong type gives error")


ok(car.leftRearWheel.state == "stopped", "wheel is initialized")
car.drive()
ok(car.leftRearWheel.state == "running", "drive method is correctly forwarded")
car.stop()
ok(car.leftRearWheel.state == "stopped", "stop method is correctly forwarded")

ok(car.getDriver, "We could get a driver");
ok(car.getDriver() == "Joose", "Lazy attributes work")


endTests()
