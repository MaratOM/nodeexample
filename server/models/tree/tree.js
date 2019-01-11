const R = require('ramda')
const Tree = require('@models/tree')
const User = require('@models/user')

module.exports = {
  add: async (mateId, uplines) => {
    let treeObject = await Tree.findOne()
    if(!treeObject) {
      await new Tree({
        tree: {A111: {}},
        date: new Date(),
      }).save()
    }
    else {
      const tree = R.clone(treeObject.tree)
      const obj = R.reverse(uplines).reduce((treePart, item) => {
        return treePart[item]
      }, tree)
      obj[mateId] = {}
      treeObject.tree = tree
      await treeObject.save()
    }
  },

  getMates: async ({mateId, uplines}) => {
    uplines.unshift(mateId)
    const treeObject = await Tree.findOne()
    const tree = R.clone(treeObject.tree)
    const userTree = R.reverse(uplines).reduce((treePart, item) => {return treePart[item]}, tree)

    if(!userTree) return []

    let treeMateIds = []
    function rec(object) {
      if(typeof object === 'object') {
        Object.values(object).forEach(obj => {
          treeMateIds = treeMateIds.concat(Object.keys(obj))

          rec(obj)
        })
      }
    }

    treeMateIds = treeMateIds.concat(Object.keys(userTree))
    rec(userTree)

    return await User.find(
      {mateId: {$in: treeMateIds}},
        {mateId: 1, name: 1, surname: 1, avatar: 1, gender: 1, created: 1})
  },
}
