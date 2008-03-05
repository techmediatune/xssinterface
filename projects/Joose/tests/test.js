

function runTest() {
	initializeTests()
	diag("Sanity")
	ok(Joose,   "Joose is here");
	ok(Joose.Builders,   "We have a builder");
	ok(joose,  "joose is here");
	ok(joose.init, "joose has an init method :)")
	
	diag("Builders");
	ok(Class, "Class");
	ok(isa, "isa")
	ok(has, "has")
	ok(method, "method");
	ok(rw == "rw", "rw prop");
	ok(ro == "ro", "ro prop");
	
	diag("MetaClass");
	
	ok(Joose.Class, "We have the meta class")
	ok(Joose.Class.meta.isa(Joose.MetaClass), "meta class isa MetaClass")
	
	
	diag("Class creation");
	Class("TestClass");
	
	ok(TestClass, "We made a class")
	ok(TestClass.meta.name == "TestClass", "The name is correct")
	
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
	ok(TestClass2.meta.name == "TestClass2", "The name is correct")
	
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
	
	diag("Inheritance");
	
	Class("Subclass");
	
	ok(Subclass, "Subclass created")
	
	isa(TestClass);
	
	ok(Subclass, "Sublass still there after inheritance")
	
	var s = new Subclass();
	
	//TODO ok(s.another, "Subclass has an Attribute from TestClass");
	ok(s.one() == 1, "Subclass's objects can call methods from TestClass")
	
	ok(s.meta.isa(TestClass), "isa knows about our parent")
	ok(!s.meta.isa(TestClass2), "TestClass2 is not out parent")
	
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

Class("Animal");

methods({
	multiply: function () { return this.meta.instantiate() }
})

Class("Cat");
isa(Animal)

methods({
	likes: function () { return "fish" }
})
	
Class("Dog");
isa(Animal)
has("owner", {is: rw})

methods({
	balksAt: function () { return this.owner },
	hates: function () { Cat }
})

	ok(Cat.meta.isa(Animal), "Cats are animals");
	ok(Dog.meta.isa(Animal), "Dogs are animals too");
	ok(!Animal.meta.isa(Cat), "Not all animals are cats")
	ok(new Cat().likes() == "fish", "Cats like fish");
	ok(new Cat().multiply().likes() == "fish", "Cat babies like fish")
	ok(new Cat().multiply().meta.isa(Cat), "Cat babies are Cats")



	
}