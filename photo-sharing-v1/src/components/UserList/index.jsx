import React, { useEffect, useState } from "react";
import {
  Avatar,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

function UserList({ embedded = true }) {
  const [users, setUsers] = useState([]);
  const location = useLocation();

  useEffect(() => {
    let ignore = false;

    async function loadUsers() {
      const userList = await fetchModel("/user/list");
      if (!ignore) {
        setUsers(userList || []);
      }
    }

    loadUsers();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="user-list-container">
      <Typography variant="h6" className="user-list-title">
        Users
      </Typography>
      {!embedded && (
        <Typography variant="body2" color="text.secondary" className="user-list-subtitle">
          Select a user from the list to view their profile and photos.
        </Typography>
      )}
      <List component="nav" className="user-list">
        {users.map((user) => {
          const fullName = `${user.first_name} ${user.last_name}`;
          const isSelected = location.pathname === `/users/${user._id}`;

          return (
            <React.Fragment key={user._id}>
              <ListItemButton
                component={Link}
                to={`/users/${user._id}`}
                selected={isSelected}
                className="user-list-item"
              >
                <Avatar className="user-list-avatar">
                  {user.first_name.charAt(0)}
                </Avatar>
                <ListItemText primary={fullName} secondary={user.location} />
              </ListItemButton>
              <Divider component="li" />
            </React.Fragment>
          );
        })}
      </List>
    </div>
  );
}

export default UserList;
