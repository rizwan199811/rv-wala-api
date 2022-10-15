const { Decimal128, Number } = require('mongoose');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

var rvSchema = new mongoose.Schema({
  RVInfo: {
    value: {
      type: mongoose.Schema.Types.Number
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  disabled: {
    type: Boolean,
    default: true
  }
},
  { strict: false, timestamps: true }
);
rvSchema.plugin(mongoosePaginate);
var rvModel = mongoose.model('rv', rvSchema);
module.exports = rvModel;