const mongoose = require("mongoose");

const restrintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
    required: false,
  },
  level: {
    type: Number,
    required: false,
  },
  cost: {
    type: String,
    required: false,
  },
  coinMin: {
    type: Number,
    required: false,
  },
  icon: {
    type: String,
    required: false,
  },
  quote: {
    type: String,
    required: false,
  },
});

const upgradeSchema = new mongoose.Schema({
  RESTRAINTS: [restrintSchema],
});

module.exports = mongoose.model("Restrint", upgradeSchema);
