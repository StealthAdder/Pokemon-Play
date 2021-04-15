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
  username: {
    type: String,
  },
  pokeball: {
    pokeballCount: {
      type: Number,
      default: 10,
    },
    limit: {
      type: Number,
      default: 10,
    },
  },
  xp: {
    type: Number,
    default: 0,
  },
  pokemonCollection: [pokemonCollectionSchema],
});

module.exports = mongoose.model('userData', userDataSchema);
