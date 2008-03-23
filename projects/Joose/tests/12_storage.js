plan(23)

diag("Testing Storage Role")

ok(joose.top.JSON, "We have JSON")
ok(JSON.parse && JSON.stringify, "It is the correct version of JSON (json2.js)")

Class("Point", {
	does: Joose.Storage,
	has: {
		x: {is: rw},
		y: {is: rw}
	}
})

var p = new Point({x: 10, y: 20})

ok(p.getX() == 10, "Sanity: point x value is ok")
ok(p.getY() == 20, "Sanity: point y value is ok")

var o = p.pack();

ok(o.x == 10, "Serialized object has correct x value")
ok(o.y == 20, "Serialized object has correct y value")
ok(o.__CLASS__ == "Point", "Serialized object has the correct class name")

var p2 = Point.unpack(o);

ok(p2.getX() == 10, "After unpack: point x value is ok")
ok(p2.getY() == 20, "After unpack: point y value is ok")

var p3 = Point.unpack(JSON.parse(JSON.stringify(p)));

ok(p3.getX() == 10, "After JSON rountrip: point x value is ok (uses the toJSON method)")
ok(p3.getY() == 20, "After JSON rountrip: point y value is ok (uses the toJSON method)")


Geometry = {};
Class("Geometry.Rectangle", {
	does: Joose.Storage,
	has: {
		width:  {is: rw},
		height: {is: rw}
	}
})

fail(function () {Geometry.Rectangle.unpack(o)}, "Storage data is of wrong type", "Unpacking a point into a rectangle fails")
fail(function () {Geometry.Rectangle.unpack({width: 10, height: 20})}, "Serialized data needs to include a __CLASS__ attribute.", "Unpacking without __CLASS__ attribute fails correctly.")

var before = {
	test: [new Point({x: 10, y: 20})],
	another: {a: 1}
}

var after = JSON.parse(JSON.stringify(before), Joose.Storage.Unpacker.jsonParseFilter);

var p = after.test[0]

ok(p, "There is something in the point spot");

ok(p.x == 10, "X has the correct value");
ok(p.getX, "getX method is there");
ok(p.getX() == 10, "getX() retuns the correct value");
ok(p.meta.className() == "Point", "p is of correct type")

diag("Patching JSON")
Joose.Storage.Unpacker.patchJSON();
var after = JSON.parse(JSON.stringify(before));

var p = after.test[0]

ok(p, "There is something in the point spot");

ok(p.x == 10, "X has the correct value");
ok(p.getX, "getX method is there");
ok(p.getX() == 10, "getX() retuns the correct value");
ok(p.meta.className() == "Point", "p is of correct type")

