plan(12)
diag("Sanity")
ok(Joose,   "Joose is here");
ok(Joose.Builder,   "We have a builder");
ok(joose,  "joose is here");
ok(joose.init, "joose has an init method :)")

ok(Joose.Class, "Joose.Class is here")
ok(Joose.Role, "Joose.Role is here")
// TODO test for all components
	
diag("Builders");
ok(Class, "Class");
ok(isa, "isa")
ok(has, "has")
ok(method, "method");
ok(rw == "rw", "rw prop");
ok(ro == "ro", "ro prop");
endTests()