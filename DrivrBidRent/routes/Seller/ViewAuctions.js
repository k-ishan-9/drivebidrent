const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const AuctionRequest = require('../../models/AuctionRequest');
const AuctionBid = require('../../models/AuctionBid');
const isSellerLoggedin = require('../../middlewares/isSellerLoggedin');

// Helper function to safely capitalize strings
const safeCapitalize = (str) => {
  if (!str || typeof str !== 'string') return 'Not specified';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Helper function to format date
const formatDate = (date) => {
  if (!date) return 'Not specified';
  try {
    return new Date(date).toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return 'Invalid date';
  }
};

router.get('/view-auctions', isSellerLoggedin, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.redirect('/login');
    }
    
    // Fetch all auctions for this seller
    const auctions = await AuctionRequest.find({ sellerId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    
    res.render('seller_dashboard/view-auctions.ejs', {
      user,
      auctions: auctions || [],
      helpers: {
        capitalize: safeCapitalize,
        formatDate
      },
      error: null
    });
  } catch (err) {
    console.error('Error fetching auction data:', err);
    res.render('seller_dashboard/view-auctions.ejs', {
      user: {},
      auctions: [],
      helpers: {
        capitalize: safeCapitalize,
        formatDate
      },
      error: 'Failed to load auction data'
    });
  }
});

// Route to view bids for a specific auction
router.get('/view-bids/:id', isSellerLoggedin, async (req, res) => {
  try {
    const auctionId = req.params.id;
    const auction = await AuctionRequest.findOne({ 
      _id: auctionId,
      sellerId: req.user._id
    }).lean();
    
    if (!auction) {
      return res.redirect('/seller_dashboard/view-auctions');
    }
    
    // Check if auction is approved
    if (auction.status !== 'approved' && auction.status !== 'assignedMechanic') {
      req.flash('error', 'This auction has not been approved yet.');
      return res.redirect('/seller_dashboard/view-auctions');
    }
    
    // Check if auction has started or ended
    if (auction.started_auction !== 'yes' && auction.started_auction !== 'ended') {
      req.flash('error', 'Auction has not yet started.');
      return res.redirect('/seller_dashboard/view-auctions');
    }
    
    // Fetch bids for this auction and populate buyerId with additional fields
    const bids = await AuctionBid.find({ auctionId })
      .populate('buyerId', 'firstName lastName email phone')
      .sort({ bidTime: -1 })
      .lean();
    
    // Separate current bid and bid history
    const currentBid = bids.find(bid => bid.isCurrentBid) || null;
    const bidHistory = bids.filter(bid => !bid.isCurrentBid).slice(0, 3);
    
    res.render('seller_dashboard/view-bids.ejs', {
      user: await User.findById(req.user._id).lean(),
      auction,
      currentBid,
      bidHistory,
      helpers: {
        capitalize: safeCapitalize,
        formatDate
      }
    });
    
  } catch (err) {
    console.error('Error accessing auction bids:', err);
    req.flash('error', 'Failed to access auction bids.');
    res.redirect('/seller_dashboard/view-auctions');
  }
});

module.exports = router;