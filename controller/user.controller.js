const User = require("../models/user.model");
const Counter = require("../models/uniqueid.model");
const Supergrade = require("../models/supergrade.model");
const Upgrade = require("../models/upgrade.model");
const Restrint = require("../models/restrint.model");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

//////////////////////////////////////////////////////// generate unique id ///////////////////////////////////////////////////////////////////
const generateUniqueId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: "SUPR" },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );
  const sequenceNumber = counter.sequence_value;
  const id = `SUPR-A${String(sequenceNumber).padStart(2, "2", "0")}`;

  return id;
};

//////////////////////////////////////////////////////// CREATE USER ////////////////////////////////////////////////////////////////////////////////

const createUser = async (req, res) => {
  try {
    const { name, gender, country, email } = req.body;
    const signupCoin = 100000;

    // Generate a unique ID for the user
    const uniqueId = await generateUniqueId();

    // Create a new user instance
    const newUser = new User({
      name,
      gender,
      country,
      email,
      uniqueId,
      signupCoin,
      energy: {
        current: 1000, // Set current energy
        max: 1000, // Set max energy
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser._id,
        uniqueId: newUser.uniqueId,
        email: newUser.email,
      },
      JWT_SECRET,
      { expiresIn: "1h" } // Token expiration time
    );

    // Set the generated token to the userToken field
    newUser.userToken = token;

    // Save the user with the token
    const savedUser = await newUser.save();

    res.status(201).json({
      message: "User created successfully and userId added to Supergrade",
      user: savedUser,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/////////////////////////////////////////////////// get all user /////////////////////////////////////////////////////////////////////////////
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
/////////////////////////////////////////////////// get user by id /////////////////////////////////////////////////////////////////////////////
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      message: "User fetched successfully",
      user: user,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
//////////////////////////////////////////////////// UPDATE CHARACTER IMAGES WITH USER ////////////////////////////////////////////////////////////
const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { characterImage, characterId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { characterImage, characterId } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
////////////////////////////////////////////// UPDATE COIN /////////////////////////////////////////////////////////////////////////////////////
const updateCoin = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let coinsToAdd;
    if (user.level >= 1 && user.level <= 10) {
      coinsToAdd = user.level;
    } else {
      return res
        .status(400)
        .json({ message: "Level not supported for coin addition" });
    }

    // Increase coins
    user.signupCoin = (user.signupCoin || 0) + coinsToAdd;

    // Decrease energy
    const energyToDecrease = 1; // Define how much energy to decrease per coin increase
    user.energy = user.energy || { current: 1000, max: 1000 }; // Ensure energy field is initialized

    // Decrease current energy by the specified amount
    user.energy.current = Math.max(user.energy.current - energyToDecrease, 0); // Prevent negative values

    // Save the updated user data
    await user.save();

    res.status(200).json({
      message: "Signup coin and energy updated successfully",
      updatedUser: user,
    });
  } catch (error) {
    console.error("Error updating signupCoin and energy:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const increaseCoinsPerMinute = async (req, res) => {
  try {
    const { userId } = req.params;
    const incrementValue = 8; // Increment value for coinsPerMinute

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.energy.coinsPerMinute += incrementValue;
    await user.save();

    res.status(200).json({
      message: "Coins per minute updated successfully",
      updatedUser: user,
    });
  } catch (error) {
    console.error("Error updating coinsPerMinute:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
const updateCoinsEarnToday = async (req, res) => {
  try {
    const { userId } = req.params; // Extract userId from request parameters

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Find the user by _id
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Ensure coinsPerMinute exists and is a number
    const coinsPerMinute = user.coinsPerMinute;

    if (typeof coinsPerMinute !== "number") {
      return res.status(400).json({ error: "Invalid coinsPerMinute value" });
    }

    // Update coinsEarnToday by adding coinsPerMinute
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { coinsEarnToday: coinsPerMinute }, // Increment the coinsEarnToday field
      },
      { new: true } // Return the updated document
    );

    res.status(200).json({
      message: "coinsEarnToday updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating coinsEarnToday:", error);
    res.status(500).json({ error: "Failed to update coinsEarnToday" });
  }
};
module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUserById,
  updateCoin,
  increaseCoinsPerMinute,
  updateCoinsEarnToday,
};
