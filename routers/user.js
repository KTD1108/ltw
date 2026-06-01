const express = require("express");
const User = require("../db/userModel");

const router = express.Router();

// GET /user/list
router.get("/list", async (req, res) => {
  try {
    const users = await User.find({}, "_id first_name last_name");
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: "Database error" });
  }
});

// GET /user/:id
router.get(":id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id, "_id first_name last_name location description occupation login_name");
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    return res.status(400).json({ message: "Invalid user ID" });
  }
});

// POST /user
router.post("/", async (req, res) => {
  const { login_name, password, first_name, last_name, location, description, occupation } = req.body;

  if (!login_name || !password || !first_name || !last_name) {
    return res.status(400).json({ message: "Missing required fields (login_name, password, first_name, last_name)" });
  }

  if (login_name.trim() === "" || password.trim() === "" || first_name.trim() === "" || last_name.trim() === "") {
    return res.status(400).json({ message: "Required fields cannot be empty strings" });
  }

  try {
    const existingUser = await User.findOne({ login_name });
    if (existingUser) {
      return res.status(400).json({ message: "Login name already exists" });
    }

    const newUser = new User({
      login_name,
      password,
      first_name,
      last_name,
      location: location || "",
      description: description || "",
      occupation: occupation || ""
    });

    await newUser.save();
    return res.json({
      _id: newUser._id,
      login_name: newUser.login_name
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error during registration" });
  }
});

module.exports = router;
