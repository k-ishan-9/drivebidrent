const express = require('express');
const router = express.Router();
const AuctionRequest = require('../../models/AuctionRequest');
const isAuctionManager = require('../../middlewares/isAuctionManager');

// Display pending cars
router.get('/pending', isAuctionManager, async (req, res) => {
  try {
    const pendingCars = await AuctionRequest.find({ 
      status: 'assignedMechanic' 
    }).populate('sellerId');
    
    res.render('auctionmanager/pending', { pendingCars });
  } catch (err) {
    console.error(err);
    res.render('auctionmanager/pending', { pendingCars: [] });
  }
});

// Get review data for modal
router.get('/get-review/:id', isAuctionManager, async (req, res) => {
  try {
    const car = await AuctionRequest.findById(req.params.id)
      .populate('assignedMechanic', 'firstName lastName');
    
    if (!car.mechanicReview) {
      return res.json({ reviewStatus: car.reviewStatus || 'pending' });
    }

    res.json({
      ...car.mechanicReview,
      reviewStatus: car.reviewStatus,
      mechanicName: car.assignedMechanic ? 
        `${car.assignedMechanic.firstName} ${car.assignedMechanic.lastName}` : 
        'Unknown Mechanic'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching review' });
  }
});

// Update car status
router.post('/update-status/:id', isAuctionManager, async (req, res) => {
  try {
    const { status } = req.body;
    const car = await AuctionRequest.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    // Prevent approval or rejection if reviewStatus is 'pending'
    if (status === 'approved' || status === 'rejected') {
      if (car.reviewStatus === 'pending') {
        return res.status(400).json({ error: 'Cannot approve or reject car until mechanic review is completed' });
      }
    }

    // Prevent approval if mechanicReview is empty or missing required fields
    if (status === 'approved') {
      if (!car.mechanicReview || 
          !car.mechanicReview.mechanicalCondition || 
          !car.mechanicReview.bodyCondition) {
        return res.status(400).json({ error: 'Cannot approve car without a complete mechanic review' });
      }
    }

    const updatedCar = await AuctionRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json({ success: true, status: updatedCar.status });
  } catch (err) {
    console.error('Error updating car status:', err);
    res.status(500).json({ error: 'Failed to update car status' });
  }
});

// Get car details for pending-car-details page
router.get('/pending-car-details/:id', isAuctionManager, async (req, res) => {
  try {
    const car = await AuctionRequest.findById(req.params.id)
      .populate('assignedMechanic', 'firstName lastName');

    if (!car) {
      return res.status(404).render('auctionmanager/pending-car-details', { car: null, error: 'Car not found' });
    }

    res.render('auctionmanager/pending-car-details', { car });
  } catch (err) {
    console.error(err);
    res.render('auctionmanager/pending-car-details', { car: null, error: 'Error fetching car details' });
  }
});

module.exports = router;