const mongoose = require('mongoose');

const pokemonCollectionSchema = new mongoose.Schema({
  pokeid: {
    type: String,
    sparse: true,
  },
  name: {
    type: String,
  },
  is_legendary: {
    type: Boolean,
  },
});

const userDataSchema = new mongoose.Schema({
  userid: {
    type: String,
    required: true,
    unique: true,
  },
  credits: {
    type: Number,
    default: 1000,
  },
  pokemonCollection: [pokemonCollectionSchema],
});

module.exports = mongoose.model('userData', userDataSchema);
