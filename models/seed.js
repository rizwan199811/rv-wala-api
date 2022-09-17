const mongoose = require('mongoose');
var conn = mongoose.Collection;
var seedSchema = new mongoose.Schema({
},
{ strict: false }
);

var seedModel = mongoose.model('seed', seedSchema);
module.exports = seedModel;