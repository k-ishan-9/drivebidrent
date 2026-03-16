// controllers/buyerControllers/rentalsController.js
const RentalRequest = require('../../models/RentalRequest');
const RentalCost = require('../../models/RentalCost');
const User = require('../../models/User');
const mongoose = require('mongoose');

// Controller for all rentals page with search/filter
const getRentals = async (req, res) => {
  try {
    const { search, fuelType, transmission, minPrice, maxPrice, capacity, city } = req.query;
    const query = { status: 'available' };

    if (search) {
      query.vehicleName = { $regex: search, $options: 'i' };
    }

    if (fuelType) {
      query.fuelType = fuelType;
    }

    if (transmission) {
      query.transmission = transmission;
    }

    if (minPrice || maxPrice) {
      query.costPerDay = {};
      if (minPrice) query.costPerDay.$gte = parseFloat(minPrice);
      if (maxPrice) query.costPerDay.$lte = parseFloat(maxPrice);
    }

    if (capacity) {
      query.capacity = { $gte: parseInt(capacity) };
    }

    let rentals = await RentalRequest.find(query)
      .populate('sellerId', 'firstName lastName email phone city state')
      .exec();

    if (city) {
      rentals = rentals.filter(rental => rental.sellerId && rental.sellerId.city && rental.sellerId.city.toLowerCase() === city.toLowerCase());
    }

    const sellersWithRentals = await RentalRequest.find({ status: 'available' })
      .populate('sellerId', 'city')
      .exec();
    
    const uniqueCities = [...new Set(
      sellersWithRentals
        .filter(rental => rental.sellerId && rental.sellerId.city)
        .map(rental => rental.sellerId.city)
    )].sort();

    res.render('buyer_dashboard/rentals.ejs', {
      rentals,
      user: req.user,
      searchQuery: search,
      fuelType,
      transmission,
      minPrice,
      maxPrice,
      capacity,
      city,
      uniqueCities
    });
  } catch (err) {
    console.error('Error fetching rentals:', err);
    res.status(500).render('buyer_dashboard/error.ejs', {
      user: req.user || {},
      message: 'An error occurred while loading rentals'
    });
  }
};

// Controller for single rental view
const getSingleRental = async (req, res) => {
  try {
    const rental = await RentalRequest.findById(req.query.id)
      .populate('sellerId', 'firstName lastName email phone city state')
      .exec();

    if (!rental) {
      return res.status(404).render('buyer_dashboard/error.ejs', {
        user: req.user,
        message: 'Rental not found'
      });
    }

    res.render('buyer_dashboard/rental.ejs', {
      rentalId: rental._id,
      vehicleName: rental.vehicleName,
      vehicleImage: rental.vehicleImage,
      year: rental.year,
      condition: rental.condition,
      capacity: rental.capacity,
      fuelType: rental.fuelType,
      transmission: rental.transmission,
      AC: rental.AC,
      costPerDay: rental.costPerDay,
      driverAvailable: rental.driverAvailable,
      driverRate: rental.driverRate,
      seller: rental.sellerId,
      user: req.user
    });
  } catch (err) {
    console.error('Error fetching single rental:', err);
    res.status(500).render('buyer_dashboard/error.ejs', {
      user: req.user || {},
      message: 'An error occurred while loading the rental'
    });
  }
};

// Controller to save rental dates in RentalRequest and cost in RentalCost
const bookRental = async (req, res) => {
  try {
    const { rentalCarId, sellerId, pickupDate, dropDate, totalCost, includeDriver } = req.body;
    const buyerId = req.user._id;

    if (!rentalCarId || !buyerId || !sellerId || !pickupDate || !dropDate || !totalCost) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const rentalRequest = await RentalRequest.findById(rentalCarId);
    if (!rentalRequest) {
      return res.status(404).json({ success: false, error: 'Rental request not found' });
    }

    const updatedRentalRequest = await RentalRequest.findByIdAndUpdate(
      rentalCarId,
      {
        buyerId,
        pickupDate,
        dropDate,
        includeDriver: includeDriver || false,
        status: 'unavailable'
      },
      { new: true }
    );

    const rentalCost = new RentalCost({
      rentalCarId,
      buyerId,
      sellerId,
      totalCost,
      includeDriver: includeDriver || false
    });

    const savedRentalCost = await rentalCost.save();

    res.json({ success: true, message: 'Rental booked successfully', rentalRequest: updatedRentalRequest, rentalCost: totalCost});  } catch (err) {
    console.error('Error in POST /rental:', err);
    res.status(500).json({ success: false, error: 'Failed to save rental details: ' + err.message });
  }
};

module.exports = { 
  getRentals, 
  getSingleRental, 
  bookRental 
};