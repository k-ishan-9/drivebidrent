const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const RentalRequest = require('../../models/RentalRequest');
const isSellerLoggedin = require('../../middlewares/isSellerLoggedin');
// GET: Show add rental page
router.get('/add-rental', isSellerLoggedin, async (req, res) => {
  try {
    const user = req.user;
    res.render('seller_dashboard/add-rental', {
      user,
      formData: {},
      error: null,
      success: null
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).render('seller_dashboard/add-rental', {
      user: {},
      error: 'Failed to load page',
      formData: {},
      success: null
    });
  }
});

// POST: Handle rental submission
router.post('/add-rental', isSellerLoggedin, async (req, res) => {
  console.log('Request Body:', req.body); // Debug log
  
  try {
    // Validate required fields
    const requiredFields = [
      'vehicle-name', 
      'vehicle-image',
      'vehicle-year',
      'vehicle-ac',
      'vehicle-capacity',
      'vehicle-condition',
      'vehicle-fuel-type',
      'vehicle-transmission',
      'rental-cost',
      'driver-available'
    ];
    
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.render('seller_dashboard/add-rental', {
        user: req.user,
        formData: req.body,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        success: null
      });
    }

    // Add additional validation for driver rate if driver is available
    if (req.body['driver-available'] === 'yes' && !req.body['driver-rate']) {
      return res.render('seller_dashboard/add-rental', {
        user: req.user,
        formData: req.body,
        error: 'Driver rate is required when driver is available',
        success: null
      });
    }

    // Create new rental
    const newRental = new RentalRequest({
      vehicleName: req.body['vehicle-name'],
      vehicleImage: req.body['vehicle-image'],
      year: parseInt(req.body['vehicle-year']),
      AC: req.body['vehicle-ac'],
      capacity: parseInt(req.body['vehicle-capacity']),
      condition: req.body['vehicle-condition'],
      fuelType: req.body['vehicle-fuel-type'],
      transmission: req.body['vehicle-transmission'],
      costPerDay: parseFloat(req.body['rental-cost']),
      driverAvailable: req.body['driver-available'] === 'yes',
      driverRate: req.body['driver-available'] === 'yes' ? parseFloat(req.body['driver-rate']) : undefined,
      sellerId: req.user._id,
      status: 'available'
    });

    // Save to database
    const savedRental = await newRental.save();
    console.log('Saved Rental:', savedRental); // Debug log

    // Return success message
    return res.render('seller_dashboard/add-rental', {
      user: req.user,
      formData: {},
      success: 'Rental added successfully!',
      error: null
    });

  } catch (err) {
    console.error('Save Error:', err);
    return res.status(500).render('seller_dashboard/add-rental', {
      user: req.user,
      formData: req.body,
      error: 'Error saving rental: ' + err.message,
      success: null
    });
  }
});

module.exports = router;