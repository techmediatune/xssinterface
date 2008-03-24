plan(6)

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
		leftRearWheel: {init: new Wheel()}
	},
	decorates: {
		leftRearWheel: Wheel
	}
})

var car = new Car();

ok(car.stop, "Car got stop method")
ok(car.drive, "Car got drive method")
ok(car.leftRearWheel.meta.isa(Wheel), "leftRearWheel is of correct type" );
ok(car.leftRearWheel.state == "stopped", "wheel is initialized")
car.drive()
ok(car.leftRearWheel.state == "running", "drive method is correctly forwarded")
car.stop()
ok(car.leftRearWheel.state == "stopped", "stop method is correctly forwarded")


endTests()
