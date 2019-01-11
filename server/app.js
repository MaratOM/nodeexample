const express = require('express')
const path = require('path')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const i18next = require('i18next')
const middleware = require('i18next-express-middleware')

mongoose.Promise = global.Promise
if (process.env.NODE_ENV === 'test') {
  mongoose.connect('mongodb://localhost/XXXX', {useMongoClient: true})
} else {
  mongoose.connect("mongodb://mongo", {
    user: "XXXX",
    pass: "XXXX",
    dbName: "XXXX",
    auth: {
      authdb: "admin"
    },
    useMongoClient: true
  })
}

const app = express()

const en = require('./localization/en.json')
const ru = require('./localization/ru.json')
i18next
  .use(middleware.LanguageDetector)
  .init({
    preload: ['en', 'ru'],
    resources: {
      en: {translation: en},
      ru: {translation: ru},
    }
  })
app.use(middleware.handle(i18next))

if (!process.env.NODE_ENV === 'test') {
  app.use(morgan('dev'))
}
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

const whitelist = [process.env.CLIENT_HOST, process.env.CLIENT_HOST_WWW]
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
}
app.use(cors(corsOptions))

app.use(express.static(path.join(__dirname, 'static')))
app.use(fileUpload())

app.use('/admin', require('./routes/admin'))
app.use('/users', require('./routes/users'))
app.use('/salons', require('./routes/salons'))
app.use('/orders', require('./routes/orders'))
app.use('/businesses', require('./routes/businesses'))

module.exports = app
