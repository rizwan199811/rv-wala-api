const mongoose = require('mongoose');
var conn = mongoose.Collection;
var newsSchema = new mongoose.Schema({
    title:String,
    content:String
});

var newsModel = mongoose.model('news', newsSchema);
module.exports = newsModel;