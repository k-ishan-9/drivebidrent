const express = require('express');
const router = express.Router();

// Driver details route
router.get('/driver', (req, res) => {
  const id = req.query.id;
  res.redirect(`/buyer_dashboard?page=driver&id=${id}`);
});

// Drivers list route
router.get('/drivers', (req, res) => {
  res.redirect('/buyer_dashboard?page=drivers');
});

module.exports = router;