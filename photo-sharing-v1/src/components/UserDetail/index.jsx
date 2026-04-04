import React, { useEffect, useState } from "react";
import { Button, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { Link, useParams } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadUser() {
      const userData = await fetchModel(`/user/${userId}`);
      if (!ignore) {
        setUser(userData);
      }
    }

    loadUser();

    return () => {
      ignore = true;
    };
  }, [userId]);

  if (!user) {
    return <Typography>Loading user details...</Typography>;
  }

  return (
    <Card className="user-detail-card" elevation={0}>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          {user.first_name} {user.last_name}
        </Typography>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" className="user-detail-chips">
          <Chip label={`Location: ${user.location}`} />
          <Chip label={`Occupation: ${user.occupation}`} />
        </Stack>
        <Typography variant="body1" className="user-detail-description">
          {user.description}
        </Typography>
        <Button component={Link} to={`/photos/${user._id}`} variant="contained">
          View Photos
        </Button>
      </CardContent>
    </Card>
  );
}

export default UserDetail;
