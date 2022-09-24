const mongoose = require('mongoose');
var conn = mongoose.Collection;
var userSchema = new mongoose.Schema({
    password:{
        select:false,
        type:String
    }
},
{ strict: false , timestamps: true }
);

var userModel = mongoose.model('user', userSchema);
module.exports = userModel;