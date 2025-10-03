const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const RentalRequest = require('../../models/RentalRequest');
const isSellerLoggedin = require('../../middlewares/isSellerLoggedin');

// GET: Show update rental form
router.get('/update-rental/:id', isSellerLoggedin, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.redirect('/login');
    }
    
    const rental = await RentalRequest.findOne({
      _id: req.params.id,
      sellerId: req.user._id
    });
    
    if (!rental) {
      return res.redirect('/seller_dashboard/view-rentals');
    }
    
    // Check if current date is before return date
    const currentDate = new Date();
    const isBeforeReturnDate = rental.dropDate && currentDate < new Date(rental.dropDate);
    
    res.render('seller_dashboard/update-rental', {
      user,
      rental,
      error: null,
      success: null,
      isBeforeReturnDate
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).render('seller_dashboard/update-rental', {
      user: {},
      rental: null,
      error: 'Failed to load rental data',
      success: null,
      isBeforeReturnDate: false
    });
  }
});

// POST: Handle rental update
router.post('/update-rental/:id', isSellerLoggedin, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.redirect('/login');
    }
    
    const rental = await RentalRequest.findOne({
      _id: req.params.id,
      sellerId: req.user._id
    });
    
    if (!rental) {
      return res.redirect('/seller_dashboard/view-rentals');
    }
    
    // Check if current date is before return date
    const currentDate = new Date();
    const isBeforeReturnDate = rental.dropDate && currentDate < new Date(rental.dropDate);
    
    // If changing from unavailable to available when before return date, show error
    if (rental.status === 'unavailable' && req.body['status'] === 'available' && isBeforeReturnDate) {
      return res.render('seller_dashboard/update-rental', {
        user,
        rental,
        error: 'Cannot change status from unavailable to available before the return date',
        success: null,
        isBeforeReturnDate
      });
    }
    
    // Update fields
    rental.costPerDay = parseFloat(req.body['rental-cost']);
    rental.driverAvailable = req.body['driver-available'] === 'yes';
    rental.status = req.body['status'];
    
    if (rental.driverAvailable) {
      rental.driverRate = parseFloat(req.body['driver-rate']);
    } else {
      rental.driverRate = undefined;
    }
    
    await rental.save();
    
    res.render('seller_dashboard/update-rental', {
      user,
      rental,
      success: 'Rental updated successfully!',
      error: null,
      isBeforeReturnDate
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).render('seller_dashboard/update-rental', {
      user: {},
      rental: null,
      error: 'Failed to update rental',
      success: null,
      isBeforeReturnDate: false
    });
  }
});

module.exports = router;