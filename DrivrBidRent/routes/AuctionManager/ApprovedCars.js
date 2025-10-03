const express = require('express');
const router = express.Router();
const AuctionRequest = require('../../models/AuctionRequest');
const AuctionBid = require('../../models/AuctionBid');
const Purchase = require('../../models/Purchase');
const User = require('../../models/User');
const isAuctionManager = require('../../middlewares/isAuctionManager');

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

// Helper function to format currency
const formatCurrency = (amount) => {
  if (!amount || isNaN(amount)) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

router.get('/approvedcars', isAuctionManager, async (req, res) => {
  try {
    const approvedCars = await AuctionRequest.find({ status: 'approved' })
      .populate('sellerId', 'firstName lastName city email');
    
    res.render('auctionmanager/approvedcars', { approvedCars });
  } catch (err) {
    console.error('Error fetching approved cars:', err);
    res.render('auctionmanager/approvedcars', { approvedCars: [] });
  }
});

// Route to start an auction
router.post('/start-auction/:id', isAuctionManager, async (req, res) => {
  try {
    const carId = req.params.id;
    const auction = await AuctionRequest.findByIdAndUpdate(carId, { started_auction: 'yes' }, { new: true });
    console.log(`Auction ${carId} started:`, auction);
    res.redirect('/auctionmanager/approvedcars');
  } catch (err) {
    console.error('Error starting auction:', err);
    res.status(500).json({ error: 'Failed to start auction' });
  }
});

// Route to stop an auction
router.post('/stop-auction/:id', isAuctionManager, async (req, res) => {
  try {
    const auction = await AuctionRequest.findById(req.params.id);
    if (!auction) {
      console.error(`Auction ${req.params.id} not found`);
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    console.log(`Stopping auction ${req.params.id}: Current state`, auction);

    if (auction.started_auction !== 'yes') {
      console.error(`Auction ${req.params.id} is not active:`, auction.started_auction);
      return res.status(400).json({ success: false, message: 'Auction is not active' });
    }

    if (auction.auction_stopped) {
      console.error(`Auction ${req.params.id} is already stopped`);
      return res.status(400).json({ success: false, message: 'Auction is already stopped' });
    }

    // Find the current bid (highest bid)
    const currentBid = await AuctionBid.findOne({ auctionId: auction._id, isCurrentBid: true })
      .populate('buyerId', 'firstName lastName email');

    console.log(`Current bid for auction ${req.params.id}:`, currentBid);

    // Update auction status
    auction.auction_stopped = true;
    auction.started_auction = 'ended';
    if (currentBid) {
      auction.winnerId = currentBid.buyerId._id;
      auction.finalPurchasePrice = currentBid.bidAmount;

      // Create a purchase record with pending payment
      const seller = await User.findById(auction.sellerId);
      const purchase = await Purchase.create({
        auctionId: auction._id,
        buyerId: currentBid.buyerId._id,
        sellerId: auction.sellerId,
        vehicleName: auction.vehicleName,
        vehicleImage: auction.vehicleImage,
        year: auction.year,
        mileage: auction.mileage,
        purchasePrice: currentBid.bidAmount,
        sellerName: `${seller.firstName} ${seller.lastName}`,
        purchaseDate: new Date(),
        paymentStatus: 'pending'
      });

      console.log(`Purchase record created for auction ${req.params.id}:`, purchase);
    } else {
      console.warn(`No bids found for auction ${req.params.id}`);
    }

    await auction.save();
    console.log(`Auction ${req.params.id} stopped successfully:`, auction);

    // Return JSON for AJAX requests
    if (req.xhr || req.headers.accept.includes('application/json')) {
      return res.json({ success: true, message: 'Auction stopped successfully' });
    }

    // Fallback redirect for non-AJAX requests
    res.redirect('/auctionmanager/approvedcars');
  } catch (error) {
    console.error(`Error stopping auction ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Route to view bids
router.get('/view-bids/:id', isAuctionManager, async (req, res) => {
  try {
    const carId = req.params.id;
    const auction = await AuctionRequest.findById(carId)
      .populate('sellerId', 'firstName lastName email city')
      .lean();
    
    if (!auction) {
      console.error(`Auction ${carId} not found for view-bids`);
      return res.redirect('/auctionmanager/approvedcars');
    }

    // Fetch bids for this auction
    const bids = await AuctionBid.getBidsForAuction(carId);
    const currentBid = bids.find(bid => bid.isCurrentBid) || null;
    const pastBids = bids.filter(bid => !bid.isCurrentBid).slice(0, 3);

    console.log(`Viewing bids for auction ${carId}:`, { currentBid, pastBids });

    res.render('auctionmanager/view-bids', {
      auction,
      currentBid,
      pastBids,
      helpers: {
        capitalize: safeCapitalize,
        formatDate,
        formatCurrency
      }
    });
  } catch (err) {
    console.error('Error viewing bids:', err);
    res.redirect('/auctionmanager/approvedcars');
  }
});

module.exports = router;