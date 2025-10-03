const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const isSellerLoggedin = require('../../middlewares/isSellerLoggedin');

router.get('/seller', isSellerLoggedin, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.redirect('/login');
    }
    res.render('seller_dashboard/seller.ejs', { user });
  } catch (err) {
    console.error(err);
    res.render('seller_dashboard/seller.ejs', { user: {} });
  }
});

module.exports = router;