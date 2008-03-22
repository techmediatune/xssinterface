
function benchmark () {

function RegularCounter () {
	this.counter = 0
}

RegularCounter.prototype = {
	add: function () {
		this.counter++
	}
}

Class("JooseCounter", {
	has: {
		counter: { init: 1 }
	},
	methods: {
		add: function () {
			this.counter++
		}
	}
})

Class("WrappedCounter", {
	isa: JooseCounter,
	override: {
		add: function () {
			this.SUPER();
			this.counter++
		}
	}
})

var r  = new RegularCounter();
var j  = new JooseCounter();

diag("Method Calls")
var b1 = new Joose.Benchmark(100000, "Regular", function () { r.add() } )
var b2 = new Joose.Benchmark(100000, "Joose",   function () { j.add() } )

say(b1.report());
say(b2.report());

diag("Object Creation")
var b1 = new Joose.Benchmark(100000, "Regular", function () { var r = new RegularCounter() } )
var b2 = new Joose.Benchmark(100000, "Joose",   function () { var j = new JooseCounter() } )

say(b1.report());
say(b2.report());

diag("Before Wrapper")

var j = new JooseCounter();
var w = new WrappedCounter();

var b1 = new Joose.Benchmark(100000, "Direct", function () { j.add() } )
var b2 = new Joose.Benchmark(100000, "Wrapped",   function () { w.add() } )

say(b1.report());
say(b2.report());

}