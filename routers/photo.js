const express = require("express");
const Photo = require("../db/photoModel");

module.exports = (upload) => {
  const router = express.Router();

  // GET /photosOfUser/:id
  router.get("/photosOfUser/:id", async (req, res) => {
    try {
      const photos = await Photo.find({ user_id: req.params.id }, "_id user_id comments file_name date_time")
        .populate({
          path: "comments.user_id",
          model: "Users",
          select: "_id first_name last_name"
        });

      if (!photos || photos.length === 0) {
        return res.json([]);
      }

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

      return res.json(formattedPhotos);
    } catch (error) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
  });

  // POST /commentsOfPhoto/:photo_id
  router.post("/commentsOfPhoto/:photo_id", async (req, res) => {
    const { comment } = req.body;
    if (!comment || comment.trim() === "") {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    try {
      const photo = await Photo.findById(req.params.photo_id);
      if (!photo) {
        return res.status(400).json({ message: "Photo not found" });
      }

      const newComment = {
        comment: comment,
        user_id: req.user._id,
        date_time: new Date()
      };

      photo.comments.push(newComment);
      await photo.save();

      const updatedPhoto = await Photo.findById(req.params.photo_id)
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

      return res.json(formattedPhoto);
    } catch (error) {
      return res.status(400).json({ message: "Invalid photo ID or database error" });
    }
  });

  // POST /photos/new
  router.post("/photos/new", upload.single("uploadedphoto"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      const newPhoto = new Photo({
        file_name: req.file.filename,
        user_id: req.user._id,
        date_time: new Date(),
        comments: []
      });

      await newPhoto.save();
      return res.json(newPhoto);
    } catch (error) {
      return res.status(500).json({ message: "Failed to save photo metadata" });
    }
  });

  return router;
};
