plan(25)
	
diag("MetaClass");
	
ok(Joose.Class, "We have the meta class")
ok(Joose.Class.meta.isa(Joose.MetaClass), "meta class isa MetaClass")
		
diag("Class creation");
Class("TestClass");
	
ok(TestClass, "We made a class")
ok(TestClass.meta.className() == "TestClass", "The name is correct")
	
var o = new TestClass();
ok(o, "We made an object");
	
has("test", {is: rw, init: 1});
	
o = new TestClass();
	
ok(o.test == 1, "We have an attribute")
o.test = 2;
ok(o.test == 2, "We can set attributes")
	
diag("Multiple Classes")
	
Class("TestClass2");
	
ok(TestClass2, "We made a second class")
ok(TestClass2.meta.className() == "TestClass2", "The name is correct")
	
has("test2", {is: rw, init: 1});
	
o2 = new TestClass2();
	
ok(o2.test2 == 1, "We have an attribute test2 on TestClass2")
	
isNull(o.test2, "TestClass objects doesnt have the attribute test2")
	
diag("Class extention")
	
isNull(o.another, "The first object doesnt have the attribute another");
	
Class("TestClass");
	
has("another", {is: rw, init: true});

ok(o.another, "The first object now has the attribute another ");
	
var o3 = new TestClass();
	
ok(o3 != o, "The two objects from TestClass differ")
	
ok(o3, "We made a second object from TestClass");
ok(o3.test, "o3 has test");
ok(o3.another, "o3 has another");


var o4 = new TestClass({
	test: "newVal",
	another: "fooBar"
})

ok(o4.test == "newVal", "Initializer works");
ok(o4.another == "fooBar", "Initializer works for another parameter")

ok(joose.isInstance(o4), "joose.isInstance recognizes instances")
ok(joose.isInstance(o3), "joose.isInstance recognizes instances")
ok(joose.isInstance(new TestClass()), "joose.isInstance recognizes instances")
ok(!joose.isInstance(TestClass), "joose.isInstance recognizes classes")
ok(!joose.isInstance(TestClass2), "joose.isInstance recognizes classes")
fail(function () { joose.isInstance({}) }, "isInstance only works with Joose objects and classes.", "joose.isInstance fails for generic objects")

endTests()