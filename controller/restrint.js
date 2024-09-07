const Restrint = require("../models/restrint.model");
const mongoose = require("mongoose");

const User = require("../models/user.model");
const createRestrint = async (req, res) => {
  try {
    const { userId, name, level, cost, coinMin, icon, quote } = req.body;

    // Find the existing upgrade document or create a new one
    let upgrade = await Restrint.findOne();
    if (!upgrade) {
      // If no upgrade document exists, create a new one
      upgrade = new Restrint({
        RESTRAINTS: [],
      });
    }

    // Create a new restraint object
    const newRestraint = {
      userId,
      name,
      level,
      cost,
      coinMin,
      icon,
      quote,
    };

    // Add the new restraint to the RESTRAINTS array
    upgrade.RESTRAINTS.push(newRestraint);

    // Save the updated upgrade document to the database
    const savedUpgrade = await upgrade.save();

    // Send a success response
    res.status(201).json(savedUpgrade);
  } catch (error) {
    console.error("Error creating upgrade:", error);
    res.status(500).json({ error: "Failed to create upgrade" });
  }
};

const getAllRestrint = async (req, res) => {
  try {
    // Fetch all documents from the Restrint collection
    const upgrades = await Restrint.find();

    // Send a success response with the fetched upgrades
    res.status(200).json(upgrades);
  } catch (error) {
    console.error("Error fetching upgrades:", error);
    res.status(500).json({ error: "Failed to fetch upgrades" });
  }
};

const updateCoinsPerMinute = async (req, res) => {
  try {
    const { userId, coinMin } = req.body;

    if (!userId || coinMin === undefined) {
      return res.status(400).json({ error: "userId and coinMin are required" });
    }

    // Fetch the current user's coinsPerMinute value
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate the new coinsPerMinute value
    const newCoinsPerMinute = (user.coinsPerMinute || 0) + coinMin;

    // Update the user's coinsPerMinute value in the database
    await User.findByIdAndUpdate(userId, { coinsPerMinute: newCoinsPerMinute });

    res.status(200).json({ message: "coinsPerMinute updated successfully" });
  } catch (error) {
    console.error("Error updating coinsPerMinute:", error);
    res.status(500).json({ error: "Failed to update coinsPerMinute" });
  }
};

const updateRestrint = async (req, res) => {
  try {
    const { _id, restrintId } = req.params;

    // Validate the parameters
    if (
      !mongoose.Types.ObjectId.isValid(_id) ||
      !mongoose.Types.ObjectId.isValid(restrintId)
    ) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Find the Restrint document by its _id
    const restrint = await Restrint.findById(_id);

    if (!restrint) {
      return res.status(404).json({ error: "Restrint not found" });
    }

    // Find the specific restrint item by its _id within the RESTRAINTS array
    const restrintItem = restrint.RESTRAINTS.find(
      (item) => item._id.toString() === restrintId
    );

    if (!restrintItem) {
      return res.status(404).json({ error: "Restrint item not found" });
    }

    // Extract userId from the last item in the RESTRAINTS array
    const userId = restrint.RESTRAINTS.find((item) => item.userId)?.userId;

    // Check if userId exists
    if (!userId) {
      return res.status(404).json({ error: "User ID not found in restrint" });
    }

    // Find the user associated with this restrint
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate the cost
    const costNumeric = parseFloat(restrintItem.cost.replace(/k/i, "")) * 1000; // Convert cost to a numeric value (e.g., 3k -> 3000)

    // Calculate the new coinMin value
    const newCoinMin = restrintItem.coinMin + restrintItem.coinMin * 0.2;

    // Check if the user has enough signupCoin to cover the cost and the new coinMin
    if (user.signupCoin < newCoinMin) {
      return res
        .status(400)
        .json({ error: "Insufficient signupCoin to upgrade restrint" });
    }

    // Deduct the new coinMin from the user's signupCoin
    user.signupCoin -= newCoinMin;

    // Update the restrint fields
    restrintItem.level += 1;
    restrintItem.cost = (costNumeric * 2) / 1000 + "k"; // Doubling the cost and converting back to 'k' format
    restrintItem.coinMin = newCoinMin;

    // Save the updated user and Restrint documents to the database
    await user.save();
    const savedRestrint = await restrint.save();

    // Send a success response
    res.status(200).json(savedRestrint);
  } catch (error) {
    console.error("Error updating restrint:", error);
    res.status(500).json({ error: "Failed to update restrint" });
  }
};

module.exports = {
  createRestrint,
  getAllRestrint,
  updateCoinsPerMinute,
  updateRestrint,
};