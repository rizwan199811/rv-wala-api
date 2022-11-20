const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
var conn = mongoose.Collection;
var blogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
      }
},
{ strict: false,timestamps:true }
);

blogSchema.plugin(mongoosePaginate);
var BlogModel = mongoose.model('blog', blogSchema);
module.exports = BlogModel;