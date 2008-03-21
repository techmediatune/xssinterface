initializeTests()

diag("Meta class Extention");
	
	
Class("Joose.Class");
	
methods({
	iAmMeta: function () { return true }
})
	
Class("MyClass");
	
methods({
	hello: function () { return 1 }
});
	
var o = new MyClass();
	
ok(o.hello() == 1, "Can call methods on MyClass");
ok(MyClass.meta.iAmMeta(), "We can extend the meta class");
isNull(MyClass.iAmMeta, "MyClass does not have the new meta class method");

diag("Instantiation");
	
ok(MyClass.meta.instantiate().hello() == 1, "We can instantiate a class through the meta class")
ok(new MyClass().meta.instantiate().hello() == 1, "We can instantiate a class through the meta class from an instance")

endTests()