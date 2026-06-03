const express = require("express");
const Photo = require("../db/photoModel");
const fs = require("fs");
const path = require("path");

module.exports = (upload) => {
  const router = express.Router();

  // GET /photosOfUser/:id - Lấy danh sách ảnh của user kèm populate user bình luận
  router.get("/photosOfUser/:id", async (request, response) => {
    try {
      const photos = await Photo.find({ user_id: request.params.id })
        .populate({
          path: "comments.user_id",
          model: "Users",
          select: "_id first_name last_name"
        });

      // Format lại cấu trúc trả về giống với schema cũ (gán user_id vào thuộc tính user)
      const formattedPhotos = photos.map(photo => {
        const p = photo.toObject();
        p.comments = p.comments.map(c => ({
          _id: c._id,
          comment: c.comment,
          date_time: c.date_time,
          user: c.user_id
        }));
        return p;
      });

      return response.status(200).json(formattedPhotos);
    } catch (error) {
      console.error("Lỗi lấy ảnh:", error);
      return response.status(400).json({ error: "Lỗi lấy album ảnh!" });
    }
  });

  // POST /commentsOfPhoto/:photo_id - Thêm bình luận mới cho ảnh
  router.post("/commentsOfPhoto/:photo_id", async (request, response) => {
    const { comment, user_id } = request.body;
    if (!comment || !comment.trim()) {
      return response.status(400).json({ error: "Nội dung bình luận không được trống!" });
    }

    try {
      const photo = await Photo.findById(request.params.photo_id);
      if (!photo) {
        return response.status(404).json({ error: "Không tìm thấy ảnh!" });
      }

      // Đẩy comment mới vào DB
      photo.comments.push({
        comment: comment.trim(),
        user_id: user_id, // Lấy ID của người dùng đăng nhập gửi lên
        date_time: new Date(),
      });

      await photo.save();

      // Trả về ảnh mới kèm dữ liệu user của các comments đã được populate
      const updatedPhoto = await Photo.findById(request.params.photo_id)
        .populate({
          path: "comments.user_id",
          model: "Users",
          select: "_id first_name last_name"
        });

      const formattedPhoto = updatedPhoto.toObject();
      formattedPhoto.comments = formattedPhoto.comments.map(c => ({
        _id: c._id,
        comment: c.comment,
        date_time: c.date_time,
        user: c.user_id
      }));

      return response.status(200).json(formattedPhoto);
    } catch (error) {
      console.error("Lỗi thêm bình luận:", error);
      return response.status(400).json({ error: "Lỗi lưu bình luận!" });
    }
  });

  // POST /photos/new - Upload ảnh mới
  router.post("/photos/new", upload.single("uploadedphoto"), async (request, response) => {
    if (!request.file) {
      return response.status(400).json({ error: "Không có tệp tin ảnh nào được chọn!" });
    }

    try {
      const { user_id } = request.body; // Gửi kèm user_id của người đăng nhập
      const newPhoto = new Photo({
        file_name: request.file.filename,
        user_id: user_id,
        date_time: new Date(),
        comments: []
      });

      await newPhoto.save();
      return response.status(200).json(newPhoto);
    } catch (error) {
      console.error("Lỗi đăng ảnh:", error);
      return response.status(500).json({ error: "Lỗi hệ thống khi lưu ảnh!" });
    }
  });

  // DELETE /photos/:photo_id - Xóa ảnh
  router.delete("/photos/:photo_id", async (request, response) => {
    const { user_id } = request.body;
    if (!user_id) {
      return response.status(400).json({ error: "Thiếu user_id người yêu cầu!" });
    }

    try {
      const photo = await Photo.findById(request.params.photo_id);
      if (!photo) {
        return response.status(404).json({ error: "Không tìm thấy ảnh!" });
      }

      // Chỉ chủ ảnh mới có quyền xóa
      if (photo.user_id.toString() !== user_id) {
        return response.status(403).json({ error: "Bạn không có quyền xóa ảnh này!" });
      }

      // Xóa file vật lý nếu tồn tại
      const filePath = path.join(__dirname, "../images", photo.file_name);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) console.error("Lỗi xóa tệp ảnh vật lý:", err);
        });
      }

      await Photo.findByIdAndDelete(request.params.photo_id);
      return response.status(200).json({ message: "Xóa ảnh thành công!" });
    } catch (error) {
      console.error("Lỗi xóa ảnh:", error);
      return response.status(500).json({ error: "Lỗi hệ thống khi xóa ảnh!" });
    }
  });

  // DELETE /comments/:photo_id/:comment_id - Xóa bình luận
  router.delete("/comments/:photo_id/:comment_id", async (request, response) => {
    const { user_id } = request.body;
    if (!user_id) {
      return response.status(400).json({ error: "Thiếu user_id người yêu cầu!" });
    }

    try {
      const photo = await Photo.findById(request.params.photo_id);
      if (!photo) {
        return response.status(404).json({ error: "Không tìm thấy ảnh!" });
      }

      // Tìm comment cần xóa
      const comment = photo.comments.id(request.params.comment_id);
      if (!comment) {
        return response.status(404).json({ error: "Không tìm thấy bình luận!" });
      }

      // Người có quyền xóa: Người viết bình luận HOẶC Chủ sở hữu bức ảnh
      const isCommentAuthor = comment.user_id.toString() === user_id;
      const isPhotoOwner = photo.user_id.toString() === user_id;

      if (!isCommentAuthor && !isPhotoOwner) {
        return response.status(403).json({ error: "Bạn không có quyền xóa bình luận này!" });
      }

      // Tiến hành xóa bình luận khỏi mảng comments
      photo.comments.pull({ _id: request.params.comment_id });
      await photo.save();

      return response.status(200).json({ message: "Xóa bình luận thành công!" });
    } catch (error) {
      console.error("Lỗi xóa bình luận:", error);
      return response.status(500).json({ error: "Lỗi hệ thống khi xóa bình luận!" });
    }
  });

  return router;
};
