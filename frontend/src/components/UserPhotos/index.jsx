import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";

function UserPhotos({ uploadTrigger }) {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [commentTextMap, setCommentTextMap] = useState({});

  // Lấy ID người dùng đang đăng nhập để truyền khi đăng bình luận
  const currentUserId = JSON.parse(localStorage.getItem("currentUser"))?._id;

  // Lắng nghe cả reloadTrigger (bình luận mới) và uploadTrigger (đăng ảnh mới thành công)
  useEffect(() => {
    async function loadData() {
      try {
        const [userData, photoData] = await Promise.all([
          fetchModel(`/user/${userId}`),
          fetchModel(`/photosOfUser/${userId}`),
        ]);
        setUser(userData);
        setPhotos(photoData || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, [userId, reloadTrigger, uploadTrigger]);

  const handleAddComment = async (e, photoId) => {
    e.preventDefault();
    const text = commentTextMap[photoId];
    if (!text || !text.trim()) return;

    try {
      await fetchModel(`/commentsOfPhoto/${photoId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          comment: text.trim(),
          user_id: currentUserId // Truyền user_id của người đăng bình luận
        }),
      });
      setCommentTextMap((prev) => ({ ...prev, [photoId]: "" }));
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  if (!user) return <div>Đang tải...</div>;

  const BASE_URL = process.env.REACT_APP_API_URL || "";

  return (
    <div>
      <h2>Album ảnh của {user.first_name} {user.last_name}</h2>
      
      <div>
        {photos.map((photo) => (
          <div key={photo._id} style={{ marginBottom: "35px" }}>
            <img src={`${BASE_URL}/images/${photo.file_name}`} alt="photo" style={{ maxWidth: "100%", maxHeight: "300px" }} />
            <p>Ngày đăng: {new Date(photo.date_time).toLocaleString()}</p>

            <div>
              <h5>Bình luận:</h5>
              {photo.comments && photo.comments.map((comment) => (
                <div key={comment._id} style={{ margin: "5px 0" }}>
                  <p style={{ margin: 0 }}>
                    {/* comment.user chứa thông tin user đã populate từ backend */}
                    <Link to={`/users/${comment.user?._id}`}>
                      {comment.user ? `${comment.user.first_name} ${comment.user.last_name}` : "Ẩn danh"}
                    </Link>
                    : {comment.comment} ({new Date(comment.date_time).toLocaleString()})
                  </p>
                </div>
              ))}

              <form onSubmit={(e) => handleAddComment(e, photo._id)}>
                <input
                  type="text"
                  placeholder="Bình luận..."
                  value={commentTextMap[photo._id] || ""}
                  onChange={(e) => setCommentTextMap((prev) => ({ ...prev, [photo._id]: e.target.value }))}
                />
                <button type="submit">Gửi</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserPhotos;
