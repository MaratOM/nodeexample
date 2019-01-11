const router = require('express-promise-router')()
require('@controllers/users/passport')
const passport = require('passport')
const authenticate = require('@controllers/users/authenticate')

const {validateBody, schemas} = require('./helpers')
const UsersController = require('@controllers/users')
const passportJWT = passport.authenticate('jwt', { session: false })

router.route('/')
  .put(passportJWT, validateBody(schemas.userUpdateSchema), authenticate.update, UsersController.update)

router.route('/signup')
  .post(validateBody(schemas.signUpSchema), authenticate.signUp, UsersController.signUp)

router.route('/resetpass')
  .post(validateBody(schemas.resetPassSchema), authenticate.resetPass, UsersController.resetPass)

router.route('/connect-salon')
  .post(validateBody(schemas.userConnectSalonSchema), authenticate.user_id, UsersController.connectSalon)

router.route('/verify/get-link/:type')
  .post(UsersController.getVerifyLink)

router.route('/verify/:type/:code')
  .get(UsersController.verify)

router.route('/avatar/:mateId')
  .post(authenticate.mateId, UsersController.avatar)

router.route('/signin')
  .post(validateBody(schemas.authSchema), authenticate.signIn, UsersController.signIn)

router.route('/refresh/:_id')
  .get(authenticate.user_id, UsersController.refresh)

router.route('/oauth/google')
  .post(passport.authenticate('googleToken', { session: false }), UsersController.googleOAuth)

router.route('/oauth/facebook')
  .post(passport.authenticate('facebookToken', { session: false }), UsersController.facebookOAuth)

router.route('/:mateId')
  .get(passportJWT, UsersController.loadByMateId)

router.route('/:mateId/name')
  .get(UsersController.loadNameByMateId)

router.route('/promocode/:code')
  .get(UsersController.promocodeGet)

router.route('/promocode/add')
  .post(authenticate.promocodeAdd, UsersController.promocodeAdd)

module.exports = router
