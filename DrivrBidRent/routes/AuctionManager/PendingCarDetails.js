const express = require('express');
const router = express.Router();
const AuctionRequest = require('../../models/AuctionRequest');
const isAuctionManager = require('../../middlewares/isAuctionManager');

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