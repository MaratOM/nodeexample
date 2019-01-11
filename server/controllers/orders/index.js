const Order = require('@models/order')
const User = require('@models/user')
const Salon = require('@models/salon')
const Balance = require('@models/balance')
const commission = require('@models/commission/calculation')
const validate = require('../validate')

const orderCompleteUserUpdate = async (order, user) => {
  const {oid, sid, salonName, salonAvatar, sumOrder, sumPon, created, services} = order

  await new Balance({
    bid: 0,
    type: 'order',
    sum: -sumPon,
    created,
    data: {
      oid,
      sid,
      salonName,
      salonAvatar,
      sumOrder,
      services,
    }
  }).save()

  user.balance.push({
    type: 'order',
    oid,
    sid,
    salonName,
    salonAvatar,
    sum: -sumPon,
    sumOrder,
    created,
    services,
  })

  if(typeof user.salons === 'undefined') {
    user.salons = {}
  }

  if(sid in user.salons) {
    const {ordersCount, ordersSum} = user.salons[sid]
    user.salons[sid].ordersCount = ordersCount + 1
    user.salons[sid].ordersSum = ordersSum + sumOrder
  }
  else {
    user.salons[sid] = {
      name: salonName,
      avatar: salonAvatar,
      ordersCount: 1,
      ordersSum: sumOrder,
    }
  }

  user.data.ordersVolume += sumOrder
  user.data.ordersCount += 1
  user.data.paidPones += sumPon

  return await user.update(user)
}

const orderCompleteSalonUpdate = async (order, user, salon) => {
  const {mateId, sumOrder} = order
  salon.data.ordersVolume += sumOrder
  salon.data.ordersCount += 1

  if(typeof salon.clients === 'undefined') {
    salon.clients = {}
  }

  if(mateId in salon.clients) {
    const {ordersCount, ordersSum} = salon.clients[mateId]
    salon.clients[mateId].ordersCount = ordersCount + 1
    salon.clients[mateId].ordersSum = ordersSum + sumOrder
  }
  else {
    salon.clients[mateId] = {
      name: `${user.name} ${user.surname}`,
      avatar: user.avatar || '',
      gender: user.gender,
      ordersCount: 1,
      ordersSum: sumOrder,
    }

    salon.data.clientsCount += 1
  }

  return await salon.update(salon)
}

module.exports = {
  add: async (req, res, next) => {
    const orderData = req.value.body

    const salon_id = orderData.salon_id
    delete orderData.salon_id

    const salon = await Salon.findById(salon_id)
    const user = await User.findOne({mateId: orderData.mateId})
    
    orderData.created = new Date()
    orderData.status = 'created'
    orderData.statuses = {created: new Date()}

    orderData.mateName = `${user.name} ${user.surname}`
    orderData.mateAvatar = user.avatar
    orderData.mateGender = user.gender
    orderData.mates = [...user.uplines]

    orderData.salonName = salon.name
    orderData.salonAvatar = salon.avatar || ''

    orderData.sumPon = 0
    orderData.sumRub = orderData.sumOrder

    const newOrder = new Order({
      oid: 0,
      ...orderData,
    })

    const savedOrder = await newOrder.save()

    if(!salon.orders.includes(savedOrder.oid)) {
      salon.orders.push(savedOrder.oid)
    }
    salon.save()

    if(!user.orders.includes(savedOrder.oid)) {
      user.orders.push(savedOrder.oid)
    }
    delete password
    user.save()

    res.status(200).json(savedOrder)
  },

  update: async (req, res, next) => {
    if(req.value.body.status === 'clientConfirm') {
      const {sumPon, user, order} = req.value.body
      let savedOrder = null

      if (order.sumOrder >= sumPon && order.status === 'created') {
        order.sumPon = sumPon
        order.sumRub = order.sumOrder - sumPon
        order.status = 'clientConfirmed'
        order.statuses = {...order.statuses, clientConfirmed: new Date()}

        savedOrder = await order.save()
      }

      if (savedOrder) {
        user.data.balance = user.data.balance - sumPon
        const savedUser = await user.save()

        if (savedUser) {
          res.status(200).json({ok: 'Ok'})
        }
        else {
          res.status(203).json({error: 'Error saving user'})
        }
      }
      else {
        res.status(203).json({error: 'Error saving order'})
      }
    }

    else if(req.value.body.status === 'complete') {
      const {order, salon} = req.value.body

      order.status = 'complete'
      order.statuses = {...order.statuses, complete: new Date()}

      const savedOrder = await order.save()

      if (savedOrder) {
        const {mateId} = savedOrder
        await commission.calculate(savedOrder)

        const user = await User.findOne({mateId})
        await orderCompleteUserUpdate(savedOrder, user)
        await orderCompleteSalonUpdate(order, user, salon)

        res.status(200).json({ok: 'Ok'})
      }
      else {
        res.status(203).json({error: 'Error saving order'})
      }
    }
  },

  delete: async (req, res, next) => {
    const {order, salon}  = req.body
    const user = await User.findOne({mateId: order.mateId})
    user.orders = user.orders.filter(orderId => orderId !== order.oid)
    await user.save()

    salon.orders = salon.orders.filter(orderId => orderId !== order.oid)
    await salon.save()

    order.status = 'deleted'
    order.statuses = {...order.statuses, deleted: new Date()}

    const orderRemoved = await order.save()

    if (orderRemoved) {
      res.status(200).json({ok: 'Ok'})
    }
    else {
      res.status(203).json({error: 'Error removing order'})
    }
  },
}
