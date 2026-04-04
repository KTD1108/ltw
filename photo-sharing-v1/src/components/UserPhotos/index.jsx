import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

function formatDate(dateString) {
  return new Date(dateString).toLocaleString();
}

const imageMap = {
  "ouster.jpg": require("../../images/ouster.jpg"),
  "malcolm1.jpg": require("../../images/malcolm1.jpg"),
  "malcolm2.jpg": require("../../images/malcolm2.jpg"),
  "ripley1.jpg": require("../../images/ripley1.jpg"),
  "ripley2.jpg": require("../../images/ripley2.jpg"),
  "kenobi1.jpg": require("../../images/kenobi1.jpg"),
  "kenobi2.jpg": require("../../images/kenobi2.jpg"),
  "kenobi3.jpg": require("../../images/kenobi3.jpg"),
  "kenobi4.jpg": require("../../images/kenobi4.jpg"),
  "took1.jpg": require("../../images/took1.jpg"),
  "took2.jpg": require("../../images/took2.jpg"),
  "ludgate1.jpg": require("../../images/ludgate1.jpg"),
};

function CommentBlock({ comment }) {
  return (
    <Box className="comment-block">
      <Typography variant="subtitle2">
        <Link to={`/users/${comment.user._id}`} className="comment-user-link">
          {comment.user.first_name} {comment.user.last_name}
        </Link>
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block">
        {formatDate(comment.date_time)}
      </Typography>
      <Typography variant="body2">{comment.comment}</Typography>
    </Box>
  );
}

function PhotoCard({ photo }) {
  return (
    <Card className="photo-card" key={photo._id}>
      <CardMedia
        component="img"
        image={imageMap[photo.file_name]}
        alt={photo.file_name}
        className="photo-image"
      />
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          Uploaded: {formatDate(photo.date_time)}
        </Typography>
        <Divider className="photo-divider" />
        <Typography variant="h6" gutterBottom>
          Comments
        </Typography>
        {photo.comments && photo.comments.length > 0 ? (
          photo.comments.map((comment) => <CommentBlock key={comment._id} comment={comment} />)
        ) : (
          <Typography variant="body2" color="text.secondary">
            No comments yet.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function UserPhotos({ advancedFeatures }) {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      const [userData, photoData] = await Promise.all([
        fetchModel(`/user/${userId}`),
        fetchModel(`/photosOfUser/${userId}`),
      ]);

      if (!ignore) {
        setUser(userData);
        setPhotos(photoData || []);
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [userId]);

  const currentPhotoId = searchParams.get("photoId");

  const activePhotoIndex = useMemo(() => {
    if (!photos.length) {
      return -1;
    }
    if (!currentPhotoId) {
      return 0;
    }
    const foundIndex = photos.findIndex((photo) => photo._id === currentPhotoId);
    return foundIndex >= 0 ? foundIndex : 0;
  }, [photos, currentPhotoId]);

  const activePhoto = activePhotoIndex >= 0 ? photos[activePhotoIndex] : null;

  const goToPhoto = (newIndex) => {
    if (newIndex < 0 || newIndex >= photos.length) {
      return;
    }
    navigate(`/photos/${userId}?photoId=${photos[newIndex]._id}`);
  };

  if (!user) {
    return <Typography>Loading photos...</Typography>;
  }

  return (
    <div className="user-photos-container">
      <Typography variant="h4" gutterBottom>
        {user.first_name} {user.last_name}
      </Typography>
      <Typography variant="body1" color="text.secondary" className="user-photos-subtitle">
        {photos.length} photo{photos.length !== 1 ? "s" : ""} available.
      </Typography>

      {advancedFeatures ? (
        <div>
          {activePhoto ? <PhotoCard photo={activePhoto} /> : <Typography>No photos found.</Typography>}
          {photos.length > 0 && (
            <Stack direction="row" spacing={2} className="photo-stepper">
              <Button
                variant="outlined"
                onClick={() => goToPhoto(activePhotoIndex - 1)}
                disabled={activePhotoIndex <= 0}
              >
                Previous
              </Button>
              <Typography variant="body2" className="photo-stepper-text">
                Photo {activePhotoIndex + 1} of {photos.length}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => goToPhoto(activePhotoIndex + 1)}
                disabled={activePhotoIndex >= photos.length - 1}
              >
                Next
              </Button>
            </Stack>
          )}
        </div>
      ) : (
        <div className="photo-grid">
          {photos.map((photo) => (
            <PhotoCard key={photo._id} photo={photo} />
          ))}
        </div>
      )}
    </div>
  );
}

export default UserPhotos;
