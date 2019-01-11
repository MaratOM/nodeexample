const router = require('express-promise-router')()
require('@controllers/users/passport')
const passport = require('passport')
const authenticate = require('@controllers/salons/authenticate')

const {validateBody, schemas} = require('./helpers')
const SalonsController = require('@controllers/salons')
const passportJWT = passport.authenticate('jwt', { session: false })

router.route('/list/:current')
  .post(validateBody(schemas.listSchema), SalonsController.list)

router.route('/find/:string')
  .get(SalonsController.find)

router.route('/')
  .post(passportJWT, validateBody(schemas.salonAddSchema), authenticate.address, SalonsController.add)

router.route('/')
  .put(passportJWT, validateBody(schemas.salonUpdateSchema), authenticate.update, authenticate.address, SalonsController.update)

router.route('/activate')
  .put(passportJWT, validateBody(schemas.salonActivateSchema), authenticate.update, SalonsController.update)

router.route('/file/:sid')
  .post(authenticate.file, validateBody(schemas.salonByIdSchema), SalonsController.fileUpload)

router.route('/file/:sid')
  .delete(authenticate.file, SalonsController.fileDelete)

router.route('/scrap')
  .get(SalonsController.scrap)

router.route('/scrap-page')
  .get(SalonsController.scrapPage)

router.route('/:sid')
    .get(passportJWT, SalonsController.salon)

module.exports = router
