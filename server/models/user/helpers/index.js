const bcrypt = require('bcryptjs')

module.exports = {
  cleanUserObject: user => {
    const cleanedUser = user.toObject()
    delete cleanedUser.password
    delete cleanedUser.verifyLink

    if(!cleanedUser.avatar) {
      if(cleanedUser.gender) {
        cleanedUser.avatar = 'images/avatars/default/female.jpg'
      }
      else {
        cleanedUser.avatar = 'images/avatars/default/male.jpg'
      }
    }
    else {
      // To force avatar image updating on image change
      cleanedUser.avatar = `${cleanedUser.avatar}?${Math.random()}`
    }

    return cleanedUser
  },

  encodePassword: async password => {
    const salt = await bcrypt.genSalt(10)
    return  await bcrypt.hash(password, salt)
  },

  generateRandon(type) {
    let text = ''
    let possible
    let length

    switch (type) {
      case 'verifyLink':
        possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        length = 20
        break
      case 'resetPass':
        possible = '0123456789'
        length = 8
        break
      default:
        break
    }

    for (let i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length))

    return text
  }
}
