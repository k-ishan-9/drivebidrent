// controllers/sellerControllers/profileController.js
const User = require('../../models/User');
const RentalCost = require('../../models/RentalCost');
const RentalRequest = require('../../models/RentalRequest');
const AuctionRequest = require('../../models/AuctionRequest');
const AuctionBid = require('../../models/AuctionBid');

// Controller for GET: Show seller profile page
const getProfile = async (req, res) => {
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
      description: `${cost.rentalCarId?.vehicleName || 'Rental'} (Rental Booking)`,
      createdAt: cost.createdAt
    }));

    const recentTransactions = [...recentRentalEarnings, ...auctionEarnings]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.render('seller_dashboard/profile', {
      user,
      auctionsCount,
      rentalsCount,
      totalEarnings,
      totalRentalEarnings,
      totalAuctionEarnings,
      recentTransactions,
      rentalEarnings: rentalCosts
    });
  } catch (error) {
    console.error('Error fetching profile data:', error);
    res.status(500).render('seller_dashboard/profile', {
      user: req.user || {},
      auctionsCount: 0,
      rentalsCount: 0,
      totalEarnings: 0,
      totalRentalEarnings: 0,
      totalAuctionEarnings: 0,
      recentTransactions: [],
      rentalEarnings: [],
      error: 'Failed to load profile data'
    });
  }
};

// Controller for POST: Update profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, dateOfBirth, doorNo, street, city, state } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !phone) {
      return res.status(400).json({ success: false, message: 'First name, last name, and phone are required' });
    }

    // Validate phone number format
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Phone number must be 10 digits' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        firstName,
        lastName,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        doorNo,
        street,
        city,
        state
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update req.user to reflect changes (for session)
    req.user.firstName = firstName;
    req.user.lastName = lastName;
    req.user.phone = phone;
    req.user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : undefined;
    req.user.doorNo = doorNo;
    req.user.street = street;
    req.user.city = city;
    req.user.state = state;

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ success: false, message: 'An error occurred while updating profile' });
  }
};

// Controller for POST: Update notification preferences
const updatePreferences = async (req, res) => {
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
};

// Controller for POST: Change password
const changePassword = async (req, res) => {
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
};

module.exports = { 
  getProfile, 
  updateProfile, 
  updatePreferences, 
  changePassword 
};