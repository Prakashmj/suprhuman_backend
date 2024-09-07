const express = require("express");
const router = express.Router();
const {
    createRestrint,
    getAllRestrint,
    updateCoinsPerMinute,
    updateRestrint
} = require("../controller/restrint.controller");

router.post("/create/restrint", createRestrint);
router.get("/get/all/restrint",getAllRestrint);
router.put("/user/update/coin",updateCoinsPerMinute);
router.put("/update/restrint/:_id/:restrintId",updateRestrint);

module.exports = router;
