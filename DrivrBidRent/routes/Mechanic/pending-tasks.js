const express = require('express');
const router = express.Router();
const isMechanicLoggedin = require('../../middlewares/isMechanicLoggedin');

router.get("/pending-tasks", isMechanicLoggedin, (req, res) => {
  res.render("mechanic_dashboard/pending-tasks.ejs");
});

module.exports = router;