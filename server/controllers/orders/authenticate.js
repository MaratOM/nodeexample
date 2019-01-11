const {parseJWT} = require('@controllers/helpers')
const Order = require('@models/order')
const User = require('@models/user')
const Salon = require('@models/salon')

module.exports = {
  add: async (req, res, next) => {
    try {
      const _id = parseJWT(req.headers.authorization).sub
      const salon = await Salon.findById(req.value.body.salon_id)

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

  update: async (req, res, next) => {
    if(req.value.body.status === 'clientConfirm') {
      try {
        const user_id = parseJWT(req.headers.authorization).sub
        const order = await Order.findById(req.value.body.order_id)
        const user = await User.findById(user_id)

        if (!order || !user
            || user.mateId !== order.mateId) {
          res.status(203).send(req.t('Not allowed!'))
        }
        else if (user.data.balance < req.value.body.sumPon) {
          res.status(203).send(req.t('You have not enough Pones'))
        }
        else if (order.status !== 'created') {
          res.status(203).send(req.t('This order was already confirmed by client'))
        }
        else {
          req.value.body.user = user
          req.value.body.order = order
          next()
        }
      }
      catch (error) {
        next(error, false)
      }
    }

    else if(req.value.body.status === 'complete') {
      try {
        const user_id = parseJWT(req.headers.authorization).sub
        const order = await Order.findById(req.value.body.order_id)
        const salon = await Salon.findOne({user_id})

        if (!order || !salon
            || salon.sid !== order.sid
            || order.status !== 'clientConfirmed') {
          res.status(203).send(req.t('Not allowed!'))
        }
        else {
          req.value.body.order = order
          req.value.body.salon = salon
          next()
        }
      }
      catch (error) {
        next(error, false)
      }
    }
  },

  delete: async (req, res, next) => {
    try {
      const user_id = parseJWT(req.headers.authorization).sub
      const order = await Order.findById(req.params.id)
      const salon = await Salon.findOne({user_id})

      if (!order || !salon
          || salon.sid !== order.sid
          || order.status !== 'created') {
        res.status(203).send(req.t('Not allowed!'))
      }
      else {
        req.body.order = order
        req.body.salon = salon
        next()
      }
    }
    catch (error) {
      next(error, false)
    }
  }
}
