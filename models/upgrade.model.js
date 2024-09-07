const mongoose = require("mongoose");

const enhancementSchema = new mongoose.Schema({
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
    set: (value) => Math.floor(value),
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
  ENHANCEMENT: [enhancementSchema],
});

module.exports = mongoose.model("Upgrade", upgradeSchema);
