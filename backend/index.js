const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const AdminRouter = require("./routes/AdminRouter");
const PhotoRouter = require("./routes/PhotoRouter");

dbConnect();

// Cấu hình Multer để lưu file ảnh upload
const uploadDir = path.join(__dirname, "images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());

// Định nghĩa đúng tiền tố đường dẫn API
app.use("/admin", AdminRouter);
app.use("/user", UserRouter);
app.use("/", PhotoRouter(upload));
app.use("/images", express.static(uploadDir));

app.get("/", (request, response) => {
  response.send({ message: "Hello from photo-sharing app API!" });
});

app.listen(8081, () => {
  console.log("server listening on port 8081");
});
