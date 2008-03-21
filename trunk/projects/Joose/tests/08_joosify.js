initializeTests()

diag("joosify");

function RegularClass() {
	this.a = 1;
	this.b = 2;
}

RegularClass.prototype = {
	para: "test",
	test: function () { return "world" }
}


joosify("RegularClass", RegularClass);

ok(RegularClass, "RegularClass is still there")
ok(RegularClass.meta, "RegularClasses now have a meta object")
var a = new RegularClass();
ok(a, "We can make a joosified class");

ok(a.meta, "RegularClass objects now have a meta class")
ok(a.para == "test", "Attributes are still there")
ok(a.test, "Test function is there");
ok(a.test() == "world", "Test Function is callable")
ok(a.meta.can("test"), "The meta class is aware of the test function")
ok(a.meta.isa(RegularClass), "A RegularClass isa RegularClass")

endTests()
