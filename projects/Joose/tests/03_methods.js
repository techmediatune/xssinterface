plan(12)
	

diag("Methods");
	
Class("TestClass");
	
method("hello", function () {
	return "world"
})
	
var o = new TestClass();
	
ok(o.hello() == "world", "Can call method hello")
	
methods({
	one: function () { return 1 },
	two: function () { return 2 },
	identity: function (para) { return para },
	identity2: function (para1, para2) { return para2 }
})
	
ok(o.one() == 1, "We can add and call another method");
ok(o.two() == 2, "We can add multiple methods at once");
ok(o.identity(1) == 1, "We can call methods with one parameter");
ok(o.identity2(1, 2) == 2, "We can call methods with two parameters");

ok(o.one.meta.meta.isa(Joose.Method), "Methods of Joose.Classes are Joose.Methods")

Class("MoreMethods", {
	methods: {
		one: function () { return 1 }
	},
	classMethods: {
		getName: function () { return "Joose" }
	}
})

ok(MoreMethods.getName, "We have a classmethod")
ok(MoreMethods.getName() == "Joose", "And it returns the correct result")

ok(!MoreMethods.one, "No instance method in the class spot")

var m = new MoreMethods();
ok(m.one() == 1, "Can still call instance methods")
ok(!m.getName, "No class method in the instance")
ok(m.constructor.getName() == "Joose", "Can call the class method on the constructor")


endTests()