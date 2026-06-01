import "./App.css";

import React, { useMemo, useState, useEffect } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";

import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import LoginRegister from "./components/LoginRegister";
import fetchModel from "./lib/fetchModelData";

function App() {
  // --- KHAI BÁO STATE TOÀN CỤC ---
  // advancedFeatures: Trạng thái bật/tắt tính năng nâng cao (Stepper xem ảnh từng tấm)
  const [advancedFeatures, setAdvancedFeatures] = useState(false);
  
  // currentUser: Thông tin người dùng đang đăng nhập (đọc từ localStorage nếu có sẵn)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });

  // States quản lý việc Upload Ảnh mới
  const [isUploadOpen, setIsUploadOpen] = useState(false); // Trạng thái ẩn/hiện Modal Upload
  const [selectedFile, setSelectedFile] = useState(null); // File ảnh được chọn
  const [filePreview, setFilePreview] = useState(null); // Đường dẫn preview ảnh
  const [uploadTrigger, setUploadTrigger] = useState(0); // Trigger để reload lại danh sách ảnh sau khi upload thành công
  
  // States quản lý thông báo Toast nổi
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Lắng nghe sự kiện "unauthorized" (Tự động Logout khi Token hết hạn hoặc không hợp lệ)
  useEffect(() => {
    const handleUnauthorized = () => {
      setCurrentUser(null);
      setSnackbar({
        open: true,
        message: "Phiên làm việc hết hạn hoặc chưa được xác thực. Vui lòng đăng nhập lại!",
        severity: "warning"
      });
    };

    window.addEventListener("unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("unauthorized", handleUnauthorized);
    };
  }, []);

  // Tự động đóng thông báo Toast sau 4 giây
  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => {
        setSnackbar((prev) => ({ ...prev, open: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

  // Xử lý khi đăng nhập thành công
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setSnackbar({
      open: true,
      message: `Đăng nhập thành công! Chào ${user.first_name}.`,
      severity: "success"
    });
  };

  // Xử lý khi đăng xuất
  const handleLogout = async () => {
    try {
      await fetchModel("/admin/logout", { method: "POST" });
    } catch (err) {
      // Bỏ qua lỗi và xóa trạng thái ở phía client
    }
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setSnackbar({
      open: true,
      message: "Đăng xuất thành công!",
      severity: "info"
    });
  };

  // Lắng nghe sự kiện chọn File từ thiết bị
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file)); // Tạo URL xem trước ảnh
    }
  };

  // Xử lý upload ảnh lên server
  const handleUploadPhoto = async () => {
    if (!selectedFile) {
      setSnackbar({ open: true, message: "Vui lòng chọn tệp ảnh!", severity: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("uploadedphoto", selectedFile);

    try {
      await fetchModel("/photos/new", {
        method: "POST",
        body: formData,
      });

      setSnackbar({ open: true, message: "Đăng ảnh mới thành công!", severity: "success" });
      setIsUploadOpen(false);
      setSelectedFile(null);
      setFilePreview(null);
      // Tăng trigger để tự động tải lại danh sách ảnh ở trang cá nhân
      setUploadTrigger(prev => prev + 1);
    } catch (err) {
      setSnackbar({ open: true, message: err.message || "Tải ảnh thất bại!", severity: "error" });
    }
  };

  // Gom các Props truyền xuống cho thanh TopBar bằng useMemo để tối ưu hiệu năng
  const topBarProps = useMemo(
    () => ({
      advancedFeatures,
      setAdvancedFeatures,
      currentUser,
      onLogout: handleLogout,
      onOpenUpload: () => setIsUploadOpen(true),
    }),
    [advancedFeatures, currentUser]
  );

  return (
    <Router>
      <div className="app-shell">
        <TopBar {...topBarProps} />
        <div className="main-topbar-buffer" />
        
        {/* Bố cục Grid phân tách Sidebar & Content chính */}
        <div className={`main-layout ${currentUser ? "has-sidebar" : ""}`}>
          {currentUser && (
            <div>
              <div className="main-grid-item sidebar-paper">
                <UserList />
              </div>
            </div>
          )}
          <div>
            <div className="main-grid-item content-paper">
              {/* Định nghĩa các Route - Điều hướng trang */}
              <Routes>
                {currentUser ? (
                  <>
                    <Route path="/" element={<Navigate to={`/users/${currentUser._id}`} replace />} />
                    <Route path="/users" element={<UserList embedded={false} />} />
                    <Route path="/users/:userId" element={<UserDetail />} />
                    <Route
                      path="/photos/:userId"
                      element={
                        <UserPhotos
                          advancedFeatures={advancedFeatures}
                          uploadTrigger={uploadTrigger}
                          currentUserId={currentUser._id}
                        />
                      }
                    />
                    <Route path="*" element={<Navigate to={`/users/${currentUser._id}`} replace />} />
                  </>
                ) : (
                  <>
                    {/* Chưa đăng nhập thì mọi đường dẫn đều đưa về trang Login */}
                    <Route path="*" element={<LoginRegister onLoginSuccess={handleLoginSuccess} />} />
                  </>
                )}
              </Routes>
            </div>
          </div>
        </div>

        {/* Modal Dialog tải ảnh lên (dùng HTML div thuần để hiển thị popup) */}
        {isUploadOpen && (
          <div className="modal-overlay" onClick={() => setIsUploadOpen(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Tải lên ảnh mới</h3>
                <button className="modal-close-btn" onClick={() => setIsUploadOpen(false)}>
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <div style={{ textAlign: "center" }}>
                  <label style={{ display: "block", padding: "10px", border: "1px dashed #ccc", cursor: "pointer" }}>
                    Chọn ảnh từ thiết bị
                    <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                  </label>
                  {selectedFile && (
                    <div style={{ marginTop: "10px", fontSize: "0.9rem" }}>
                      Tên tệp: {selectedFile.name}
                    </div>
                  )}
                  {filePreview && (
                    <img
                      src={filePreview}
                      alt="Xem trước"
                      style={{ maxWidth: "100%", maxHeight: "200px", marginTop: "10px" }}
                    />
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={() => setIsUploadOpen(false)}>Hủy</button>
                <button onClick={handleUploadPhoto} disabled={!selectedFile}>
                  Tải lên
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Thông báo Toast nổi góc phải bên dưới màn hình */}
        {snackbar.open && (
          <div className="toast-container">
            <div className={`toast ${snackbar.severity}`}>
              <span>{snackbar.message}</span>
              <button
                className="toast-close"
                onClick={() => setSnackbar({ ...snackbar, open: false })}
              >
                &times;
              </button>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;


