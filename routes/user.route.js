const express = require("express");
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUserById,
  updateCoin,
  increaseCoinsPerMinute,
  updateCoinsEarnToday,
} = require("../controller/user.controller");

router.post("/user/register", createUser);
router.get("/get/all/user", getAllUsers);
router.get("/get/user/:id", getUserById);
router.put("/update/user/:id", updateUserById);
router.put("/update/coin/:id", updateCoin);
router.put("/update/coins/minute/:userId", increaseCoinsPerMinute);
router.put("/update/coins/earntoday/:userId", updateCoinsEarnToday);

module.exports = router;
