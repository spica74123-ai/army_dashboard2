const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  name: String,
  type: String,
  location: String,
  strength: Number,
  commander: String
}, { timestamps: true });

module.exports = mongoose.model('Unit', unitSchema);