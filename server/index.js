require('dotenv').config()
require('module-alias/register')
const app = require('./app')

// Start the server
const port = process.env.PORT || 4000
app.listen(port)
console.log(`Server listening at ${port}`)
