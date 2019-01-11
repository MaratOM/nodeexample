const config = require('@configuration')
const {parseJWT} = require('@controllers/helpers')
const User = require('@models/user')

module.exports = {
  authSecret: async (req, res, next) => {
    try {
      if(req.headers.authorization === config.adminSecret) {
        next()
      }
      else {
        res.status(500).json({error: 'Wrong secret!'})
      }
    } catch(error) {
      next(error, false)
    }
  },

  authToken: async (req, res, next) => {
    try {
      const _id = parseJWT(req.headers.authorization).sub
      const user = await User.findById(_id)

      if(user && user.roles.includes("ADMIN")) {
        next()
      }
      else {
        res.status(500).json({error: 'Wrong secret!'})
      }
    } catch(error) {
      next(error, false)
    }
  },
}
