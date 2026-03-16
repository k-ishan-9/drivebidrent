// controllers/auctionManager/dashboard.controller.js
import AuctionRequest from '../../models/AuctionRequest.js';

const send = (success, message, data = null) => ({
  success,
  message,
  data
});

export const getDashboard = async (req, res) => {
  try {
    console.log('📊 [getDashboard] Fetching dashboard for auction manager:', req.user._id);
    
    // Get all pending requests (available for assignment)
    const pending = await AuctionRequest.find({ status: 'pending' })
      .populate('sellerId', 'firstName lastName city')
      .sort({ createdAt: -1 })
      .limit(3);

    // Get only THIS manager's assigned (pending inspection) cars
    const assigned = await AuctionRequest.find({ 
      status: 'assignedMechanic',
      assignedAuctionManager: req.user._id
    })
      .populate('sellerId', 'firstName lastName city')
      .sort({ createdAt: -1 })
      .limit(3);

    // Get only THIS manager's approved cars
    const approved = await AuctionRequest.find({ 
      status: 'approved',
      assignedAuctionManager: req.user._id
    })
      .populate('sellerId', 'firstName lastName city')
      .sort({ createdAt: -1 })
      .limit(3);

    console.log('📊 [getDashboard] Results:', {
      pending: pending.length,
      assigned: assigned.length,
      approved: approved.length
    });

    res.json(send(true, 'Dashboard data fetched', { pending, assigned, approved }));
  } catch (err) {
    console.error('❌ [getDashboard] Error:', err);
    res.json(send(false, 'Failed to load dashboard'));
  }
};