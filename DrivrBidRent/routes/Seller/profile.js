const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const RentalCost = require('../../models/RentalCost');
const RentalRequest = require('../../models/RentalRequest');
const AuctionRequest = require('../../models/AuctionRequest');
const AuctionBid = require('../../models/AuctionBid');
const isSellerLoggedin = require('../../middlewares/isSellerLoggedin');
// GET: Show seller profile page
router.get('/profile', isSellerLoggedin, async (req, res) => {
  try {
    const user = req.user;
    
    // Fetch active auctions count (status 'approved' or 'assignedMechanic' and not ended)
    const auctionsCount = await AuctionRequest.countDocuments({
      sellerId: user._id,
      status: { $in: ['approved', 'assignedMechanic'] },
      started_auction: { $ne: 'ended' }
    });

    // Fetch active rentals count (status 'available' or 'booked')
    const rentalsCount = await RentalRequest.countDocuments({
      sellerId: user._id,
      status: { $in: ['available', 'booked'] }
    });

    // Fetch rental earnings (only completed rentals)
    const rentalCosts = await RentalCost.find({ sellerId: user._id })
      .populate({
        path: 'rentalCarId',
        select: 'vehicleName createdAt'
      })
      .sort({ createdAt: -1 })
      .lean();

    // Calculate total earnings from rentals
    const totalRentalEarnings = rentalCosts.reduce((sum, cost) => sum + (cost.totalCost || 0), 0);

    // Fetch only ended auctions for earnings
    const auctions = await AuctionRequest.find({
      sellerId: user._id,
      started_auction: 'ended'
    }).lean();

    // Calculate total earnings from auctions (only ended auctions with final purchase price)
    let totalAuctionEarnings = 0;
    const auctionEarnings = [];

    for (const auction of auctions) {
      if (auction.finalPurchasePrice) {
        totalAuctionEarnings += auction.finalPurchasePrice;
        auctionEarnings.push({
          amount: auction.finalPurchasePrice,
          description: `${auction.vehicleName} (Auction Final Sale)`,
          createdAt: auction.updatedAt
        });
      }
    }

    // Combine total earnings
    const totalEarnings = totalRentalEarnings + totalAuctionEarnings;

    // Format recent transactions (rentals + ended auctions)
    const recentRentalEarnings = rentalCosts.map(cost => ({
      amount: cost.totalCost,
      description: `${cost.rentalCarId ? cost.rentalCarId.vehicleName : 'Unknown Vehicle'} (Rental)`,
      createdAt: cost.createdAt
    }));

    const recentTransactions = [...recentRentalEarnings, ...auctionEarnings]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);

    res.render('seller_dashboard/profile.ejs', { 
      user,
      auctionsCount,
      rentalsCount,
      totalEarnings,
      recentTransactions
    });
  } catch (err) {
    console.error(err);
    res.render('seller_dashboard/profile.ejs', { 
      user: {}, 
      error: 'Failed to load user data',
      auctionsCount: 0,
      rentalsCount: 0,
      totalEarnings: 0,
      recentTransactions: []
    });
  }
});

// Route to update seller profile information
router.post('/update-profile', isSellerLoggedin, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, doorNo, street, city, state } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    // Validate phone number
    if (!phone.match(/^\d{10}$/)) {
      return res.status(400).json({ success: false, message: 'Phone number must be 10 digits' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    // Check if email is already in use by another user
    const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    // Update user data
    const updatedData = {
      firstName,
      lastName,
      email,
      phone,
      doorNo: doorNo || '',
      street: street || '',
      city: city || '',
      state: state || ''
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updatedData },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ success: false, message: 'An error occurred while updating your profile' });
  }
});

// Route to update preferences
router.post('/update-preferences', isSellerLoggedin, async (req, res) => {
  try {
    const { notificationPreference } = req.body;

    // Validate notification preference
    const validPreferences = ['all', 'important', 'none'];
    if (!notificationPreference || !validPreferences.includes(notificationPreference)) {
      return res.status(400).json({ success: false, message: 'Invalid notification preference' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { notificationPreference } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'Preferences updated successfully' });
  } catch (err) {
    console.error('Error updating preferences:', err);
    res.status(500).json({ success: false, message: 'An error occurred while updating preferences' });
  }
});

// Route to change password
router.post('/change-password', isSellerLoggedin, async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Validate required fields
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All password fields are required' });
    }

    // Validate new password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New password and confirmation do not match' });
    }

    // Validate new password length
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify old password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect old password' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ success: false, message: 'An error occurred while changing your password' });
  }
});

module.exports = router;