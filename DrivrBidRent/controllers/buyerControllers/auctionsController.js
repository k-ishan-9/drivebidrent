// controllers/buyerControllers/auctionsController.js
const AuctionRequest = require('../../models/AuctionRequest');
const AuctionBid = require('../../models/AuctionBid');
const Purchase = require('../../models/Purchase');
const AuctionCost = require('../../models/AuctionCost');

// Controller for all auctions page with search/filter
const getAuctions = async (req, res) => {
  try {
    const { search, condition, fuelType, transmission, minPrice, maxPrice } = req.query;
    const query = { 
      status: 'approved', 
      started_auction: 'yes'
    };

    if (search) {
      query.vehicleName = { $regex: search, $options: 'i' };
    }

    if (condition) {
      query.condition = condition;
    }

    if (fuelType) {
      query.fuelType = fuelType;
    }

    if (transmission) {
      query.transmission = transmission;
    }

    if (minPrice || maxPrice) {
      query.startingBid = {};
      if (minPrice) query.startingBid.$gte = parseFloat(minPrice);
      if (maxPrice) query.startingBid.$lte = parseFloat(maxPrice);
    }

    const auctions = await AuctionRequest.find(query)
      .sort({ auctionDate: 1 })
      .populate('sellerId', 'firstName lastName email phone city state')
      .exec();

    res.render('buyer_dashboard/auctions.ejs', {
      auctions,
      user: req.user,
      search,
      condition,
      fuelType,
      transmission,
      minPrice,
      maxPrice
    });
  } catch (err) {
    console.error('Error fetching auctions:', err);
    res.status(500).render('buyer_dashboard/error.ejs', {
      user: req.user || {},
      message: 'An error occurred while loading auctions'
    });
  }
};

// Controller for single auction view
const getSingleAuction = async (req, res) => {
  try {
    const auctionId = req.query.id;
    if (!auctionId) {
      return res.status(400).render('buyer_dashboard/error.ejs', { 
        message: 'Auction ID is required', 
        user: req.user 
      });
    }

    const auction = await AuctionRequest.findOne({ 
      _id: auctionId,
      started_auction: 'yes'
    })
      .populate('sellerId', 'firstName lastName email phone city state');

    if (!auction) {
      return res.status(404).render('buyer_dashboard/error.ejs', { 
        message: 'Auction not found or has ended', 
        user: req.user 
      });
    }

    const currentBid = await AuctionBid.findOne({ auctionId, isCurrentBid: true })
      .sort({ bidTime: -1 });

    const isCurrentBidder = currentBid && req.user._id.toString() === currentBid.buyerId.toString();

    res.render('buyer_dashboard/auction.ejs', {
      auction,
      currentBid,
      isLoggedIn: !!req.user,
      isCurrentBidder,
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching auction:', error);
    res.status(500).render('buyer_dashboard/error.ejs', { 
      message: 'Server error', 
      user: req.user || {} 
    });
  }
};

// Controller for placing a bid
const placeBid = async (req, res) => {
  try {
    const { auctionId, bidAmount } = req.body;
    const buyerId = req.user._id;

    if (!auctionId || !bidAmount) {
      return res.status(400).json({ success: false, message: 'Auction ID and bid amount are required' });
    }

    const bidValue = parseFloat(bidAmount);
    if (isNaN(bidValue) || bidValue <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid bid amount' });
    }

    const auction = await AuctionRequest.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    if (auction.started_auction !== 'yes' || auction.auction_stopped) {
      return res.status(400).json({ success: false, message: 'Auction is not active or has been stopped' });
    }

    const currentBid = await AuctionBid.findOne({ auctionId, isCurrentBid: true })
      .sort({ bidTime: -1 });

    if (currentBid && currentBid.buyerId.toString() === buyerId.toString()) {
      return res.status(400).json({ success: false, message: 'You already have the current bid' });
    }

    const minBid = currentBid ? currentBid.bidAmount + 2000 : auction.startingBid;
    if (bidValue < minBid) {
      return res.status(400).json({ 
        success: false, 
        message: `Your bid must be at least ₹${minBid.toLocaleString()}` 
      });
    }

    const newBid = new AuctionBid({
      auctionId,
      sellerId: auction.sellerId,
      buyerId,
      bidAmount: bidValue,
      isCurrentBid: true
    });

    await newBid.save();

    res.json({ success: true, message: 'Bid placed successfully',bidAmount: bidValue, auctionId: auctionId , buyerId: buyerId });
  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Controller to check if user is the auction winner and get payment status
const getAuctionWinnerStatus = async (req, res) => {
  try {
    const auction = await AuctionRequest.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    if (!auction.auction_stopped) {
      return res.json({ isWinner: false });
    }

    const isWinner = auction.winnerId && auction.winnerId.toString() === req.user._id.toString();
    if (!isWinner) {
      return res.json({ isWinner: false });
    }

    const purchase = await Purchase.findOne({ auctionId: auction._id, buyerId: req.user._id });
    res.json({
      isWinner: true,
      bidAmount: auction.finalPurchasePrice,
      paymentStatus: purchase ? purchase.paymentStatus : 'pending'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Controller to fetch payment details for the popup
const getAuctionConfirmPayment = async (req, res) => {
  try {
    const auctionId = req.params.id;
    const userId = req.user._id;

    const purchase = await Purchase.findOne({ auctionId, buyerId: userId });
    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }

    if (purchase.paymentStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'Payment already completed' });
    }

    const convenienceFee = purchase.purchasePrice * 0.01;
    const totalAmount = purchase.purchasePrice + convenienceFee;

    res.json({
      success: true,
      purchaseId: purchase._id,
      auctionId: purchase.auctionId,
      amount: purchase.purchasePrice,
      convenienceFee: convenienceFee,
      totalAmount: totalAmount
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Controller to handle final payment submission
const completeAuctionPayment = async (req, res) => {
  try {
    const purchaseId = req.params.id;
    const userId = req.user._id;

    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }

    if (purchase.buyerId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (purchase.paymentStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'Payment already completed' });
    }

    const convenienceFee = purchase.purchasePrice * 0.01;
    const totalAmount = purchase.purchasePrice + convenienceFee;

    const auctionCost = new AuctionCost({
      auctionId: purchase.auctionId,
      buyerId: userId,
      sellerId: purchase.sellerId,
      amountPaid: purchase.purchasePrice,
      convenienceFee: convenienceFee,
      totalAmount: totalAmount,
      paymentDate: new Date()
    });
    await auctionCost.save();

    purchase.paymentStatus = 'completed';
    await purchase.save();

    res.json({ success: true, message: 'Payment completed successfully' });
  } catch (error) {
    console.error('Error completing payment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { 
  getAuctions, 
  getSingleAuction, 
  placeBid, 
  getAuctionWinnerStatus, 
  getAuctionConfirmPayment, 
  completeAuctionPayment 
};