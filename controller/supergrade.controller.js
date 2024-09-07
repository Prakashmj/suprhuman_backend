const Supergrade = require("../models/supergrade.model");
const User = require("../models/user.model");
const mongoose = require("mongoose");

const createSupergrade = async (req, res) => {
  try {
    const { userId, name, level, cost, coinMin, icon, quote } = req.body;

    // Find the existing upgrade document or create a new one
    let upgrade = await Supergrade.findOne();
    if (!upgrade) {
      // If no upgrade document exists, create a new one
      upgrade = new Supergrade({
        SUPRUPGRADE: [],
      });
    }

    // Create a new supergrade object
    const newSupergrade = {
      userId,
      name,
      level,
      cost,
      coinMin,
      icon,
      quote,
    };

    // Add the new supergrade to the SUPRUPGRADE array
    upgrade.SUPRUPGRADE.push(newSupergrade);

    // Save the updated upgrade document to the database
    const savedUpgrade = await upgrade.save();

    // Send a success response
    res.status(201).json(savedUpgrade);
  } catch (error) {
    console.error("Error creating supergrade:", error);
    res.status(500).json({ error: "Failed to create supergrade" });
  }
};

// Get all Supergrades
const getAllSupergrades = async (req, res) => {
  try {
    // Fetch all documents from the Supergrade collection
    const upgrades = await Supergrade.find();

    // Send a success response with the fetched upgrades
    res.status(200).json(upgrades);
  } catch (error) {
    console.error("Error fetching supergrades:", error);
    res.status(500).json({ error: "Failed to fetch supergrades" });
  }
};

const updateSuperGrade = async (req, res) => {
  try {
    const { _id, supergradeId } = req.params;

    // Validate the parameters
    if (
      !mongoose.Types.ObjectId.isValid(_id) ||
      !mongoose.Types.ObjectId.isValid(supergradeId)
    ) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Find the Supergrade document by its _id
    const supergrade = await Supergrade.findById(_id);

    if (!supergrade) {
      return res.status(404).json({ error: "Supergrade not found" });
    }

    // Find the specific supergrade item by its _id within the SUPRUPGRADE array
    const supergradeItem = supergrade.SUPRUPGRADE.find(
      (item) => item._id.toString() === supergradeId
    );

    if (!supergradeItem) {
      return res.status(404).json({ error: "Supergrade item not found" });
    }

    // Extract userId from the last item in the SUPRUPGRADE array
    const userId = supergrade.SUPRUPGRADE.find((item) => item.userId)?.userId;

    // Check if userId exists
    if (!userId) {
      return res.status(404).json({ error: "User ID not found in supergrade" });
    }

    // Find the user associated with this supergrade
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate the cost
    const costNumeric =
      parseFloat(supergradeItem.cost.replace(/k/i, "")) * 1000; // Convert cost to a numeric value (e.g., 3k -> 3000)

    // Check if the user has enough signupCoin to cover the cost
    if (user.signupCoin > costNumeric) {
      return res
        .status(400)
        .json({ error: "Insufficient signupCoin to upgrade supergrade" });
    }

    // Deduct the cost from the user's signupCoin
    user.signupCoin -= costNumeric;

    // Update the supergrade fields
    supergradeItem.level += 1;
    supergradeItem.cost = (costNumeric * 2) / 1000 + "k"; // Doubling the cost and converting back to 'k' format
    supergradeItem.coinMin += supergradeItem.coinMin * 0.2;

    // Save the updated user and Supergrade documents to the database
    await user.save();
    const savedSupergrade = await supergrade.save();

    // Send a success response
    res.status(200).json(savedSupergrade);
  } catch (error) {
    console.error("Error updating supergrade:", error);
    res.status(500).json({ error: "Failed to update supergrade" });
  }
};

module.exports = {
  createSupergrade,
  getAllSupergrades,
  updateSuperGrade,
};
