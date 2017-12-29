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
    type: String,
    default: Date.now().toString()
  },
  ed: {
    type: String,
    default: Date.now().toString()
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
