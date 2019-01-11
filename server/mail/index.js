const {sendEmail, sendSms} = require('./services/sendpulse')
const adminMail = ['zenpatrol@gmail.com']

module.exports = {sendEmail, sendSms, adminMail}
