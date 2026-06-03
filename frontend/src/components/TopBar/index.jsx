import React, { useRef } from "react";
import fetchModel from "../../lib/fetchModelData";

function TopBar({ currentUser, onLogout, onUploadSuccess }) {
  const fileInputRef = useRef(null);

  // Xử lý chọn file ảnh và upload trực tiếp lên server
  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("uploadedphoto", file);
      formData.append("user_id", currentUser._id); // Gửi kèm id người đăng nhập làm chủ ảnh

      try {
        await fetchModel("/photos/new", {
          method: "POST",
          body: formData, // Trình duyệt tự nhận diện FormData và set Content-Type phù hợp
        });
        
        alert("Đăng ảnh mới thành công!");
        if (onUploadSuccess) {
          onUploadSuccess(); // Trigger để UserPhotos reload lại danh sách ảnh
        }
      } catch (err) {
        alert("Lỗi tải ảnh lên: " + err.message);
      }
    }
  };

  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      backgroundColor: "#1f3c88", color: "#fff", padding: "10px 20px"
    }}>
      <h2 style={{ margin: 0 }}>Kiều Tiến Đạt</h2>

      
      {currentUser && (
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <span>Xin chào, {currentUser.first_name} {currentUser.last_name}</span>
          
          {/* Nút Upload ảnh ẩn để giữ logic sạch */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <button onClick={() => fileInputRef.current.click()}>
            Tải ảnh lên
          </button>

          <button onClick={onLogout}>
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}

export default TopBar;
