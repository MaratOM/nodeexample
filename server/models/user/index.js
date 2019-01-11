const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const autoIncrement = require('mongodb-autoincrement')
const Schema = mongoose.Schema

const userHelpers = require('@models/user/helpers')

autoIncrement.setDefaults({
  collection: 'counters',     // collection name for counters, default: counters
  field: 'uid',               // auto increment field name, default: _id
  step: 1                     // auto increment step
});

const userSchema = new Schema({
  uid: {
    type: Number,
  },
  type: {
    type: String,
    required: true,
  },
  roles: {
    type: Array,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
  },
  blocked: {
    type: Boolean,
    required: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  newsSubscribed: {
    type: Boolean,
    default: false,
  },
  policyAccepted: {
    type: Boolean,
    required: true,
  },
  created: {
    type: Date,
    required: true,
  },
  modified: {
    type: Date,
  },
  lastLogin: {
    type: Date,
    required: true,
  },
  mateId: {
    type: String,
    uppercase: true,
  },
  uplineId: {
    type: String,
    uppercase: true,
  },
  uplines: {
    type: Array,
    default: [],
    uppercase: true,
  },
  verifyLink: {
    type: {
      type: String,
      lowercase: true,
    },
    code: {
      type: String,
    },
    expTime: {
      type: Date,
    },
    used: {
      type: Boolean,
    },
  },
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    lowercase: true,
    required: true,
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
  dob: {
    type: Date,
    required: true,
  },
  gender: {
    type: Boolean,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    required: false,
  },
  data: {
    matesCount: {
      type: Number,
      default: 0,
    },
    balance: {
      type: Number,
      default: 0,
    },
    paidPones: {
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
  balance: {
    type: Array,
    default: [],
  },
  mates: {
    type: Array,
    default: [],
  },
  orders: {
    type: Array,
    default: [],
  },
  ordersPending: {
    type: Array,
    default: [],
  },
  salons: {
    type: Object,
    default: {},
  },
  connectSalons: {
    type: Object,
    default: {},
  },
  promocodes: {
    type: Object,
    default: {},
  },
  google: {
    id: {
      type: String,
    },
    email: {
      type: String,
      lowercase: true,
    }
  },
  facebook: {
    id: {
      type: String,
    },
    email: {
      type: String,
      lowercase: true,
    }
  }
}, { minimize: false })

userSchema.pre('save', async function(next) {
  try {
    if(this.password.length < 15) {
      this.password = await userHelpers.encodePassword(this.password)
    }

    next()
  } catch(error) {
    next(error)
  }
})

userSchema.methods.isValidPassword = async function(newPassword) {
  try {
    return await bcrypt.compare(newPassword, this.password)
  } catch(error) {
    throw new Error(error)
  }
}

userSchema.plugin(autoIncrement.mongoosePlugin)

const User = mongoose.model('User', userSchema)

module.exports = User
