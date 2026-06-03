import "./App.css";
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import LoginRegister from "./components/LoginRegister";

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  
  // State trigger dùng để báo cho UserPhotos biết khi nào có ảnh vừa upload thành công để load lại album
  const [uploadTrigger, setUploadTrigger] = useState(0);

  // Tải trạng thái người dùng đã đăng nhập từ localStorage khi reload trang
  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Xử lý lưu trạng thái khi đăng nhập thành công
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  // Xử lý xóa trạng thái khi đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

  const handleUploadSuccess = () => {
    setUploadTrigger(prev => prev + 1); // Tăng trigger để reload album ảnh hiển thị
  };

  return (
    <Router>
      <div>
        {/* Thanh tiêu đề hỗ trợ upload ảnh */}
        <TopBar 
          currentUser={currentUser} 
          onLogout={handleLogout} 
          onUploadSuccess={handleUploadSuccess} 
        />

        {/* Bố cục chính */}
        {currentUser ? (
          <div style={{ display: "flex", marginTop: "20px" }}>
            {/* Cột trái: Danh sách User */}
            <div style={{ width: "25%", padding: "10px", borderRight: "1px solid #ccc" }}>
              <UserList />
            </div>

            {/* Cột phải: Content động */}
            <div style={{ width: "75%", padding: "20px" }}>
              <Routes>
                <Route path="/users/:userId" element={<UserDetail />} />
                <Route 
                  path="/photos/:userId" 
                  element={<UserPhotos uploadTrigger={uploadTrigger} />} 
                />
                <Route path="*" element={<Navigate to={`/users/${currentUser._id}`} replace />} />
              </Routes>
            </div>
          </div>
        ) : (
          /* Chưa đăng nhập */
          <div style={{ padding: "50px" }}>
            <Routes>
              <Route path="/login-register" element={<LoginRegister onLoginSuccess={handleLoginSuccess} />} />
              <Route path="*" element={<Navigate to="/login-register" replace />} />
            </Routes>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
