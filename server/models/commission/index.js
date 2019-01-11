const mongoose = require('mongoose')
const autoIncrement = require('mongodb-autoincrement')
const Schema = mongoose.Schema

autoIncrement.setDefaults({
  collection: 'counters',     // collection name for counters, default: counters
  field: 'cid',               // auto increment field name, default: _id
  step: 1                     // auto increment step
});

const commissionSchema = new Schema({
  cid: {
    type: Number,
    required: true,
  },
  oid: {
    type: Number,
  },
  sid: {
    type: Number,
  },
  customerId: {
    type: String,
    uppercase: true,
    required: true,
  },
  mateId: {
    type: String,
    uppercase: true,
    required: true,
  },
  created: {
    type: Date,
    required: true,
  },
  sum: {
    type: Number,
    required: true,
  },
  level: {
    type: Number,
  },
  percent: {
    type: Number,
  },
})

commissionSchema.plugin(autoIncrement.mongoosePlugin)

const Commission = mongoose.model('Commission', commissionSchema)

module.exports = Commission
