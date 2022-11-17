const mongoose = require('mongoose');
var conn = mongoose.Collection;
var userSchema = new mongoose.Schema({
    password: {
        select: false,
        type: String
    },
    roles: {
        type: String,
        default: "user",
        enum: ["super_admin", "admin", "user"]
    },
    bookings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'booking'
      }],
},
    { strict: false, timestamps: true }
);

var UserModel = mongoose.model('user', userSchema);
module.exports = UserModel;