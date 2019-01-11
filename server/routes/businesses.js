const router = require('express-promise-router')()
require('@controllers/users/passport')
const passport = require('passport')
const authenticate = require('@controllers/admin/authenticate')

const {validateBody, schemas} = require('./helpers')
const BusinessController = require('@controllers/businesses')

router.route('/')
  .get(BusinessController.list)

module.exports = router
