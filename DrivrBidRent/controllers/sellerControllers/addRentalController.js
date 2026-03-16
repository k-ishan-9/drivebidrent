// controllers/sellerControllers/addRentalController.js
const RentalRequest = require('../../models/RentalRequest');

// Controller for GET: Show add rental page
const getAddRental = async (req, res) => {
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
};

// Controller for POST: Handle rental submission
const postAddRental = async (req, res) => {
  console.log('Request Body:', req.body); // Debug log
  
  // Check if a file was successfully uploaded
  if (!req.file) {
    return res.status(400).json({ 
      success: false,
      message: 'Vehicle image upload failed or is missing.'
    });
  }

  try {
    // Validate required fields
    const requiredFields = [
      'vehicle-name', 
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
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Add additional validation for driver rate if driver is available
    if (req.body['driver-available'] === 'yes' && !req.body['driver-rate']) {
      return res.status(400).json({
        success: false,
        message: 'Driver rate is required when driver is available'
      });
    }

    // Create new rental
    const newRental = new RentalRequest({
      vehicleName: req.body['vehicle-name'],
      // Use the Cloudinary URL from req.file.path
      vehicleImage: req.file.path, 
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

    // Return JSON with redirect info on success
    return res.json({
      success: true,
      message: 'Rental Request Submitted',
      redirect: '/seller_dashboard/view-rentals'
    });

  } catch (err) {
    console.error('Save Error:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Error saving rental: ' + err.message
    });
  }
};

module.exports = { getAddRental, postAddRental };