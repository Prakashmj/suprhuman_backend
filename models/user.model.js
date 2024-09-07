const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  uniqueId: {
    type: String,
    required: false,
  },
  signupCoin: {
    type: Number,
    required: false,
  },
  userToken: {
    type: String,
    required: false,
  },
  characterImage: {
    type: String,
    required: false,
  },
  characterId: {
    type: String,
    required: false,
  },
  level: {
    type: Number,
    default: 1,
  },
  coinsPerMinute: {
    type: Number,
    default: 0,
  },
  coinsEarnToday: {
    type: Number,
    default: 0,
  },
  energy: {
    current: {
      type: Number,
      default: 1000,
    },
    max: {
      type: Number,
      default: 1000,
    },
  },
});

// Virtual property to format coinsPerMinute
userSchema.virtual("formattedCoinsPerMinute").get(function () {
  return formatNumber(this.coinsPerMinute);
});

// Virtual property to format signupCoin
userSchema.virtual("formattedSignupCoin").get(function () {
  return formatNumberWithCommas(this.signupCoin);
});

// Function to format numbers with thousands separators
function formatNumberWithCommas(num) {
  if (num === null || num === undefined) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Function to format numbers with 'k' and 'M'
function formatNumber(num) {
  if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + "M";
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + "k";
  }
  return num.toString();
}

module.exports = mongoose.model("User", userSchema);
