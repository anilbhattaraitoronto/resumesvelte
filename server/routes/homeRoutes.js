const router = require("express").Router();
const { getHomePage } = require("../handlers/homeHandlers");

router.get("/", getHomePage);

module.exports = router;
