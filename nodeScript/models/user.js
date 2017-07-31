var mongoose = require("mongoose");
var UserSchema = require("../schemas/user");
var jsLib = mongoose.model('jsLib',UserSchema);

module.exports = jsLib;