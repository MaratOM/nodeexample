const sendpulse = require("@mail/services/lib/sendpulse-api")

const API_USER_ID = "XXXX"
const API_SECRET = "XXXX"
const TOKEN_STORAGE = "/tmp/"

const ADDRESS_BOOK_USERS_MATE_ID = 2164753
const ADDRESS_BOOK_USERS_SALON_ID = 2164755

sendpulse.init(API_USER_ID, API_SECRET, TOKEN_STORAGE)

const answerGetter = function answerGetter(data) {
  console.log(data)
}

module.exports = {
  sendEmail: function(type, name, surname, email, data) {
    const mailTemplate = require(`../templates/mail/${type}`)

    if(type === 'sign_up') {
      const addressBookId = data.type === 'mate' ? ADDRESS_BOOK_USERS_MATE_ID : ADDRESS_BOOK_USERS_SALON_ID
      sendpulse.addEmails(answerGetter, addressBookId, [{
          'email': email,
          'variables': {
            'phone': data.phone,
            'имя': name,
          }
        }
      ])
    }

    sendpulse.smtpSendMail(
      answerGetter,
      mailTemplate(...Array.prototype.slice.call(arguments, 1)))
  },

  sendSms: function(type, phone, pass) {
    const smsTemplate = require(`../templates/sms/${type}`)

    sendpulse.smsSend(answerGetter, 'PODRUZHKI', [phone.replace('+', '')], smsTemplate(pass));
  },
}
