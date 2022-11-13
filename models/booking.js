var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bookingSchema = new Schema({
 }, { versionKey: false,strict: false,timestamps:true });

module.exports = mongoose.model('booking', bookingSchema);