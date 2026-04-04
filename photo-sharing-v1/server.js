const express = require("express");
const models = require("./serverData.cjs");

const app = express();
const PORT = process.env.PORT || 3001;

app.get("/test/info", (req, res) => {
  if (typeof models.schemaInfo === "function") {
    return res.json(models.schemaInfo());
  }

  return res.json({
    _id: "schema-info",
    __v: 1,
    load_date_time: new Date().toISOString(),
  });
});

app.get("/user/list", (req, res) => {
  return res.json(models.userListModel());
});

app.get("/user/:id", (req, res) => {
  const user = models.userModel(req.params.id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json(user);
});

app.get("/photosOfUser/:id", (req, res) => {
  return res.json(models.photoOfUserModel(req.params.id));
});

app.listen(PORT, () => {
  console.log(`Backend server running at http://127.0.0.1:${PORT}`);
});
