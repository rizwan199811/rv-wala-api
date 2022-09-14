const mongoose = require('mongoose');
var conn = mongoose.Collection;
var userSchema = new mongoose.Schema({
},
{ strict: false }
);

var userModel = mongoose.model('user', userSchema);
module.exports = userModel;