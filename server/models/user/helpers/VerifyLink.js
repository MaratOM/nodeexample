const url = require('url')
const userHelpers = require('./index')

class VerifyLink {
  constructor(linkType) {
    this.host = process.env.CLIENT_HOST
    this.linkType = linkType
    this.generateLink()
  }

  generateLink() {
    this.linkCode = userHelpers.generateRandon('verifyLink')

    this.link = url.resolve(this.host, `sign/verify/${this.linkType}/${this.linkCode}`)
  }

  getLinkDbData() {
    let date = new Date()
    date.setDate(date.getDate() + 1000)
    return {
      code: this.linkCode,
      type: this.linkType,
      expTime: date,
      used: false,
    }
  }

  getLinkType() {
    return this.linkType
  }

  getLink() {
    return this.link
  }

  getLinkCode() {
    return this.linkCode
  }

  saveLink() {

  }
}

module.exports = VerifyLink
