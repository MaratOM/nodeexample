const mongoose = require('mongoose')
const autoIncrement = require('mongodb-autoincrement')
const Schema = mongoose.Schema

autoIncrement.setDefaults({
  collection: 'counters',     // collection name for counters, default: counters
  field: 'pid',               // auto increment field name, default: _id
  step: 1                     // auto increment step
});

const promocodeSchema = new Schema({
  pid: {
    type: Number,
  },
  code: {
    type: String,
    required: true,
  },
  sum: {
    type: Number,
  },
  source: {
    type: String,
  },
  active: {
    type: Boolean,
    required: true,
  },
  created: {
    type: Date,
    required: true,
  },
  expTime: {
    type: Date,
  },
}, { minimize: false })

promocodeSchema.plugin(autoIncrement.mongoosePlugin)

const Promocode = mongoose.model('Promocode', promocodeSchema)

module.exports = Promocode
