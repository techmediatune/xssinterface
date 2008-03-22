plan(7)

diag("Roles")

Class("Comparable", {meta: Joose.Role});
ok(Comparable, "We can make a Role");
ok(Comparable.meta.meta.isa(Joose.Role), "Our meta class isa Role")

Class("Eq", {meta: Joose.Role});
requires("isEqual");

methods({
	notEqual: function (para) {
		return !this.isEqual(para)
	}
})

Class("Currency");
does(Eq)
has("value", {is: rw})

methods({
	
	initialize: function (value) {
		this.setValue(value)
	},
	
	isEqual: function (cur) {
		return this.getValue() == cur.getValue()
	}
})

check()

var a = new Currency(1);
var b = new Currency(1);
var c = new Currency(2);

ok(a.isEqual(b), "Equality works")
ok(b.isEqual(a), "Equality works in both directions")
ok(!a.isEqual(c), "Equality works for unequal things")

ok(a.notEqual(c), "Role composition works and notEqual works")
ok(!a.notEqual(b), "Role composition works and notEqual works for equal things")

endTests()