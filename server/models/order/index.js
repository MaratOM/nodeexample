const mongoose = require('mongoose')
const autoIncrement = require('mongodb-autoincrement')
const Schema = mongoose.Schema

autoIncrement.setDefaults({
  collection: 'counters',     // collection name for counters, default: counters
  field: 'oid',               // auto increment field name, default: _id
  step: 1                     // auto increment step
});

const orderSchema = new Schema({
  oid: {
    type: Number,
    required: true,
  },
  sid: {
    type: Number,
    required: true,
  },
  salonName: {
    type: String,
    required: true,
  },
  salonAvatar: {
    type: String,
  },
  mates: {
    type: Array,
    uppercase: true,
  },
  mateId: {
    type: String,
    uppercase: true,
    required: true,
  },
  mateName: {
    type: String,
    required: true,
  },
  mateAvatar: {
    type: String,
  },
  mateGender: {
    type: String,
  },
  created: {
    type: Date,
    required: true,
  },
  sumOrder: {
    type: Number,
    required: true,
  },
  sumRub: {
    type: Number,
  },
  sumPon: {
    type: Number,
  },
  status: {
    type: String,
    required: true,
  },
  statuses: {
    type: Object,
    required: true,
  },
  services: {
    type: Array,
    required: true,
  },
  commission: {
    type: Array,
  },
})

orderSchema.plugin(autoIncrement.mongoosePlugin)

const Order = mongoose.model('Order', orderSchema)

module.exports = Order
