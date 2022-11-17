const mongoose = require('mongoose');
var conn = mongoose.Collection;
var blogSchema = new mongoose.Schema({
},
{ strict: false }
);

var BlogModel = mongoose.model('blog', blogSchema);
module.exports = BlogModel;