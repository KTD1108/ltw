import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

function TopBar({ advancedFeatures, setAdvancedFeatures, currentUser, onLogout, onOpenUpload }) {
  // useLocation: Hook của React Router để theo dõi sự thay đổi đường dẫn URL hiện tại
  const location = useLocation();
  
  // Tách URL thành các phần để lấy userId phục vụ việc tải tên người dùng
  const pathParts = location.pathname.split("/").filter(Boolean);
  const userId = pathParts.length >= 2 ? pathParts[1] : null;

  // contextText: Lưu trữ tiêu đề hiển thị ở giữa thanh điều hướng (ví dụ: "Photos of Kenobi")
  const [contextText, setContextText] = useState("Users");

  // useEffect để theo dõi sự thay đổi của đường dẫn URL và tự động tải tên của người dùng đang được xem
  useEffect(() => {
    let ignore = false; // Cờ chống tràn dữ liệu nếu người dùng bấm chuyển trang quá nhanh trước khi API trả về

    async function loadContext() {
      // 1. Chưa đăng nhập
      if (!currentUser) {
        setContextText("Please Login");
        return;
      }

      // 2. Đang ở danh sách người dùng
      if (location.pathname === "/users") {
        if (!ignore) {
          setContextText("Browse users");
        }
        return;
      }

      // 3. Không có userId trên URL
      if (!userId) {
        if (!ignore) {
          setContextText("Photo Sharing App");
        }
        return;
      }

      // 4. Có userId -> Gọi API lấy thông tin người dùng đó để hiển thị lên thanh TopBar
      try {
        const user = await fetchModel(`/user/${userId}`);
        const fullName = user ? `${user.first_name} ${user.last_name}` : "Unknown user";

        if (ignore) {
          return;
        }

        // Tùy thuộc vào đang ở trang xem ảnh hay trang chi tiết để đổi tiêu đề phù hợp
        if (location.pathname.startsWith("/photos/")) {
          setContextText(`Photos of ${fullName}`);
        } else {
          setContextText(fullName);
        }
      } catch (err) {
        if (!ignore) {
          setContextText("Photo Sharing App");
        }
      }
    }

    loadContext();

    // Dọn dẹp hiệu ứng phụ: Đánh dấu hủy yêu cầu nếu URL thay đổi trước khi API kịp hoàn thành
    return () => {
      ignore = true;
    };
  }, [location.pathname, userId, currentUser]);

  return (
    <header style={{ background: "#1f3c88", color: "white", padding: "10px", display: "flex", gap: "20px", alignItems: "center", position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000 }}>
      {/* Tên tác giả */}
      <h2>Tiến Đạt Kiều</h2>
      
      {/* Thông tin ngữ cảnh trang hiện tại */}
      <div style={{ flexGrow: 1, textContent: "center" }}>{contextText}</div>
      
      {/* Các chức năng tương tác (Bật Advanced mode, Đăng ảnh, Đăng xuất) */}
      <div>
        <label>
          <input
            type="checkbox"
            checked={advancedFeatures}
            onChange={(e) => setAdvancedFeatures(e.target.checked)} // Cập nhật tính năng Advanced
          />
          Advanced
        </label>{" "}
        {currentUser ? (
          <span>
            Hi {currentUser.first_name}{" "}
            <button onClick={onOpenUpload}>Add Photo</button>{" "}
            <button onClick={onLogout}>Logout</button>
          </span>
        ) : (
          <span>Please Login</span>
        )}
      </div>
    </header>
  );
}

export default TopBar;



