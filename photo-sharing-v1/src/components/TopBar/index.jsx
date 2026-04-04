import React, { useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Checkbox,
  FormControlLabel,
  Toolbar,
  Typography,
} from "@mui/material";
import { useLocation } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

function TopBar({ advancedFeatures, setAdvancedFeatures }) {
  const location = useLocation();
  const pathParts = location.pathname.split("/").filter(Boolean);
  const userId = pathParts.length >= 2 ? pathParts[1] : null;
  const [contextText, setContextText] = useState("Users");

  useEffect(() => {
    let ignore = false;

    async function loadContext() {
      if (location.pathname === "/users") {
        if (!ignore) {
          setContextText("Browse users");
        }
        return;
      }

      if (!userId) {
        if (!ignore) {
          setContextText("Photo Sharing App");
        }
        return;
      }

      const user = await fetchModel(`/user/${userId}`);
      const fullName = user ? `${user.first_name} ${user.last_name}` : "Unknown user";

      if (ignore) {
        return;
      }

      if (location.pathname.startsWith("/photos/")) {
        setContextText(`Photos of ${fullName}`);
      } else {
        setContextText(fullName);
      }
    }

    loadContext();

    return () => {
      ignore = true;
    };
  }, [location.pathname, userId]);

  return (
    <AppBar className="topbar-appBar" position="fixed" elevation={2}>
      <Toolbar className="topbar-toolbar">
        <Typography variant="h6" className="topbar-name">
          Tiến Đạt Kiều
        </Typography>
        <Typography variant="h6" className="topbar-context">
          {contextText}
        </Typography>
        <Box className="topbar-actions">
          <FormControlLabel
            control={
              <Checkbox
                checked={advancedFeatures}
                onChange={(event) => setAdvancedFeatures(event.target.checked)}
                color="default"
              />
            }
            label="Enable Advanced Features"
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
