const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const RentalCost = require('../../models/RentalCost');
const RentalRequest = require('../../models/RentalRequest');
const AuctionCost = require('../../models/AuctionCost');
const isAdminLoggedIn = require('../../middlewares/isAdminLoggedIn');

// GET: Show manage earnings page
router.get('/manage-earnings', isAdminLoggedIn, async (req, res) => {
  try {
    // Fetch total revenue from rentals
    const rentalCosts = await RentalCost.find()
      .populate('sellerId', 'firstName lastName')
      .populate('rentalCarId', 'vehicleName')
      .lean();

    const totalRentalCost = rentalCosts.reduce((sum, cost) => sum + (cost.totalCost || 0), 0);
    const totalRentalRevenue = totalRentalCost * 0.04;

    // Fetch auction revenue from AuctionCost (sum of convenienceFee)
    const auctionCosts = await AuctionCost.find()
      .populate('sellerId', 'firstName lastName')
      .lean();

    const totalAuctionRevenue = auctionCosts.reduce((sum, auction) => sum + (auction.convenienceFee || 0), 0);

    // Calculate total revenue
    const totalRevenue = totalRentalRevenue + totalAuctionRevenue;

    // Format recent transactions (limit to 5)
    const rentalTransactions = rentalCosts.slice(0, 5).map(cost => ({
      utrNumber: null,
      userName: cost.sellerId ? `${cost.sellerId.firstName} ${cost.sellerId.lastName}` : 'Unknown',
      type: 'Rental',
      amount: cost.totalCost,
      createdAt: cost.createdAt
    }));

    const auctionTransactions = auctionCosts.slice(0, 5).map(auction => ({
      utrNumber: null,
      userName: auction.sellerId ? `${auction.sellerId.firstName} ${auction.sellerId.lastName}` : 'Unknown',
      type: 'Auction',
      amount: auction.convenienceFee,
      createdAt: auction.paymentDate
    }));

    // Combine and sort transactions by date (most recent first)
    const transactions = [...rentalTransactions, ...auctionTransactions]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.render('admin_dashboard/manage-earnings.ejs', {
      totalRevenue,
      totalAuctionRevenue,
      totalRentalRevenue,
      transactions,
      error: null
    });
  } catch (err) {
    console.error('Error fetching earnings data:', err);
    res.status(500).render('admin_dashboard/manage-earnings.ejs', {
      totalRevenue: 0,
      totalAuctionRevenue: 0,
      totalRentalRevenue: 0,
      transactions: [],
      error: 'Failed to load earnings data'
    });
  }
});

module.exports = router;