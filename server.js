/**
 * ==========================================
 * PHOTO SHARING APPLICATION - BACKEND SERVER
 * ==========================================
 * Một ứng dụng chia sẻ ảnh cho phép người dùng:
 * - Đăng ký/Đăng nhập
 * - Upload và chia sẻ ảnh
 * - Bình luận trên ảnh của người khác
 * - Xem thông tin người dùng khác
 */

// ========== IMPORTS/DEPENDENCIES ==========
const express = require("express"); // Framework web để tạo REST API backend
const cors = require("cors"); // Cho phép frontend gọi backend (Cross-Origin Resource Sharing)
const path = require("path"); // Xử lý đường dẫn file một cách an toàn
const fs = require("fs"); // Kiểm tra và tạo thư mục trên hệ thống
const multer = require("multer"); // Middleware để nhận file ảnh upload từ client
const dbConnect = require("./db/dbConnect"); // Hàm kết nối MongoDB database
const User = require("./db/userModel"); // Mongoose model cho bảng Users
const Photo = require("./db/photoModel"); // Mongoose model cho bảng Photos
const SchemaInfo = require("./db/schemaInfo"); // Mongoose model cho thông tin schema
const adminRouter = require("./routers/admin");
const userRouter = require("./routers/user");
const photoRouter = require("./routers/photo");
const testRouter = require("./routers/test");

// ========== SERVER CONFIGURATION ==========
const app = express(); // Tạo Express server application
const PORT = process.env.PORT || 3001; // Lấy PORT từ environment, mặc định là 3001 nếu không có

// Khởi tạo kết nối tới MongoDB database
dbConnect();

// ========== PHOTO UPLOAD DIRECTORY SETUP ==========
// Tạo thư mục 'images' để lưu ảnh upload nếu chưa tồn tại
const uploadDir = path.join(__dirname, "images"); // Lấy đường dẫn tuyệt đối của thư mục images
if (!fs.existsSync(uploadDir)) { // Kiểm tra xem thư mục có tồn tại không
  fs.mkdirSync(uploadDir); // Nếu không tồn tại thì tự động tạo mới
}

// ========== MULTER CONFIGURATION FOR FILE UPLOADS ==========
// Cấu hình cách Multer lưu trữ file upload
const storage = multer.diskStorage({
  // Hàm xác định nơi lưu file (thư mục đích)
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Lưu vào thư mục 'images'
  },
  // Hàm xác định tên file được lưu (thêm timestamp để tránh trùng tên)
  filename: function (req, file, cb) {
    // Tạo tên file unique bằng timestamp + số ngẫu nhiên
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Giữ nguyên extension (.jpg, .png, etc.) của file gốc
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
// Tạo middleware upload với cấu hình storage ở trên
const upload = multer({ storage: storage });

// ========== EXPRESS MIDDLEWARE SETUP ==========
app.use(cors()); // Cho phép tất cả cross-origin requests từ frontend
app.use(express.json()); // Parse incoming JSON request bodies

// Phục vụ thư mục images như static files (ảnh có thể download qua URL)
app.use("/images", express.static(uploadDir)); // Ảnh sẽ được access qua URL: http://server/images/filename.jpg

// ========== AUTHENTICATION MIDDLEWARE ==========
/**
 * Middleware kiểm tra xác thực người dùng
 * - Một số route không cần token (login, register, public info)
 * - Các route khác cần token trong Authorization header
 * - Token là User ID được gửi dưới dạng "Bearer <user_id>"
 */
const authMiddleware = async (req, res, next) => {
  // Danh sách route không yêu cầu xác thực (công khai)
  const skipPaths = ["/admin/login", "/user", "/test/info"];
  
  // Bỏ qua kiểm tra xác thực cho route công khai và ảnh tĩnh
  if (skipPaths.includes(req.path) || req.path.startsWith("/images/")) {
    return next(); // Tiếp tục xử lý request mà không cần kiểm tra token
  }

  // Kiểm tra header Authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Trích xuất token từ header (bỏ đi "Bearer " prefix)
  const token = authHeader.split(" ")[1]; // token là User ID
  try {
    // Tìm user có _id trùng với token
    const user = await User.findById(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // Lưu thông tin user vào req.user để các route tiếp theo dùng
    req.user = user;
    next(); // Tiếp tục xử lý request
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// Áp dụng middleware xác thực cho tất cả request (skip paths được xử lý trong middleware)
app.use(authMiddleware);

// Routers
app.use("/admin", adminRouter);
app.use("/user", userRouter);
app.use("/", photoRouter(upload));
app.use("/test", testRouter);

// ========== START SERVER ==========
/**
 * Khởi động server Express trên port được xác định
 * Server sẽ lắng nghe các request từ frontend
 */
app.listen(PORT, () => {
  console.log(`Backend server running at http://127.0.0.1:${PORT}`);
});
