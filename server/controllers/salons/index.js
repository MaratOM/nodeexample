const path = require('path')
const fs = require('fs')
const Paginator = require('paginator')
const R = require('ramda')
const Salon = require('@models/salon')
const scrap = require('@models/salon/scrap')
const {fillInOrders} = require('@models/order/order')
const validate = require('../validate')

module.exports = {
  add: async (req, res, next) => {
    const salonData = req.value.body
    salonData.country = 'Россия'

    if(typeof salonData.connected === 'undefined') {
      salonData.connected = 'self'
    }
    salonData.blocked = false
    salonData.created = new Date()
    salonData.avatar = salonData.avatar ? salonData.avatar : '/images/avatars/default/salon.jpg'

    const newSalon = new Salon({
      sid: 0,
      ...salonData,
    })

    const savedSalon = await newSalon.save()

    res.status(200).json(savedSalon.toObject())
  },

  update: async (req, res, next) => {
    const salonData = req.value.body
    const salon_id = salonData._id
    delete salonData._id

    await Salon.findByIdAndUpdate(salon_id, {$set:{...salonData}}, {new: true}, function(err, doc){
      if(err){
        throw new Error(err)
      }

      res.status(200).json(doc)
    })
  },

  fileUpload: async (req, res, next) => {
    if (!req.files)
      return res.status(400).send(req.t('No files were uploaded.'))

    let {salon} = req.body
    const {file} = req.files
    const staticDirectoryPath = '/images/salons/' + req.params.sid
    const filesDirectory = path.join(path.dirname(require.main.filename) + '/static' + staticDirectoryPath)
    const filePath = `${filesDirectory}/${file.name}`

    fs.existsSync(filesDirectory) || fs.mkdirSync(filesDirectory)

    file.mv(filePath, async function(err) {
      if (err)
        return res.status(500).send(err)

      const nameForDb = path.join(staticDirectoryPath, file.name)
      if(!salon.pictures.includes(nameForDb)) {
        salon.pictures.push(nameForDb)
        await salon.update(salon)

        salon = await fillInOrders(salon.toObject())

        res.status(200).json(salon)
      }
      else {
        res.status(203).json({message: 'file exists'})
      }
    })
  },

  fileDelete: async (req, res, next) => {
    let {url, salon} = req.body
    const fileName = url.substr(url.lastIndexOf('/') + 1)
    const staticDirectoryPath = '/images/salons/' + req.params.sid
    const filesDirectory = path.join(path.dirname(require.main.filename) + '/static' + staticDirectoryPath)
    const filePath = `${filesDirectory}/${fileName}`

    fs.unlink(filePath, async function(err) {
      if (err)
        return res.status(500).send(err)

      const nameForDb = path.join(staticDirectoryPath, fileName)
      if(salon.pictures.includes(nameForDb)) {
        salon.pictures = salon.pictures.filter(url => url !== nameForDb)
        await salon.update(salon)

        salon = await fillInOrders(salon.toObject())

        res.status(200).json(salon)
      }
      else {
        res.status(203).json({message: 'file not exists'})
      }
    })
  },

  list: async (req, res, next) => {
    let salons = []
    const filters = req.value.body.filters
    const current = parseInt(req.params.current)
    let total = 0
    const genericFilter = {blocked: false}
    const fieldsToGet = {_id: 1, sid: 1, adminMid: 1, name: 1, avatar: 1, phone: 1, description: 1, address: 1, metro: 1, site: 1, businesses: 1, schedule: 1, active: 1}

    if(filters.metro && filters.metro.length) {
      salons = await Salon.find({metro: {$in: filters.metro}, ...genericFilter}, fieldsToGet)
    }
    else if(filters.name && filters.name.length) {
      salons = await Salon.find({name: filters.name, ...genericFilter}, fieldsToGet)
    }
    else {
      salons = await Salon.find({...genericFilter}, fieldsToGet)
    }

    if(salons.length) {
      const paginator = new Paginator(12) // parameter - items per page
      total = salons.length
      const pagination_info = paginator.build(total, current)
      salons = salons.slice(pagination_info.first_result, pagination_info.last_result + 1)
    }

    res.status(200).json({total, current, salons, filters})
  },

  find: async (req, res, next) => {
    const salons = await Salon.find({
      name: {
        $regex: `^.*${req.params.string}.*`,
        $options: 'si'
      },
      blocked: false,
    }, {name: 1, _id: 0})

    const salonsNames = salons.length ? R.uniq(salons.map(salon => salon.name)) : []

    res.status(200).json(salonsNames)
  },

  salon: async (req, res, next) => {
    const {sid} = req.params
    const fieldsToGet = {_id: 1, sid: 1, name: 1, avatar: 1, phone: 1, description: 1, address: 1, metro: 1, site: 1, businesses: 1, schedule: 1, active: 1}
    const salon = await Salon.findOne({sid: sid}, fieldsToGet)

    res.status(200).json(salon)
  },

  scrap: async (req, res, next) => {
    const salons = await scrap.scrap('sm', 'scrap')

    res.status(200).json(salons)
  },

  scrapPage: async (req, res, next) => {
    const salons = await scrap.scrap('sm', 'scrapPage')

    res.status(200).json(salons)
  }
}
