var mongoose = require("mongoose");
var userSchema = new mongoose.Schema({
	name: String,
	num : Number
})

module.exports = userSchema;
