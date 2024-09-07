const express = require("express");
const router = express.Router();
const {
  createUpgrade,
  getAllUpgrades,
  updateUpgrade,
} = require("../controller/upgrade.controller");

router.post("/create/upgrade", createUpgrade);
router.get("/get/all/upgrade", getAllUpgrades);
router.put("/update/upgrade/:_id/:enhancementId", updateUpgrade);

module.exports = router;