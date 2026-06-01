import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

function UserDetail() {
  // useParams: Lấy userId từ tham số đường dẫn của React Router (ví dụ: "/users/:userId")
  const { userId } = useParams();
  
  // user: State lưu trữ toàn bộ thông tin chi tiết của người dùng đang được xem
  const [user, setUser] = useState(null);

  // Gọi API lấy chi tiết người dùng mỗi khi userId trên thanh URL thay đổi
  useEffect(() => {
    let ignore = false;

    async function loadUser() {
      // Gọi GET request gửi lên server kèm tham số userId
      const userData = await fetchModel(`/user/${userId}`);
      if (!ignore) {
        setUser(userData); // Lưu thông tin người dùng tìm thấy vào State
      }
    }

    loadUser();

    return () => {
      ignore = true;
    };
  }, [userId]); // [userId] là dependency: Chạy lại useEffect nếu userId thay đổi

  // Nếu dữ liệu chưa được tải xong từ server, hiển thị thông báo tải
  if (!user) {
    return <div>Loading user details...</div>;
  }

  return (
    <div>
      {/* Hiển thị thông tin đối tượng user ra màn hình */}
      <h2>{user.first_name} {user.last_name}</h2>
      <p>Location: {user.location}</p>
      <p>Occupation: {user.occupation}</p>
      <p>{user.description}</p>
      
      {/* Nút bấm điều hướng sang trang Album Ảnh của User đó */}
      <p>
        <Link to={`/photos/${user._id}`}>View Photos</Link>
      </p>
    </div>
  );
}

export default UserDetail;



