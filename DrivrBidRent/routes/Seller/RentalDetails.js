const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const RentalRequest = require('../../models/RentalRequest');
const RentalCost = require('../../models/RentalCost');
const isSellerLoggedin = require('../../middlewares/isSellerLoggedin');

// GET: Show rental details page
router.get('/rental-details/:id', isSellerLoggedin, async (req, res) => {
  try {
    const user = req.user;
    
    const rental = await RentalRequest.findOne({
      _id: req.params.id,
      sellerId: user._id
    })
    .populate('buyerId', 'firstName lastName email phone'); // Populate buyerId with specific fields
    
    if (!rental) {
      return res.redirect('/seller_dashboard/view-rentals');
    }
    
    // Fetch the rental cost to get the total money received
    const rentalCost = await RentalCost.findOne({ rentalCarId: rental._id });
    const moneyReceived = rentalCost ? rentalCost.totalCost : null;

    // Format dates for display
    const formattedPickupDate = rental.pickupDate ? rental.pickupDate.toISOString().split('T')[0] : 'Not specified';
    const formattedDropDate = rental.dropDate ? rental.dropDate.toISOString().split('T')[0] : 'Not specified';

    res.render('seller_dashboard/rental-details', { 
      user,
      rental,
      formattedPickupDate,
      formattedDropDate,
      moneyReceived,
      error: null
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).render('seller_dashboard/rental-details', { 
      user: {},
      rental: null,
      error: 'Failed to load rental details'
    });
  }
});

module.exports = router;