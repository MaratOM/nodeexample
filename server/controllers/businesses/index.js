const Business = require('@models/business')

module.exports = {
  list: async (req, res, next) => {
    const businesses = await Business.find({}, {name: 1, _id: 0})
    const businessesArr = Object.keys(businesses).map((item, index) => businesses[index].name)

    res.status(200).json(businessesArr)
  },
}
