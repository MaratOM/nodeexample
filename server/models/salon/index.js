const mongoose = require('mongoose')
const autoIncrement = require('mongodb-autoincrement')
const Schema = mongoose.Schema

autoIncrement.setDefaults({
  collection: 'counters',     // collection name for counters, default: counters
  field: 'sid',               // auto increment field name, default: _id
  step: 1                     // auto increment step
});

const salonSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  sid: {
    type: Number,
  },
  adminMid: {
    type: String,
  },
  active: {
    type: Boolean,
    default: false,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  connectMates: {
    type: Array,
    default: [],
  },
  connected: {
    type: String,
    default: '',
  },
  created: {
    type: Date,
    required: true,
  },
  data: {
    clientsCount: {
      type: Number,
      default: 0,
    },
    ordersCount: {
      type: Number,
      default: 0,
    },
    ordersVolume: {
      type: Number,
      default: 0,
    },
  },
  avatar: {
    type: String,
    required: false,
  },
  pictures: {
    type: Array,
    default: [],
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    lowercase: true,
    required: false,
  },
  site: {
    type: String,
    lowercase: true,
    required: false,
  },
  phone: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  geo_lat: {
    type: String,
  },
  geo_lon: {
    type: String,
  },
  metro: {
    type: Array,
    default: [],
    required: true,
  },
  description: {
    type: String,
  },
  schedule: {
    type: String,
  },
  businesses: {
    type: Array,
    default: [],
  },
  sm_name: {
    type: String,
  },
  sm_link: {
    type: String,
  },
  sm_rating: {
    type: Number,
  },
  clients: {
    type: Object,
    default: {},
  },
  orders: {
    type: Array,
    default: [],
  },
  ordersPending: {
    type: Array,
    default: [],
  },
}, { minimize: false })

salonSchema.virtual('fullName').get(function () {
  return this.name.first + ' ' + this.name.last;
})

salonSchema.plugin(autoIncrement.mongoosePlugin)

const Salon = mongoose.model('Salon', salonSchema)

module.exports = Salon
