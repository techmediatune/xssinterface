plan(6)
	

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

endTests()