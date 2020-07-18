const express = require("express");
const router = express.Router();
const userHandlers = require("../handlers/userHandlers");

router.post("/signup", userHandlers.signup);
router.post("/activate/:token", userHandlers.activateUser);
router.post("/login", userHandlers.logUsersIn);
router.get("/logout", userHandlers.logUsersOut);

module.exports = router;
