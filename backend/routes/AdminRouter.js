const express = require("express");
const User = require("../db/userModel");
const router = express.Router();

// POST /admin/login - Đăng nhập
router.post("/login", async (req, res) => {
  const { login_name, password } = req.body;
  if (!login_name || !password) {
    return res.status(400).json({ error: "Không được để trống tài khoản và mật khẩu!" });
  }

  try {
    const user = await User.findOne({ login_name });
    if (!user || user.password !== password) {
      return res.status(400).json({ error: "Tài khoản hoặc mật khẩu không chính xác!" });
    }

    return res.json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      login_name: user.login_name
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return res.status(500).json({ error: "Lỗi hệ thống khi đăng nhập!" });
  }
});

// POST /admin/logout - Đăng xuất
router.post("/logout", async (req, res) => {
  return res.json({ message: "Đăng xuất thành công" });
});

module.exports = router;
