const Order = require('@models/order')

module.exports = {
  fillInOrders: async object => {
    const ordersArr = await Order.find({oid: {$in: object.orders}})
    const orders = {}
    const ordersPending = {}

    ordersArr.forEach(order => {
      if(order.status !== 'deleted') {
        if (order.status !== 'complete') {
          ordersPending[order.oid] = order
        }
        else {
          orders[order.oid] = order
        }
      }
    })

    object.orders = orders
    object.ordersPending = ordersPending

    return object
  },
}
