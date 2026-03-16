// controllers/buyerControllers/dashboardController.js
const RentalRequest = require('../../models/RentalRequest');
const AuctionRequest = require('../../models/AuctionRequest');

// Controller for dashboard home with featured listings
const getDashboardHome = async (req, res) => {
  try {
    const featuredRentals = await RentalRequest.find({ status: 'available' })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('sellerId', 'firstName lastName')
      .exec();

    const featuredAuctions = await AuctionRequest.find({ 
      status: 'approved', 
      started_auction: 'yes'
    })
      .sort({ auctionDate: -1 })
      .limit(3)
      .populate('sellerId', 'firstName lastName')
      .exec();

    res.render('buyer_dashboard/proj.ejs', {
      featuredRentals,
      featuredAuctions,
      user: req.user,
      error: null,
      success: null
    });
  } catch (err) {
    console.error('Error fetching dashboard home:', err);
    res.status(500).render('buyer_dashboard/error.ejs', {
      user: req.user || {},
      message: 'An error occurred while loading the dashboard'
    });
  }
};

module.exports = { getDashboardHome };