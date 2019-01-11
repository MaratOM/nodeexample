const User = require('@models/user')
const Commission = require('@models/commission')
const Balance = require('@models/balance')

const entirePercent = 27
const percents = [5, 4, 3, 2, 1]

module.exports = {
  calculate: async order => {
    const orderData = {
      cid: 0,
      oid: order.oid,
      sid: order.sid,
      customerId: order.mateId,
      created: new Date(),
    }

    // test data
    // const mates_0 = [ 'N262', 'N261', 'N251', 'A111' ]
    // const mates_1 = [ 'N262', 'N261', 'N251', 'N236', 'N235',  'N234', 'N233', 'A111' ]

    let mateId
    let percentsPaid = 0
    let sum = 0
    let percent
    let level
    const commission = {}
    order.commission = []

    for(let i = 0; i < order.mates.length; i++) {
      mateId = order.mates[i]
      if(mateId !== 'A111') {
        if(percents[i]) {
          percent = percents[i]
          sum = order.sumOrder / 100 * percent
          level = i

          commission[mateId] = {
            ...orderData,
            mateId,
            percent,
            sum,
            level,
          }
          percentsPaid += percents[i]

          order.commission.push({mateId, sum})
          await new Commission(commission[mateId]).save()

          await new Balance({
            bid: 0,
            type: 'commission',
            sum,
            created: order.created,
            data: {
              oid: order.oid,
              customerId: order.mateId,
              customerName: order.mateName,
              customerAvatar: order.mateAvatar,
              customerGender: order.mateGender,
              percent,
              level,
            }
          }).save()

          const user = await User.findOne({mateId})
          user.balance.push({
            type: 'commission',
            oid: order.oid,
            created: order.created,
            customerId: order.mateId,
            customerName: order.mateName,
            customerAvatar: order.mateAvatar,
            customerGender: order.mateGender,
            percent,
            sum,
            level,
          })
          user.data.balance += sum

          await user.save()
        }
      }
      else {
        const percent = entirePercent - percentsPaid
        sum = order.sumOrder / 100 * percent

        commission[mateId] = {
          ...orderData,
          mateId: mateId,
          percent: percent,
          sum: sum,
          level: 1000,
        }

        await new Commission(commission[mateId]).save()
      }
    }

    await order.save()
  },
}
