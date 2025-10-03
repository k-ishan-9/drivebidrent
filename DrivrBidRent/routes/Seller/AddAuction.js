const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const AuctionRequest = require('../../models/AuctionRequest');
const isSellerLoggedin = require('../../middlewares/isSellerLoggedin');

// GET: Show add auction page
router.get('/add-auction', isSellerLoggedin, async (req, res) => {
  try {
    const user = req.user;
    res.render('seller_dashboard/add-auction.ejs', { user });
  } catch (err) {
    console.error('Error fetching user data:', err);
    res.render('seller_dashboard/add-auction.ejs', { user: {}, error: 'Failed to load user data' });
  }
});

// POST: Handle Auction Submission
router.post('/add-auction', isSellerLoggedin, async (req, res) => {
  console.log('POST request received to /add-auction');
  try {
    const auction = new AuctionRequest({
      vehicleName: req.body['vehicle-name'],
      vehicleImage: req.body['vehicle-image'],
      year: req.body['vehicle-year'],
      mileage: req.body['vehicle-mileage'],
      fuelType: req.body['fuel-type'],
      transmission: req.body['transmission'],
      condition: req.body['vehicle-condition'],
      auctionDate: req.body['auction-date'],
      estimatedPrice: req.body['estimated-price'],
      startingBid: req.body['starting-bid'],
      sellerId: req.user._id,
      status: 'pending'
    });
    console.log('Auction object:', auction); // Log the auction object for debugging
    await auction.save();
    console.log('Auction saved:', auction);
    res.redirect('/seller_dashboard/view-auctions');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to submit auction');
  }
});

module.exports = router;