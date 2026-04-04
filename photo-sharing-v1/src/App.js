import "./App.css";

import React, { useMemo, useState } from "react";
import { Grid, Paper } from "@mui/material";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";

import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";

function App() {
  const [advancedFeatures, setAdvancedFeatures] = useState(false);

  const topBarProps = useMemo(
    () => ({ advancedFeatures, setAdvancedFeatures }),
    [advancedFeatures]
  );

  return (
    <Router>
      <div className="app-shell">
        <TopBar {...topBarProps} />
        <div className="main-topbar-buffer" />
        <Grid container spacing={2} className="main-layout">
          <Grid item xs={12} sm={4} md={3}>
            <Paper className="main-grid-item sidebar-paper" elevation={3}>
              <UserList />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={8} md={9}>
            <Paper className="main-grid-item content-paper" elevation={3}>
              <Routes>
                <Route path="/" element={<Navigate to="/users" replace />} />
                <Route path="/users" element={<UserList embedded={false} />} />
                <Route path="/users/:userId" element={<UserDetail />} />
                <Route
                  path="/photos/:userId"
                  element={<UserPhotos advancedFeatures={advancedFeatures} />}
                />
              </Routes>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </Router>
  );
}

export default App;
