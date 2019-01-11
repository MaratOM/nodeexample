const Joi = require('joi')

module.exports = {
  validateBody: (schema) => {
    return (req, res, next) => {
      const result = Joi.validate(req.body, schema, {abortEarly: false})

      if (result.error) {
        const errors = result.error.details.reduce((obj, error) => {
          obj[error.path] = error.message
          return obj
        }, {})

        return res.status(203).json(errors)
      }

      if (!req.value) { req.value = {} }
      req.value['body'] = result.value
      next()
    }
  },

  schemas: {
    authSchema: Joi.object().keys({
      email: Joi.string().required(),
      password: Joi.string().required(),
    }),
    signUpSchema: Joi.object().keys({
      name: Joi.string().required(),
      surname: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      country: Joi.string().required(),
      city: Joi.string().required(),
      password: Joi.string().required(),
      uplineId: Joi.any(),
      promocode: Joi.any(),
      dob: Joi.date(),
      gender: Joi.boolean(),
      newsSubscribed: Joi.boolean(),
      // policyAccepted: Joi.boolean().required(),
    }),
    resetPassSchema: Joi.object().keys({
      email: Joi.string().required(),
    }),
    userUpdateSchema: Joi.object().keys({
      _id: Joi.string().required(),
      avatar: Joi.any(),
      name: Joi.string().required(),
      surname: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      dob: Joi.string().required(),
      country: Joi.string().required(),
      city: Joi.string().required(),
      password: Joi.string(),
      gender: Joi.boolean(),
      newsSubscribed: Joi.boolean(),
      token: Joi.string(),
    }),
    userConnectSalonSchema: Joi.object().keys({
      _id: Joi.string().required(),
      sid: Joi.number().required(),
    }),
    salonAddSchema: Joi.object().keys({
      user_id: Joi.string().required(),
      adminMid: Joi.string().required(),
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      country: Joi.any(),
      city: Joi.any(),
      geo_lat: Joi.any(),
      geo_lon: Joi.any(),
      site: Joi.string().optional().allow(''),
      address: Joi.string().required(),
      description: Joi.string().required(),
      schedule: Joi.string().required(),
      metro: Joi.array().required(),
      businesses: Joi.array(),
      active: Joi.boolean(),
    }),
    salonUpdateSchema: Joi.object().keys({
      _id: Joi.string().required(),
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      country: Joi.any(),
      city: Joi.any(),
      geo_lat: Joi.any(),
      geo_lon: Joi.any(),
      site: Joi.string().optional().allow(''),
      address: Joi.string().required(),
      description: Joi.string().required(),
      schedule: Joi.string().required(),
      metro: Joi.array().required(),
      businesses: Joi.array(),
      active: Joi.boolean(),
    }),
    salonActivateSchema: Joi.object().keys({
      _id: Joi.string().required(),
      active: Joi.boolean(),
    }),
    listSchema: Joi.object().keys({
      filters: Joi.object(),
    }),
    salonByIdSchema: Joi.object().keys({
      filters: Joi.number(),
    }),
    orderAddSchema: Joi.object().keys({
      sid: Joi.number().required(),
      salon_id: Joi.string().required(),
      mateId: Joi.string().required(),
      sumOrder: Joi.string().required(),
      services: Joi.array().required(),
    }),
    orderUpdateSchema: Joi.object().keys({
      order_id: Joi.string().required(),
      sumPon: Joi.number(),
      status: Joi.string().required(),
    }),
  }
}
