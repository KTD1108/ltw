const express = require("express");
const User = require("../db/userModel");
const router = express.Router();

// POST /user - Đăng ký tài khoản
router.post("/", async (request, response) => {
  try {
    const { login_name, password, first_name, last_name, location, description, occupation } = request.body;

    if (!login_name || !password || !first_name || !last_name) {
      return response.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin bắt buộc!" });
    }

    const existingUser = await User.findOne({ login_name });
    if (existingUser) {
      return response.status(400).json({ error: "Tên đăng nhập đã tồn tại!" });
    }

    const newUser = new User({
      login_name,
      password,
      first_name,
      last_name,
      location: location || "",
      description: description || "",
      occupation: occupation || "",
    });

    await newUser.save();

    return response.status(200).json({
      _id: newUser._id,
      login_name: newUser.login_name,
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return response.status(500).json({ error: "Lỗi hệ thống khi đăng ký!" });
  }
});

// GET /user/list - Lấy danh sách thành viên
router.get("/list", async (request, response) => {
  try {
    const users = await User.find({}, "_id first_name last_name");
    return response.status(200).json(users);
  } catch (error) {
    console.error("Lỗi lấy danh sách user:", error);
    return response.status(500).json({ error: "Lỗi hệ thống khi tải danh sách!" });
  }
});

// GET /user/:id - Lấy chi tiết thông tin 1 thành viên
router.get("/:id", async (request, response) => {
  try {
    const user = await User.findById(
      request.params.id,
      "_id first_name last_name location description occupation login_name"
    );
    if (!user) {
      return response.status(404).json({ error: "Không tìm thấy thông tin thành viên!" });
    }
    return response.status(200).json(user);
  } catch (error) {
    console.error("Lỗi lấy chi tiết user:", error);
    return response.status(400).json({ error: "ID thành viên không hợp lệ!" });
  }
});

module.exports = router;