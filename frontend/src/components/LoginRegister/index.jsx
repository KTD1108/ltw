import React, { useState } from "react";
import fetchModel from "../../lib/fetchModelData";

function LoginRegister({ onLoginSuccess }) {
  const [tabValue, setTabValue] = useState(0); // 0: Login, 1: Register

  // States Đăng nhập
  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // States Đăng ký
  const [regLoginName, setRegLoginName] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regLocation, setRegLocation] = useState("");
  const [regDescription, setRegDescription] = useState("");
  const [regOccupation, setRegOccupation] = useState("");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  // Submit Đăng nhập
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    if (!loginName || !loginPassword) {
      setLoginError("Thiếu thông tin đăng nhập");
      return;
    }
    try {
      const data = await fetchModel("/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login_name: loginName, password: loginPassword }),
      });
      localStorage.setItem("token", data._id);
      localStorage.setItem("currentUser", JSON.stringify(data));
      if (onLoginSuccess) onLoginSuccess(data);
    } catch (err) {
      setLoginError(err.message);
    }
  };

  // Submit Đăng ký
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");
    if (!regLoginName || !regPassword || !regFirstName || !regLastName) {
      setRegError("Thiếu thông tin bắt buộc");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError("Mật khẩu nhập lại không khớp");
      return;
    }
    try {
      await fetchModel("/user", {
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
      setRegSuccess("Đăng ký thành công!");
      // Reset form
      setRegLoginName("");
      setRegPassword("");
      setRegConfirmPassword("");
      setRegFirstName("");
      setRegLastName("");
      setRegLocation("");
      setRegDescription("");
      setRegOccupation("");
    } catch (err) {
      setRegError(err.message);
    }
  };

  return (
    <div>
      {/* Nút chuyển đổi Đăng nhập / Đăng ký */}
      <div>
        <button onClick={() => { setTabValue(0); setLoginError(""); setRegError(""); setRegSuccess(""); }}>
          Đăng nhập
        </button>
        <button onClick={() => { setTabValue(1); setLoginError(""); setRegError(""); setRegSuccess(""); }}>
          Đăng ký
        </button>
      </div>

      {/* FORM ĐĂNG NHẬP */}
      {tabValue === 0 ? (
        <form onSubmit={handleLoginSubmit}>
          <h3>Đăng nhập</h3>
          {loginError && <p style={{ color: "red" }}>{loginError}</p>}
          
          <p>
            Tài khoản<br />
            <input type="text" value={loginName} onChange={(e) => setLoginName(e.target.value)} />
          </p>
          <p>
            Mật khẩu<br />
            <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
          </p>
          <button type="submit">Đăng nhập</button>
        </form>
      ) : (
        /* FORM ĐĂNG KÝ */
        <form onSubmit={handleRegisterSubmit}>
          <h3>Đăng ký</h3>
          {regError && <p style={{ color: "red" }}>{regError}</p>}
          {regSuccess && <p style={{ color: "green" }}>{regSuccess}</p>}

          <p>
            Tài khoản *<br />
            <input type="text" value={regLoginName} onChange={(e) => setRegLoginName(e.target.value)} />
          </p>
          <p>
            Mật khẩu *<br />
            <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
          </p>
          <p>
            Nhập lại mật khẩu *<br />
            <input type="password" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} />
          </p>
          <p>
            Họ *<br />
            <input type="text" value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} />
          </p>
          <p>
            Tên *<br />
            <input type="text" value={regLastName} onChange={(e) => setRegLastName(e.target.value)} />
          </p>
          <p>
            Địa chỉ<br />
            <input type="text" value={regLocation} onChange={(e) => setRegLocation(e.target.value)} />
          </p>
          <p>
            Mô tả<br />
            <input type="text" value={regDescription} onChange={(e) => setRegDescription(e.target.value)} />
          </p>
          <p>
            Nghề nghiệp<br />
            <input type="text" value={regOccupation} onChange={(e) => setRegOccupation(e.target.value)} />
          </p>
          <button type="submit">Đăng ký</button>
        </form>
      )}
    </div>
  );
}

export default LoginRegister;
