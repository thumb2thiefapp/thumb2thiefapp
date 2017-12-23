var mongoose = require('mongoose');

var Licence = mongoose.model('Licence', {
  key: {
    type: String,
    required: true,
    unique: true
  },
  active: {
    type: Boolean,
    default: false
  },
  ad: {
    type: Date,
    default: Date.now()
  },
  ed: {
    type: Date,
    default: Date.now()
  },
  deviceid: {
    type: String,
    trim: true,
    default: "empty"
  },
  year: {
    type: Number,
    default: 1
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

module.exports = {Licence};
