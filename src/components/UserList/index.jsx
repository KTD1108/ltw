import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

function UserList({ embedded = true }) {
  // users: State lưu mảng danh sách người dùng được lấy từ backend
  const [users, setUsers] = useState([]);
  
  // location: Theo dõi đường dẫn URL hiện tại để bôi đậm thành viên đang được chọn
  const location = useLocation();

  // useEffect tự động gọi API lấy danh sách thành viên khi component được sinh ra
  useEffect(() => {
    let ignore = false;

    async function loadUsers() {
      const token = localStorage.getItem("token");
      if (!token) {
        return; // Nếu chưa đăng nhập (không có token) thì dừng lại
      }
      try {
        // Gửi yêu cầu GET lên endpoint "/user/list"
        const userList = await fetchModel("/user/list");
        if (!ignore) {
          setUsers(userList || []); // Lưu mảng user trả về vào state
        }
      } catch (err) {
        console.error("Failed to load users:", err);
      }
    }

    loadUsers();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div>
      <h3>Users</h3>
      {/* Hiển thị dòng mô tả ngắn nếu component này được nhúng ở ngoài menu độc lập */}
      {!embedded && <p>Select a user from the list to view their profile and photos.</p>}
      
      {/* Duyệt qua từng đối tượng user trong mảng và tạo thẻ liên kết Link */}
      <div>
        {users.map((user) => {
          // Kiểm tra xem đường dẫn URL hiện tại có trùng khớp với ID của user này không
          const isSelected = location.pathname === `/users/${user._id}`;
          return (
            <div key={user._id} style={{ margin: "5px 0" }}>
              <Link
                to={`/users/${user._id}`}
                // Nếu đang chọn thì in đậm (bold), ngược lại để bình thường (normal)
                style={{ fontWeight: isSelected ? "bold" : "normal", textDecoration: "none" }}
              >
                {user.first_name} {user.last_name}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default UserList;



