const mongoose = require('mongoose')
const autoIncrement = require('mongodb-autoincrement')
const Schema = mongoose.Schema

autoIncrement.setDefaults({
  collection: 'counters',     // collection name for counters, default: counters
  field: 'bid',               // auto increment field name, default: _id
  step: 1                     // auto increment step
});

const businessSchema = new Schema({
  bid: {
    type: Number,
  },
  name: {
    type: String,
    required: true,
  },
}, { minimize: false })

businessSchema.plugin(autoIncrement.mongoosePlugin)

const Business = mongoose.model('Business', businessSchema)

module.exports = Business
