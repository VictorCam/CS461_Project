const express = require("express");
const router = express.Router();
const cors = require("cors");
//const connectsql = require("../server_connection"); // no server connection yet

router.get("/", (req, res) => {
  
  res.status(200).send("hello") //saying hello world
});

router.use(cors());

module.exports = router;