const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const RentalCost = require("../../models/RentalCost");
const AuctionCost = require("../../models/AuctionCost");
const RentalRequest = require("../../models/RentalRequest");
const AuctionRequest = require("../../models/AuctionRequest");
const AuctionBid = require("../../models/AuctionBid");
const isAdminLoggedIn = require('../../middlewares/isAdminLoggedIn');

// Admin homepage route
router.get("/admin", isAdminLoggedIn, async (req, res) => {
  try {
    // Fetch user data
    const user = await User.findById(req.user._id).lean();
    if (!user) {
      return res.redirect("/login");
    }

    // Fetch total users
    const totalUsers = await User.countDocuments();

    // Fetch counts for buyers, sellers, and mechanics
    const totalBuyers = await User.countDocuments({ userType: "buyer" });
    const totalSellers = await User.countDocuments({ userType: "seller" });
    const totalMechanics = await User.countDocuments({ userType: "mechanic" });

    // Fetch total earnings from rentals
    const rentalCosts = await RentalCost.find()
      .populate("sellerId", "firstName lastName")
      .populate("rentalCarId", "vehicleName")
      .lean();

    const totalRentalEarnings = rentalCosts.reduce(
      (sum, cost) => sum + (cost.totalCost || 0),
      0
    );

    // Fetch total earnings from auctions (using AuctionCost)
    const auctionCosts = await AuctionCost.find()
      .populate("sellerId", "firstName lastName")
      .populate("auctionId", "vehicleName")
      .lean();

    const totalAuctionEarnings = auctionCosts.reduce(
      (sum, cost) => sum + (cost.totalAmount || 0),
      0
    );

    // Calculate total earnings
    const totalEarnings = totalRentalEarnings + totalAuctionEarnings;

    // Format recent activity
    const rentalActivities = rentalCosts.map((cost) => ({
      description: `Rental earning: ₹${cost.totalCost.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      })} from ${
        cost.sellerId
          ? `${cost.sellerId.firstName} ${cost.sellerId.lastName}`
          : "Unknown"
      } (${
        cost.rentalCarId ? cost.rentalCarId.vehicleName : "Unknown Vehicle"
      })`,
      timestamp: cost.createdAt,
    }));

    const auctionActivities = auctionCosts.map((cost) => ({
      description: `Auction earning: ₹${cost.totalAmount.toLocaleString(
        "en-IN",
        {
          minimumFractionDigits: 2,
        }
      )} from ${
        cost.sellerId
          ? `${cost.sellerId.firstName} ${cost.sellerId.lastName}`
          : "Unknown"
      } (${cost.auctionId ? cost.auctionId.vehicleName : "Unknown Vehicle"})`,
      timestamp: cost.paymentDate,
    }));

    // Fetch recent auction bids
    const recentBids = await AuctionBid.find()
      .populate("buyerId", "firstName lastName")
      .populate("auctionId", "vehicleName")
      .sort({ bidTime: -1 })
      .limit(5)
      .lean();

    const bidActivities = recentBids.map((bid) => ({
      description: `New bid: ₹${bid.bidAmount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      })} by ${
        bid.buyerId
          ? `${bid.buyerId.firstName} ${bid.buyerId.lastName}`
          : "Unknown"
      } on ${bid.auctionId ? bid.auctionId.vehicleName : "Unknown Vehicle"}`,
      timestamp: bid.bidTime,
    }));

    // Fetch recent auction approvals
    const recentAuctions = await AuctionRequest.find({ status: "approved" })
      .populate("sellerId", "firstName lastName")
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();

    const auctionApprovalActivities = recentAuctions.map((auction) => ({
      description: `Auction approved for ${auction.vehicleName} by ${
        auction.sellerId
          ? `${auction.sellerId.firstName} ${auction.sellerId.lastName}`
          : "Unknown"
      }`,
      timestamp: auction.updatedAt,
    }));

    // Fetch recent user registrations
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("firstName lastName createdAt")
      .lean();

    const userActivities = recentUsers.map((user) => ({
      description: `New user registered: ${user.firstName} ${user.lastName}`,
      timestamp: user.createdAt,
    }));

    // Combine and sort activities by timestamp (most recent first)
    const recentActivity = [
      ...userActivities,
      ...rentalActivities,
      ...auctionActivities,
      ...bidActivities,
      ...auctionApprovalActivities,
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
    console.log(totalBuyers);
    res.render("admin_dashboard/admin.ejs", {
      user,
      totalUsers,
      totalBuyers,
      totalSellers,
      totalMechanics,
      totalEarnings,
      recentActivity,
      error: null,
    });
  } catch (err) {
    console.error("Error accessing admin dashboard:", err);
    res.render("admin_dashboard/admin.ejs", {
      user: {},
      totalUsers: 0,
      totalBuyers: 0,
      totalSellers: 0,
      totalMechanics: 0,
      totalEarnings: 0,
      recentActivity: [],
      error: "Failed to load admin data",
    });
  }
});

module.exports = router;