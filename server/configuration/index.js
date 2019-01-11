if (process.env.NODE_ENV === 'test') {
  module.exports = {
    JWT_SECRET: 'XXXX',
    oauth: {
      google: {
        clientID: 'number',
        clientSecret: 'string',
      },
      facebook: {
        clientID: 'number',
        clientSecret: 'string',
      },
    },
    adminSecret: 'XXXX',
  }
} else {
  module.exports = {
    JWT_SECRET: 'XXXX',
    oauth: {
      google: {
        clientID: 'test',
        clientSecret: 'test',
      },
      facebook: {
        clientID: 'test',
        clientSecret: 'test',
      },
    },
    adminSecret: 'XXXX',
  }
}
