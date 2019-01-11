const field = async (model, field, req) => {
  const Model = require('@models/' + model)
  const found = await Model.findOne({[field]: req.value.body[field]})

  if(found) {
    const fieldNameFormatted = field.charAt(0).toUpperCase() + field.slice(1)
    const message = req.t(`${fieldNameFormatted} is already in use!`)

    if(req.value.body._id && found._id.toString() !== req.value.body._id) {
      return message
    }
    else if(!req.value.body._id) {
      return message
    }
  }

  return null
}

module.exports = async data => {
  const messages = {}
  for (let item of data) {
    const message = await field(item.model, item.field, item.req)
    if(message) {
      messages[item.field] = message
    }
  }

  return Object.keys(messages).length ? messages : null
}
