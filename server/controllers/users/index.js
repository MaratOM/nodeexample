const path = require('path')
const JWT = require('jsonwebtoken')
const {thumb} = require('node-thumbnail')
const User = require('@models/user')
const Salon = require('@models/salon')
const Promocode = require('@models/promocode')
const Commission = require('@models/commission')
const Balance = require('@models/balance')
const roleTypes = require('@models/user/constants/roleTypes')
const verifyTypes = require('@models/user/constants/verifyTypes')
const userHelpers = require('@models/user/helpers')
const generateMid = require('@models/user/helpers/generateMid')
const tree = require('@models/tree/tree')
const VerifyLink = require('@models/user/helpers/VerifyLink')
const {fillInOrders} = require('@models/order/order')
const {sendEmail, sendSms, adminMail} = require('@mail')
const { JWT_SECRET } = require('@configuration')
const validate = require('../validate')

const signToken = user => {
  return JWT.sign({
    iss: 'podruzkionline',
    sub: user.id,
    iat: new Date().getTime(), // current time
    exp: new Date().setDate(new Date().getDate() + 1) // current time + 1 day ahead
  }, JWT_SECRET)
}

const fillInAdditionalData = async user => {
  if(user.type === 'mate') {
    user = await fillInOrders(user)
    user.mates = await tree.getMates(user)
  }
  const resData = {user}

  if(user.type === 'salon') {
    let salon = await Salon.findOne({'user_id': user._id})

    if (salon) {
      resData.salon = await fillInOrders(salon.toObject())
    }
  }

  return resData
}

