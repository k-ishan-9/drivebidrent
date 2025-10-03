const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const RentalCost = require('../../models/RentalCost');
const RentalRequest = require('../../models/RentalRequest');
const AuctionRequest = require('../../models/AuctionRequest');
const AuctionBid = require('../../models/AuctionBid');
const isSellerLoggedin = require('../../middlewares/isSellerLoggedin');

// GET: Show earnings page
router.get('/view-earnings', isSellerLoggedin, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.redirect('/login');
    }

    // Fetch all RentalCost entries for the seller
    const rentalCosts = await RentalCost.find({ sellerId: req.user._id })
      .populate({
        path: 'rentalCarId',
        select: 'vehicleName createdAt'
      })
      .sort({ createdAt: -1 })
      .lean();

    // Calculate total earnings from rentals
    const totalRentalEarnings = rentalCosts.reduce((sum, cost) => sum + (cost.totalCost || 0), 0);

    // Fetch all auctions for the seller that have started or ended
    const auctions = await AuctionRequest.find({
      sellerId: req.user._id,
      started_auction: { $in: ['yes', 'ended'] }
    }).lean();

    // Calculate total earnings from auctions
    let totalAuctionEarnings = 0;
    const auctionEarnings = [];

    for (const auction of auctions) {
      if (auction.started_auction === 'yes') {
        // For ongoing auctions, get the current bid
        const currentBid = await AuctionBid.findOne({
          auctionId: auction._id,
          isCurrentBid: true
        }).lean();
        
        if (currentBid) {
          totalAuctionEarnings += currentBid.bidAmount;
          auctionEarnings.push({
            amount: currentBid.bidAmount,
            description: `${auction.vehicleName} (Current Bid)`,
            createdAt: currentBid.bidTime
          });
        }
      } else if (auction.started_auction === 'ended' && auction.finalPurchasePrice) {
        // For ended auctions, use the final purchase price
        totalAuctionEarnings += auction.finalPurchasePrice;
        auctionEarnings.push({
          amount: auction.finalPurchasePrice,
          description: `${auction.vehicleName} (Auction Final Sale)`,
          createdAt: auction.updatedAt
        });
      }
    }

    // Format recent earnings for rentals
    const recentRentalEarnings = rentalCosts.map(cost => ({
      amount: cost.totalCost,
      description: `${cost.rentalCarId ? cost.rentalCarId.vehicleName : 'Unknown Vehicle'} (Rental)`,
      createdAt: cost.createdAt
    }));

    // Combine and sort recent earnings (rentals + auctions)
    const allRecentEarnings = [...recentRentalEarnings, ...auctionEarnings]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.render('seller_dashboard/view-earnings.ejs', {
      user,
      totalRentalEarnings,
      totalAuctionEarnings,
      recentEarnings: allRecentEarnings,
      error: null
    });
  } catch (err) {
    console.error('Error fetching earnings data:', err);
    res.render('seller_dashboard/view-earnings.ejs', {
      user: {},
      totalRentalEarnings: 0,
      totalAuctionEarnings: 0,
      recentEarnings: [],
      error: 'Failed to load earnings data'
    });
  }
});

module.exports = router;