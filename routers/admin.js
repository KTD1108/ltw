const express = require("express");
const User = require("../db/userModel");

const router = express.Router();

// POST /admin/login
router.post("/login", async (req, res) => {
  const { login_name, password } = req.body;
  if (!login_name || !password) {
    return res.status(400).json({ message: "Login name and password are required" });
  }

  try {
    const user = await User.findOne({ login_name });
    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid login name or password" });
    }

    return res.json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      login_name: user.login_name
    });
  } catch (error) {
    console.error("LOGIN ERROR DETAILS:", error);
    return res.status(500).json({ message: `Database error during login: ${error.message}` });
  }
});

// POST /admin/logout
router.post("/logout", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(400).json({ message: "Not logged in" });
  }
  return res.json({ message: "Logged out successfully" });
});

module.exports = router;
