const mongoose = require('mongoose')
const Schema = mongoose.Schema

const treeSchema = new Schema({
  tree: {
    type: Object,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
}, { minimize: false })

const Tree = mongoose.model('Tree', treeSchema)

module.exports = Tree
