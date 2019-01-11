const Salon = require('@models/salon')
const validate = require('@controllers/validate')
const {parseJWT} = require('@controllers/helpers')

module.exports = {
  address: async (req, res, next) => {
    try {
      const messages = await validate([
        {model: 'salon', field: 'address', req},
      ])
      if(messages) {
        res.status(203).json(messages)
      }
      else {
        next()
      }
    } catch(error) {
      next(error, false)
    }
  },

  update: async (req, res, next) => {
    try {
      const _id = parseJWT(req.headers.authorization).sub
      const salon = await Salon.findById(req.value.body._id)

      if(_id !== salon.user_id.toString()) {
        res.status(203).send(req.t('Not allowed!'))
      }
      else {
        next()
      }
    } catch(error) {
      next(error, false)
    }
  },

  file: async (req, res, next) => {
    try {
      const _id = parseJWT(req.headers.authorization).sub
      const salon = await Salon.findOne({sid: req.params.sid})
      
      if(_id !== salon.user_id.toString()) {
        res.status(203).send(req.t('Not allowed!'))
      }
      else {
        req.body.salon = salon
        next()
      }
    } catch(error) {
      next(error, false)
    }
  },
}
