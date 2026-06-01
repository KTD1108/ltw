const express = require("express");
const SchemaInfo = require("../db/schemaInfo");

const router = express.Router();

// GET /test/info
router.get("/info", async (req, res) => {
  try {
    const info = await SchemaInfo.findOne();
    if (info) {
      return res.json(info);
    }
    return res.status(500).json({ error: "Missing SchemaInfo" });
  } catch (error) {
    return res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
