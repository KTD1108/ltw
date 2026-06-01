import React, { useState } from "react";
import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

function LoginRegister({ onLoginSuccess }) {
  // --- KHAI BÁO STATE QUẢN LÝ FORM ---
  // tabValue: Quản lý ẩn hiện Tab (0: Tab Đăng nhập, 1: Tab Đăng ký)
  const [tabValue, setTabValue] = useState(0);
  
  // Các state lưu thông tin nhập liệu cho Form Đăng nhập
  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState(""); // Lưu thông báo lỗi nếu đăng nhập thất bại

  // Các state lưu thông tin đăng ký tài khoản mới
  const [regLoginName, setRegLoginName] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regLocation, setRegLocation] = useState("");
  const [regDescription, setRegDescription] = useState("");
  const [regOccupation, setRegOccupation] = useState("");
  const [regError, setRegError] = useState(""); // Lưu thông báo lỗi khi đăng ký
  const [regSuccess, setRegSuccess] = useState(""); // Lưu thông báo đăng ký thành công

  // Hàm chuyển đổi qua lại giữa Tab Đăng nhập và Đăng ký
  const handleTabChange = (newValue) => {
    setTabValue(newValue);
    setLoginError("");
    setRegError("");
    setRegSuccess("");
  };

  // --- HÀM XỬ LÝ ĐĂNG NHẬP ---
  const handleLogin = async (e) => {
    e.preventDefault(); // Ngăn trình duyệt tự động load lại trang
    setLoginError("");

    // Kiểm tra tính hợp lệ cơ bản
    if (!loginName || !loginPassword) {
      setLoginError("Vui lòng điền đầy đủ Tên đăng nhập và Mật khẩu!");
      return;
    }

    try {
      // Gửi thông tin đăng nhập lên server bằng phương thức POST
      const data = await fetchModel("/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login_name: loginName, password: loginPassword }),
      });

      // Lưu Token (chính là user ID được server cấp) vào localStorage
      localStorage.setItem("token", data._id);
      
      // Lưu toàn bộ thông tin đối tượng người dùng hiện tại
      localStorage.setItem("currentUser", JSON.stringify(data));
      
      // Gọi callback thông báo đăng nhập thành công lên App.js để cập nhật State tổng
      onLoginSuccess(data);
    } catch (err) {
      setLoginError(err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!");
    }
  };

  // --- HÀM XỬ LÝ ĐĂNG KÝ ---
  const handleRegister = async (e) => {
    e.preventDefault(); // Ngăn load lại trang
    setRegError("");
    setRegSuccess("");

    // Kiểm tra các trường bắt buộc phải nhập (*)
    if (!regLoginName || !regPassword || !regConfirmPassword || !regFirstName || !regLastName) {
      setRegError("Vui lòng điền đầy đủ các trường bắt buộc (*)");
      return;
    }

    // Kiểm tra xem mật khẩu nhập lại có khớp không
    if (regPassword !== regConfirmPassword) {
      setRegError("Mật khẩu và xác nhận mật khẩu không trùng khớp!");
      return;
    }

    try {
      // Gửi yêu cầu đăng ký người dùng mới lên backend bằng phương thức POST
      const result = await fetchModel("/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login_name: regLoginName,
          password: regPassword,
          first_name: regFirstName,
          last_name: regLastName,
          location: regLocation,
          description: regDescription,
          occupation: regOccupation,
        }),
      });

      // Hiện thông báo thành công và xóa sạch các ô input
      setRegSuccess(`Đăng ký thành công tài khoản "${result.login_name}"! Vui lòng chuyển sang Tab Đăng nhập.`);
      setRegLoginName("");
      setRegPassword("");
      setRegConfirmPassword("");
      setRegFirstName("");
      setRegLastName("");
      setRegLocation("");
      setRegDescription("");
      setRegOccupation("");
    } catch (err) {
      setRegError(err.message || "Có lỗi xảy ra trong quá trình đăng ký!");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
      {/* Các nút chuyển đổi Tab */}
      <div>
        <button onClick={() => handleTabChange(0)}>Đăng Nhập</button>{" "}
        <button onClick={() => handleTabChange(1)}>Đăng Ký</button>
      </div>

      {/* Hiển thị Form Đăng nhập nếu tabValue = 0 */}
      {tabValue === 0 ? (
        <form onSubmit={handleLogin}>
          <h2>Đăng Nhập</h2>
          {loginError && <p style={{ color: "red" }}>{loginError}</p>}
          <p>
            Tên đăng nhập: <br />
            <input
              type="text"
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)} // Cập nhật state khi gõ
            />
          </p>
          <p>
            Mật khẩu: <br />
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)} // Cập nhật state khi gõ
            />
          </p>
          <button type="submit">Đăng Nhập</button>
        </form>
      ) : (
        /* Hiển thị Form Đăng ký nếu tabValue = 1 */
        <form onSubmit={handleRegister}>
          <h2>Đăng Ký</h2>
          {regError && <p style={{ color: "red" }}>{regError}</p>}
          {regSuccess && <p style={{ color: "green" }}>{regSuccess}</p>}
          <p>
            Tên đăng nhập (*): <br />
            <input
              type="text"
              value={regLoginName}
              onChange={(e) => setRegLoginName(e.target.value)}
            />
          </p>
          <p>
            Mật khẩu (*): <br />
            <input
              type="password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
            />
          </p>
          <p>
            Xác nhận mật khẩu (*): <br />
            <input
              type="password"
              value={regConfirmPassword}
              onChange={(e) => setRegConfirmPassword(e.target.value)}
            />
          </p>
          <p>
            Tên (*): <br />
            <input
              type="text"
              value={regFirstName}
              onChange={(e) => setRegFirstName(e.target.value)}
            />
          </p>
          <p>
            Họ (*): <br />
            <input
              type="text"
              value={regLastName}
              onChange={(e) => setRegLastName(e.target.value)}
            />
          </p>
          <p>
            Địa chỉ: <br />
            <input
              type="text"
              value={regLocation}
              onChange={(e) => setRegLocation(e.target.value)}
            />
          </p>
          <p>
            Nghề nghiệp: <br />
            <input
              type="text"
              value={regOccupation}
              onChange={(e) => setRegOccupation(e.target.value)}
            />
          </p>
          <p>
            Mô tả: <br />
            <textarea
              value={regDescription}
              onChange={(e) => setRegDescription(e.target.value)}
            />
          </p>
          <button type="submit">Đăng Ký</button>
        </form>
      )}
    </div>
  );
}

export default LoginRegister;


