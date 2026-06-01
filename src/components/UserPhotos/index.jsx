import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

// Hàm định dạng ngày tháng sang chuỗi đọc được ở múi giờ địa phương
function formatDate(dateString) {
  return new Date(dateString).toLocaleString();
}

// Map hình ảnh cố định ban đầu từ thư mục images
const imageMap = {
  "ouster.jpg": require("../../images/ouster.jpg"),
  "malcolm1.jpg": require("../../images/malcolm1.jpg"),
  "malcolm2.jpg": require("../../images/malcolm2.jpg"),
  "ripley1.jpg": require("../../images/ripley1.jpg"),
  "ripley2.jpg": require("../../images/ripley2.jpg"),
  "kenobi1.jpg": require("../../images/kenobi1.jpg"),
  "kenobi2.jpg": require("../../images/kenobi2.jpg"),
  "kenobi3.jpg": require("../../images/kenobi3.jpg"),
  "kenobi4.jpg": require("../../images/kenobi4.jpg"),
  "took1.jpg": require("../../images/took1.jpg"),
  "took2.jpg": require("../../images/took2.jpg"),
  "ludgate1.jpg": require("../../images/ludgate1.jpg"),
};

// --- COMPONENT HIỂN THỊ TỪNG DÒNG BÌNH LUẬN ---
function CommentBlock({ comment }) {
  return (
    <div style={{ borderBottom: "1px solid #eee", padding: "5px 0" }}>
      <p>
        <Link to={`/users/${comment.user._id}`}>
          {comment.user.first_name} {comment.user.last_name}
        </Link>{" "}
        ({formatDate(comment.date_time)}):
      </p>
      <p>{comment.comment}</p>
    </div>
  );
}

// --- COMPONENT THẺ ẢNH (Bao gồm ảnh, danh sách bình luận và form thêm bình luận mới) ---
function PhotoCard({ photo, onCommentAdded }) {
  const [commentText, setCommentText] = useState(""); // State lưu nội dung ô bình luận đang gõ
  const [error, setError] = useState(""); // State hiển thị lỗi nếu gửi bình luận không thành công

  // Hàm chọn nguồn ảnh: Ưu tiên ảnh import tĩnh, ngược lại lấy từ thư mục public/images
  const getPhotoSrc = (fileName) => {
    if (imageMap[fileName]) {
      return imageMap[fileName];
    }
    return `/images/${fileName}`;
  };

  // Hàm xử lý gửi bình luận lên backend
  const handleAddComment = async (e) => {
    e.preventDefault(); // Ngăn trình duyệt tự tải lại trang
    if (!commentText.trim()) return;

    try {
      // Gọi API POST tới endpoint bình luận của ảnh tương ứng
      await fetchModel(`/commentsOfPhoto/${photo._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: commentText.trim() }),
      });
      setCommentText(""); // Xóa sạch ô nhập bình luận sau khi thành công
      setError("");
      if (onCommentAdded) {
        onCommentAdded(); // Kích hoạt callback tải lại dữ liệu danh sách ảnh từ UserPhotos
      }
    } catch (err) {
      setError(err.message || "Failed to add comment");
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}>
      <img
        src={getPhotoSrc(photo.file_name)}
        alt={photo.file_name}
        style={{ maxWidth: "100%", maxHeight: "400px" }}
      />
      <p>Uploaded: {formatDate(photo.date_time)}</p>
      
      <h4>Comments ({photo.comments ? photo.comments.length : 0})</h4>
      <div>
        {photo.comments && photo.comments.length > 0 ? (
          photo.comments.map((comment) => <CommentBlock key={comment._id} comment={comment} />)
        ) : (
          <p>No comments yet.</p>
        )}
      </div>

      {/* Form bình luận */}
      <form onSubmit={handleAddComment}>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <input
          type="text"
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button type="submit" disabled={!commentText.trim()}>Post</button>
      </form>
    </div>
  );
}

// --- COMPONENT CHÍNH HIỂN THỊ TOÀN BỘ ALBUM ẢNH CỦA USER ---
function UserPhotos({ advancedFeatures, uploadTrigger }) {
  const { userId } = useParams(); // Lấy userId xem ảnh từ đường dẫn URL
  const [user, setUser] = useState(null); // State thông tin chủ album
  const [photos, setPhotos] = useState([]); // Mảng chứa các ảnh của user này
  const [searchParams] = useSearchParams(); // Đọc Query Params "?photoId=..."
  const navigate = useNavigate();
  const [reloadTrigger, setReloadTrigger] = useState(0); // Trigger để reload lại sau khi thêm bình luận

  // Tải thông tin người dùng và album ảnh tương ứng
  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const [userData, photoData] = await Promise.all([
          fetchModel(`/user/${userId}`),
          fetchModel(`/photosOfUser/${userId}`),
        ]);

        if (!ignore) {
          setUser(userData);
          setPhotos(photoData || []);
        }
      } catch (err) {
        console.error("Failed to load user photos:", err);
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [userId, reloadTrigger, uploadTrigger]);

  const currentPhotoId = searchParams.get("photoId");

  // useMemo: Tính toán vị trí ảnh đang được hiển thị trong chế độ Advanced (mặc định ảnh đầu tiên)
  const activePhotoIndex = useMemo(() => {
    if (!photos.length) {
      return -1;
    }
    if (!currentPhotoId) {
      return 0;
    }
    const foundIndex = photos.findIndex((photo) => photo._id === currentPhotoId);
    return foundIndex >= 0 ? foundIndex : 0;
  }, [photos, currentPhotoId]);

  const activePhoto = activePhotoIndex >= 0 ? photos[activePhotoIndex] : null;

  // Điều hướng sang ảnh khác bằng cách set Query Param mới lên URL
  const goToPhoto = (newIndex) => {
    if (newIndex < 0 || newIndex >= photos.length) {
      return;
    }
    navigate(`/photos/${userId}?photoId=${photos[newIndex]._id}`);
  };

  const handleCommentAdded = () => {
    setReloadTrigger(prev => prev + 1); // Tăng trigger để chạy lại useEffect tải lại ảnh
  };

  if (!user) {
    return <div>Loading photos...</div>;
  }

  return (
    <div>
      <h2>{user.first_name} {user.last_name}</h2>
      <p>{photos.length} photos available.</p>

      {/* Nếu bật advancedFeatures: Chỉ hiển thị 1 ảnh cùng bộ điều hướng Stepper */}
      {advancedFeatures ? (
        <div>
          {activePhoto ? (
            <PhotoCard photo={activePhoto} onCommentAdded={handleCommentAdded} />
          ) : (
            <p>No photos found.</p>
          )}
          {photos.length > 0 && (
            <div style={{ marginTop: "10px" }}>
              <button
                onClick={() => goToPhoto(activePhotoIndex - 1)}
                disabled={activePhotoIndex <= 0}
              >
                Previous
              </button>
              <span> Photo {activePhotoIndex + 1} of {photos.length} </span>
              <button
                onClick={() => goToPhoto(activePhotoIndex + 1)}
                disabled={activePhotoIndex >= photos.length - 1}
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Chế độ mặc định: Hiển thị danh sách tất cả các ảnh của User dưới dạng danh sách thẳng */
        <div>
          {photos.map((photo) => (
            <PhotoCard key={photo._id} photo={photo} onCommentAdded={handleCommentAdded} />
          ))}
        </div>
      )}
    </div>
  );
}

export default UserPhotos;



