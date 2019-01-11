const app = require('../../app')
mailer = require('express-mailer')

mailer.extend(app, {
  from: 'info@podruzhki.online',
  host: 'smtp.gmail.com', // hostname
  secureConnection: true, // use SSL
  port: 465, // port for secure SMTP
  transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
  auth: {
    user: 'podruzhki.online@gmail.com',
    pass: 'po332202',
  }
})

app.mailer.send('email', {
  to: 'maratmikael@gmail.com', // REQUIRED. This can be a comma delimited string just like a normal email to field.
  subject: 'Test Email', // REQUIRED.
  otherProperty: 'Other Property' // All additional properties are also passed to the template as local variables.
}, function (err) {
  if (err) {
    console.log(err)
    // res.send('There was an error sending the email')
  }
  // res.send('Email Sent')
})
