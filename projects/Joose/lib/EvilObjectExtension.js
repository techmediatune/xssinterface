
function $(id) {
	return document.getElementById(id)
}


Array.prototype.each = function (func) {
	for(var i = 0; i < this.length; i++) {
		func(this[i], i)
	}
}

Array.prototype.pushArray = function (array) {
	this.push.apply(this, array)
	return this
}

Array.prototype.exists = function (value) {
	for(var i = 0; i < this.length; i++) {
		if(this[i] == value) {
			return true
		}
	}
	return false
}

Object.prototype.each = function (func) {
	for(var i in this) {
		if(i == "each") {
			continue
		}
		func(this[i], i)
	}
}

String.prototype.uppercaseFirst = function () { // XXX Implement
	var first = this.substr(0,1);
	var rest  = this.substr(1,this.length-1);
	first = first.toUpperCase()
	return first + rest;
}