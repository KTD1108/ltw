import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";

function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUserDetail() {
      try {
        const data = await fetchModel(`/user/${userId}`);
        setUser(data);
      } catch (err) {
        console.error("Lỗi tải chi tiết user:", err);
      }
    }
    loadUserDetail();
  }, [userId]);

  if (!user) {
    return <div>Đang tải thông tin...</div>;
  }

  return (
    <div>
      <h2>{user.first_name} {user.last_name}</h2>
      <p>Địa chỉ: {user.location || "N/A"}</p>
      <p>Nghề nghiệp: {user.occupation || "N/A"}</p>
      <p>Mô tả bản thân: {user.description || "N/A"}</p>
      
      <p style={{ marginTop: "20px" }}>
        <Link to={`/photos/${user._id}`} style={{ fontWeight: "bold" }}>
          Xem ảnh album của {user.first_name}
        </Link>
      </p>
    </div>
  );
}

export default UserDetail;
