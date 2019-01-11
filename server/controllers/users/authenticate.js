const User = require('@models/user')
const Promocode = require('@models/promocode')
const config = require('@configuration')
const {parseJWT} = require('@controllers/helpers')
const validate = require('../validate')
const roleTypes = require('@models/user/constants/roleTypes')
const verifyTypes = require('@models/user/constants/verifyTypes')
const VerifyLink = require('@models/user/helpers/VerifyLink')
const {sendEmail} = require('@mail')

const phoneSanitize = phoneRaw => {
  let phone = phoneRaw.replace(/[-+()a-zA-ZА-Яа-я\s]/g, '')
  if(phone.length === 10) {
    phone = '+7' + phone
  }
  else {
    if (phone.indexOf('8') === 0) {
      phone = phone.replace('8', '7')
    }
    phone = '+' + phone
  }

  return phone
}

const findUserByEmailOrPhone = async email => {
  let user = null
  let signInType = ''

  if(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,10}$/i.test(email)) {
    user = await User.findOne({"email": email})
    signInType = 'email'
  }
  else if(/^[\d()+\-\s]{10,20}$/ig.test(email)) {
    user = await User.findOne({"phone": phoneSanitize(email)})
    signInType = 'phone'
  }

  return {user, signInType}
}

module.exports = {
  signIn: async (req, res, next) => {
    const {email, password} = req.value.body
    try {
      const {user, signInType} = await findUserByEmailOrPhone(email.toLowerCase())

      if(!user) {
        res.status(203).json({email: req.t(`No such ${signInType}!`)})
        return
      }

      if(user && user.type !== 'salon' && signInType === 'phone') {
        res.status(203).json({email: req.t(`Only salon can sign in with phone number!`)})
        return
      }

      const isMatch = await user.isValidPassword(password)

      if(!isMatch) {
        res.status(203).json({password: req.t('Password is invalid!')})
        return
      }

      if(signInType === 'email') {
        if (!user.emailVerified) {
          const verifyLink = new VerifyLink(verifyTypes.SIGN_UP)
          user.verifyLink = verifyLink.getLinkDbData()
          await user.save()

          await sendEmail(
              verifyLink.getLinkType(),
              user.name,
              user.surname,
              user.email,
              {link: verifyLink.getLink()})

          res.status(203).json({email: req.t('E-mail not verified!')})
          return
        }
      }

      if(user && isMatch) {
        req.user = user
        next()
      }
    } catch(error) {
      next(error, false)
    }
  },

  signUp: async (req, res, next) => {
    try {
      const messages = await validate([
        {model: 'user', field: 'email', req},
        {model: 'user', field: 'phone', req},
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

  resetPass: async (req, res, next) => {
    try {
      const {user, signInType} = await findUserByEmailOrPhone(req.value.body.email)

      if(!user) {
        res.status(203).json({email: req.t(`No such ${signInType}!`)})
      }

      if(user && user.type !== 'salon' && signInType === 'phone') {
        res.status(203).json({email: req.t(`Only salon can use phone number!`)})
      }
      else {
        req.body.user = user
        req.body.signInType = signInType
        next()
      }
    } catch(error) {
      next(error, false)
    }
  },

  update: async (req, res, next) => {
    try {
      const _id = parseJWT(req.headers.authorization).sub

      if(_id !== req.value.body._id) {
        const user = await User.findById(_id)

        if(user.roles.includes(roleTypes.ADMIN)) {
          next()
        }
        else {
          res.status(203).send(req.t('Not allowed!'))
        }
      }
      else {
        next()
      }
    } catch(error) {
      next(error, false)
    }
  },

  user_id: async (req, res, next) => {
    try {
      const _id = parseJWT(req.headers.authorization).sub

      if(_id === req.params._id || _id === req.value.body._id) {
        next()
      }
    } catch(error) {
      next(error, false)
    }
  },

  mateId: async (req, res, next) => {
    try {
      const _id = parseJWT(req.headers.authorization).sub
      const user = await User.findById(_id)

      if(user.mateId === req.params.mateId || _id === req.value.body._id) {
        next()
      }
    } catch(error) {
      next(error, false)
    }
  },

  promocodeAdd: async (req, res, next) => {
    try {
      if(req.headers.authorization === config.adminSecret) {
        const existing = await Promocode.findOne({code: req.body.code})

        if(existing) {
          res.status(500).json({error: 'This code exists'})
        }
        else {
          next()
        }
      }
      else {
        res.status(500).json({error: 'Wrong secret!'})
      }
    } catch(error) {
      next(error, false)
    }
  },
}
