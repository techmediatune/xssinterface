plan(5)

diag("Inheritance");

Class("TestClass");
	
method("hello", function () {
	return "world"
})
methods({
	one: function () { return 1 },
	two: function () { return 2 },
	identity: function (para) { return para },
	identity2: function (para1, para2) { return para2 }
})

Class("TestClass2", {})
	
Class("Subclass");
	
ok(Subclass, "Subclass created")
	
isa(TestClass);
	
ok(Subclass, "Sublass still there after inheritance")
	
var s = new Subclass();
	
//TODO ok(s.another, "Subclass has an Attribute from TestClass");
ok(s.one() == 1, "Subclass's objects can call methods from TestClass")
	
ok(s.meta.isa(TestClass), "isa knows about our parent")
ok(!s.meta.isa(TestClass2), "TestClass2 is not out parent")

endTests()