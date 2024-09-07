const express = require("express");
const router = express.Router();
const {
  createSupergrade,
  getAllSupergrades,
  updateSuperGrade
} = require("../controller/supergrade.controller");

router.post("/create/supergrade", createSupergrade);
router.get("/get/all/supergrade", getAllSupergrades);
router.put("/update/supergrad/:_id/:supergradeId", updateSuperGrade);

module.exports = router;