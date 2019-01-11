const mongoose = require('mongoose')
const autoIncrement = require('mongodb-autoincrement')
const Schema = mongoose.Schema

autoIncrement.setDefaults({
  collection: 'counters',     // collection name for counters, default: counters
  field: 'bid',               // auto increment field name, default: _id
  step: 1                     // auto increment step
});

const balanceSchema = new Schema({
  bid: {
    type: Number,
  },
  type: {
    type: String,
    required: true,
  },
  sum: {
    type: Number,
    required: true,
  },
  created: {
    type: Date,
    required: true,
  },
  data: {
    type: Object,
  },
}, { minimize: false })

balanceSchema.plugin(autoIncrement.mongoosePlugin)

const Balance = mongoose.model('Balance', balanceSchema)

module.exports = Balance
