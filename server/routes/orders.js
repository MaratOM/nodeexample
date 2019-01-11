const router = require('express-promise-router')()
require('@controllers/users/passport')
const passport = require('passport')
const authenticate = require('@controllers/orders/authenticate')

const {validateBody, schemas} = require('./helpers')
const OrdersController = require('@controllers/orders')
const passportJWT = passport.authenticate('jwt', { session: false })

router.route('/')
  .post(validateBody(schemas.orderAddSchema), authenticate.add, OrdersController.add)

router.route('/')
  .put(validateBody(schemas.orderUpdateSchema), authenticate.update, OrdersController.update)

router.route('/:id')
  .delete(authenticate.delete, OrdersController.delete)

module.exports = router
