const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

var rvSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'user',                                      
        required: true
      },
},
{ strict: false }
);
rvSchema.plugin(mongoosePaginate); 
var rvModel = mongoose.model('rv', rvSchema);
module.exports = rvModel;