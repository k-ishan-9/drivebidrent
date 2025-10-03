const express = require('express');
const router = express.Router();
const AuctionRequest = require('../../models/AuctionRequest');
const User = require('../../models/User');
const isSellerLoggedin = require('../../middlewares/isSellerLoggedin');
// Route to display auction details
router.get('/auction-details/:id', isSellerLoggedin, async (req, res) => {
  try {
    const user = req.user;
    
    // Fetch specific auction by ID
    const auction = await AuctionRequest.findOne({
      _id: req.params.id,
      sellerId: user._id
    }).lean();
    
    if (!auction) {
      return res.redirect('/seller_dashboard/view-auctions');
    }
    
    res.render('seller_dashboard/auction-details.ejs', {
      user,
      auction,
      helpers: {
        capitalize: (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '',
        formatDate: (date) => date ? new Date(date).toLocaleDateString() : 'Not specified'
      },
      error: null
    });
  } catch (err) {
    console.error('Error fetching auction details:', err);
    res.redirect('/seller_dashboard/view-auctions');
  }
});

module.exports = router;