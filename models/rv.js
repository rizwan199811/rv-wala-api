const mongoose = require('mongoose');
var rvSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'user',                                      
        required: true
      },
},
{ strict: false }
);

var rvModel = mongoose.model('rv', rvSchema);
module.exports = rvModel;