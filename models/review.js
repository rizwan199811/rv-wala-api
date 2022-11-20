const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
var conn = mongoose.Collection;
var reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
      },
      RV: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'rv',
      }  
},
{ strict: false }
);

reviewSchema.plugin(mongoosePaginate);
var ReviewModel = mongoose.model('review', reviewSchema);
module.exports = ReviewModel;