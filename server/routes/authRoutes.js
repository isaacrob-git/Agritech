const express = require("express");
const { register, login } = require("../controllers/authController");
const User = require("../models/User");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/agricultores", async (req, res) => {
  try {
    const agricultores = await User.find({ rol: "agricultor" }, "nombre email codigo");
    res.json(agricultores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;