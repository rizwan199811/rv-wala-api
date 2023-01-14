var mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
var Schema = mongoose.Schema;
const autoIncrement = require('mongoose-auto-increment');

var bookingSchema = new Schema(
  {
    RV: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'rv',
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    host:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    }
  },
  { versionKey: false, strict: false, timestamps: true },
)
autoIncrement.initialize(mongoose.connection);
bookingSchema.plugin(autoIncrement.plugin, {
  model: 'booking',
  field: 'bookingId',
  startAt: 1,
  incrementBy: 1
}); 
bookingSchema.plugin(mongoosePaginate)
let BookingModel = mongoose.model('booking', bookingSchema)

module.exports = BookingModel
