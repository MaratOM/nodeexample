const router = require('express-promise-router')()
require('@controllers/users/passport')
const passport = require('passport')
const authenticate = require('@controllers/admin/authenticate')

const {validateBody, schemas} = require('./helpers')
const AdminController = require('@controllers/admin')

router.route('/')
  .get(authenticate.authSecret, AdminController.general)

router.route('/userTreeMateIds/:mateId')
  .get(authenticate.authSecret, AdminController.userTreeMateIds)

router.route('/salon/default-pass/:phone')
  .get(authenticate.authSecret, AdminController.salonDefaultPass)

router.route('/imageDownload')
  .get(authenticate.authSecret, AdminController.imageDownload)

router.route('/edit/models')
    .get(authenticate.authToken, AdminController.editEntityModels)

router.route('/edit/models/:name')
    .get(authenticate.authToken, AdminController.editEntityModelFields)

router.route('/edit/data')
    .post(authenticate.authToken, AdminController.editEntityData)

router.route('/edit/save')
    .post(authenticate.authToken, AdminController.editEntitySave)

module.exports = router
