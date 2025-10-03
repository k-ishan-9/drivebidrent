const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const RentalRequest = require('../../models/RentalRequest');
const isSellerLoggedin = require('../../middlewares/isSellerLoggedin');

router.get('/view-rentals', isSellerLoggedin, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.redirect('/login');
    }
    
    // Fetch rentals for this seller from the database
    const rentals = await RentalRequest.find({ sellerId: req.user._id });
    
    // Process rentals to include the seller's city as location
    const processedRentals = rentals.map(rental => {
      return {
        ...rental._doc,
        location: user.city || 'City not specified'
      };
    });
    
    res.render('seller_dashboard/view-rentals', { 
      user,
      rentals: processedRentals,
      error: null
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).render('seller_dashboard/view-rentals', { 
      user: {},
      rentals: [],
      error: 'Failed to load rental listings' 
    });
  }
});

// Toggle rental availability
router.post('/toggle-rental-status/:id', isSellerLoggedin, async (req, res) => {
  try {
    const rentalId = req.params.id;
    const rental = await RentalRequest.findById(rentalId);
    
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }
    
    // Check if the rental belongs to the logged-in seller
    if (rental.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    // Toggle the status
    rental.status = rental.status === 'available' ? 'unavailable' : 'available';
    await rental.save();
    
    return res.json({ success: true, newStatus: rental.status });
  } catch (err) {
    console.error('Error toggling status:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;