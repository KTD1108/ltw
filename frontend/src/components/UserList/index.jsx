import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await fetchModel("/user/list");
        setUsers(data);
      } catch (err) {
        console.error("Lỗi tải danh sách user:", err);
      }
    }
    loadUsers();
  }, []);

  return (
    <div>
      <h4>Danh sách thành viên</h4>
      {users.map((user) => (
        <div key={user._id} style={{ margin: "10px 0" }}>
          <Link to={`/users/${user._id}`}>
            {user.first_name} {user.last_name}
          </Link>
        </div>
      ))}
    </div>
  );
}

export default UserList;