module.exports = {
  signUp: async (req, res, next) => {
    //Flag to generate correct mid when first user is adding to empty db
    const first = false
    const userData = req.value.body
    const defaultUplineId = 'A111'
    const created = new Date()

    if(typeof userData.uplineId === 'string') {
      if(!userData.uplineId) {
        userData.uplineId = defaultUplineId
        userData.uplines = [defaultUplineId]
      }
      else {
        userData.uplineId = userData.uplineId.toUpperCase()
        const upline = await User.findOne({'mateId': userData.uplineId})
        userData.uplines = [...upline.uplines]
        userData.uplines.unshift(userData.uplineId)

        upline.data.matesCount += 1
        await upline.save()
      }
      userData.type = 'mate'
      userData.mateId = await generateMid(userData.type, first)

      await tree.add(userData.mateId, userData.uplines)

      userData.roles = [roleTypes.MEMBER, roleTypes.MATE]
      userData.avatar = userData.gender ? '/images/avatars/default/female.jpg' : '/images/avatars/default/male.jpg'

      if(userData.promocode) {
        const defaultMate = await User.findOne({mateId: defaultUplineId})
        const promocode = await Promocode.findOne({code: userData.promocode})
        const {code, source, sum} = promocode
        userData.promocodes = {
          [code] : {
            source,
            sum,
          }
        }
        userData.data = {balance: sum}
        userData.balance = [{
          type: 'promocode',
          created,
          customerId: defaultMate.mateId,
          customerName: defaultMate.name,
          customerAvatar: defaultMate.avatar,
          sum,
        }]

        await new Balance({
          bid: 0,
          type: 'promocode',
          sum,
          created,
          data: {
            customerId: defaultMate.mateId,
            customerName: defaultMate.name,
            customerAvatar: defaultMate.avatar,
          }
        }).save()
      }
    }
    else {
      delete userData.uplineId
      userData.type = 'salon'
      userData.mateId = await generateMid(userData.type, first)
      userData.roles = [roleTypes.MEMBER, roleTypes.SALON_ADMIN, roleTypes.SALON_OWNER]
      userData.avatar = '/images/avatars/default/salon.jpg'
    }

    userData.blocked = false
    userData.emailVerified = false
    userData.policyAccepted = true
    userData.active = false
    userData.created = created
    userData.modified = created
    userData.lastLogin = created

    const verifyLink = new VerifyLink(verifyTypes.SIGN_UP)
    userData.verifyLink = verifyLink.getLinkDbData()

    const newUser = new User({
      uid: 0,
      ...userData,
    })

    const savedUser = await newUser.save()
    
    await sendEmail(
      verifyLink.getLinkType(),
      userData.name,
      userData.surname,
      userData.email,
      {
        phone: userData.phone,
        type: userData.type,
        link: verifyLink.getLink(),
      })

    await sendEmail(
      'admin_user_added',
      'Подружки.Онлайн',
      'Администратор',
      adminMail,
      {...userData})

    const token = signToken(newUser)

    res.status(200).json({
      ...userHelpers.cleanUserObject(savedUser),
      token,
    })
  },

  avatar: async (req, res, next) => {
    if (!req.files)
      return res.status(400).send(req.t('No files were uploaded.'))

    const avatar = req.files.avatar
    const staticDirectoryPath = '/images/avatars'
    const filesDirectory = path.join(path.dirname(require.main.filename) + '/static' + staticDirectoryPath)
    let fileExtension = avatar.name.substring(avatar.name.lastIndexOf('.'), avatar.name.length).toLowerCase()
    fileExtension = fileExtension === 'jpeg' ? 'jpg' : fileExtension
    const fileName = req.params.mateId + fileExtension
    const filePath = `${filesDirectory}/${fileName}`
    let thumbWidth

    avatar.mv(filePath, async function(err) {
      if (err)
        return res.status(500).send(err)

      const updatedUser = await User.findOneAndUpdate(
        {mateId: req.params.mateId},
        {$set: {
          avatar: path.join(staticDirectoryPath, fileName)
        }},
        {new: true}
      )

      if(updatedUser.type === 'salon') {
        await Salon.findOneAndUpdate(
          {user_id: updatedUser._id},
          {
            $set: {
              avatar: path.join(staticDirectoryPath, fileName)
            }
          },
          {new: true}
        )

        thumbWidth = 420
        await thumb({
          source: filePath,
          destination: `${filesDirectory}/thumbnails/${thumbWidth}`,
          width: thumbWidth,
          suffix: '',
          overwrite: true,
        })

        thumbWidth = 670
        await thumb({
          source: filePath,
          destination: `${filesDirectory}/thumbnails/${thumbWidth}`,
          width: thumbWidth,
          suffix: '',
          overwrite: true,
        })
      }

      thumbWidth = 100
      await thumb({
        source: filePath,
        destination: `${filesDirectory}/thumbnails/${thumbWidth}`,
        width: thumbWidth,
        suffix: '',
        overwrite: true,
      })

      thumbWidth = 200
      await thumb({
        source: filePath,
        destination: `${filesDirectory}/thumbnails/${thumbWidth}`,
        width: thumbWidth,
        suffix: '',
        overwrite: true,
      })

      const {user} = await fillInAdditionalData(userHelpers.cleanUserObject(updatedUser))
      res.status(200).json(user)
    })
  },

  signIn: async (req, res, next) => {
    if(req.user.type === 'salon' && new Date(req.user.lastLogin) < new Date('2018-12-01')) {
      await sendEmail(
        'admin_salon_first_login',
        'Подружки.Онлайн',
        'Администратор',
        adminMail,
        {
          name: req.user.name,
          mateId: req.user.mateId,
          phone: req.user.phone,
        })
    }

    await User.update({_id: req.user._id}, {$set: {lastLogin: new Date()}})

    const token = signToken(req.user)
    const user = {...userHelpers.cleanUserObject(req.user), token}
    const resData = await fillInAdditionalData(user)

    res.status(200).json(resData)
  },

  resetPass: async (req, res, next) => {
    const {user, signInType} = req.body
    const pass = userHelpers.generateRandon('resetPass')
    user.password = pass
    await user.save()

    if(signInType === 'email') {
      await sendEmail(
        'reset_pass',
        user.name,
        user.surname,
        user.email,
        {pass})
    }
    else if(signInType === 'phone') {
      await sendSms(
        'reset_pass',
        user.phone,
        pass)
    }

    res.status(200).json({message: req.t(`New password is sent to your ${signInType}`)})
  },

  update: async (req, res, next) => {
    const messages = await validate([{model: 'user', field: 'phone', req}])
    if(messages) {
      res.status(203).json(messages)
      return
    }

    const userData = req.value.body
    const user_id = userData._id
    delete userData._id

    if(userData.password) {
      userData.password = await userHelpers.encodePassword(userData.password)
    }

    userData.modified = new Date()

    await User.findByIdAndUpdate(user_id, {$set:{...userData}}, {new: true}, async function(err, updatedUser){
      if(err){
        throw new Error(err)
      }

      if(updatedUser.avatar.indexOf('default')) {
        if(updatedUser.gender && updatedUser.avatar !== '/images/avatars/default/female.jpg') {
          updatedUser.avatar = '/images/avatars/default/female.jpg'
          updatedUser.save()
        }
        else if(!updatedUser.gender && updatedUser.avatar !== '/images/avatars/default/male.jpg') {
          updatedUser.avatar = '/images/avatars/default/male.jpg'
          updatedUser.save()
        }
      }

      const {user} = await fillInAdditionalData(userHelpers.cleanUserObject(updatedUser))
      res.status(200).json(user)
    })
  },

  refresh: async (req, res, next) => {
    try {
      await User.findByIdAndUpdate(req.params._id, {$set: {modified: new Date()}}, {new: true}, async function (err, updatedUser) {
        if (err) {
          throw new Error(err)
        }

        try {
          const user = await fillInAdditionalData(userHelpers.cleanUserObject(updatedUser))
          res.status(200).json(user)
        } catch(error) {
          res.status(203).json({'Error: ': error})
          next(error, false)
        }
      })
    } catch(error) {
      next(error, false)
    }
  },

  getVerifyLink: async (req, res, next) => {
    // TODO
  },

  verify: async (req, res, next) => {
    debugger
    const {type, code} = req.params

    try {
      const updatedUser = await User.findOneAndUpdate({
            'verifyLink.type': type,
            'verifyLink.code': code,
            'verifyLink.used': false,
          },
          {$set: {
            'active': true,
            'emailVerified': true,
            'verifyLink.used': true,
          }}
      )

      if (updatedUser) {
        res.status(200).json({
          verified: true,
          message: req.t('User email verified! You can sign in now!'),
        })
      }
      else {
        res.status(200).json({
          verified: false,
          message: req.t('No verification link or link is expired!'),
        })
      }
    } catch(error) {
      next(error, false)
    }
  },

  googleOAuth: async (req, res, next) => {
    // Generate token
    const token = signToken(req.user)
    res.status(200).json({ token })
  },

  facebookOAuth: async (req, res, next) => {
    // Generate token
    const token = signToken(req.user)
    res.status(200).json({ token })
  },

  loadByMateId: async (req, res, next) => {
    const user = await User.findOne({
      'mateId': req.params.mateId.toUpperCase(),
    })

    if(!user) {
      res.status(203).json({mateId: req.t('Wrong ID!')})
      return
    }

    res.status(200).json(user)
  },

  loadNameByMateId: async (req, res, next) => {
    const user = await User.findOne({
      'mateId': req.params.mateId.toUpperCase(),
    })

    if(!user) {
      res.status(203).json({mateId: req.t('Wrong ID!')})
      return
    }

    res.status(200).json({name: user.name, surname: user.surname})
  },

  promocodeGet: async (req, res, next) => {
    const promocode = await Promocode.findOne({
      code : req.params.code.toUpperCase(),
    })

    if(!promocode) {
      res.status(203).json({promocode: req.t('Wrong Promo Code!')})
      return
    }

    res.status(200).json({sum: promocode.sum})
  },

  promocodeAdd: async (req, res, next) => {
    const promocodeData = req.body
    const created = new Date()
    promocodeData.created = created
    const expTime = new Date()
    expTime.setFullYear(expTime.getFullYear() + 1)
    promocodeData.expTime = expTime
    promocodeData.active = true

    let promocode = new Promocode({
      pid: 0,
      ...promocodeData,
    })

    promocode = await promocode.save()

    if(!promocode) {
      res.status(500).json({error: 'Error saving promo code'})
      return
    }

    res.status(200).json(promocode)
  },

  connectSalon: async (req, res, next) => {
    const {_id, sid} = req.value.body
    const loadedUser = await User.findById(_id)
    const connectSalons = {...loadedUser.connectSalons}

    const calledTimes = Object.keys(connectSalons).map(sid => new Date(connectSalons[sid].called).getTime())
    const lastCall = Math.max.apply(null, calledTimes)

    if(new Date().getTime() - lastCall < 1000 * 60 * 2) {
      res.status(203).json({})
    }
    else {
      connectSalons[sid] = {
        called: new Date(),
        connected: '',
      }
      loadedUser.connectSalons = connectSalons
      const savedUser = await loadedUser.save()

      const salon = await Salon.findOne({sid})
      if (!salon.connectMates.includes(savedUser.mateId)) {
        const connectMates = [...salon.connectMates]
        connectMates.push(savedUser.mateId)
        salon.connectMates = connectMates
        await salon.save()
      }

      const {user} = await fillInAdditionalData(userHelpers.cleanUserObject(savedUser))
      res.status(200).json(user)
    }
  },
}
