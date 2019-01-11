module.exports = {
  scrap: async (source, endpoint) => {
    const scrap = require(`./${source}`)

    return await scrap[endpoint]()
  },
}
