// controllers/buyerControllers/purchaseController.js
const RentalCost = require('../../models/RentalCost');
const RentalRequest = require('../../models/RentalRequest');
const Purchase = require('../../models/Purchase');
const User = require('../../models/User');
const mongoose = require('mongoose');

// Controller for purchase page - display user's rentals and auction purchases
const getPurchase = async (req, res) => {
  try {
    const buyerId = req.user._id;
    const user = req.user;

    const rentalCosts = await RentalCost.find({ buyerId });
    
    const rentals = await Promise.all(rentalCosts.map(async (rentalCost) => {
      const rentalRequest = await RentalRequest.findById(rentalCost.rentalCarId);
      
      if (!rentalRequest) {
        return null;
      }
      
      const seller = await User.findById(rentalCost.sellerId);
      
      if (!seller) {
        return null;
      }
      
      return {
        investor_id: rentalRequest._id,
        vehicleName: rentalRequest.vehicleName,
        vehicleImage: rentalRequest.vehicleImage,
        costPerDay: rentalRequest.costPerDay,
        pickupDate: rentalRequest.pickupDate,
        dropDate: rentalRequest.dropDate,
        totalCost: rentalCost.totalCost,
        sellerName: `${seller.firstName} ${seller.lastName}`,
        sellerPhone: seller.phone
      };
    }));

    const validRentals = rentals.filter(rental => rental !== null);

    const auctionPurchases = await Purchase.find({ 
      buyerId
    });

    res.render('buyer_dashboard/purchase', { 
      rentals: validRentals, 
      auctionPurchases, 
      user 
    });
  } catch (err) {
    console.error('Error fetching purchase data:', err);
    res.status(500).render('buyer_dashboard/error.ejs', { 
      message: 'Failed to load purchase data',
      user: req.user || {}
    });
  }
};

// Controller for purchase details route for auction purchases
const getAuctionPurchaseDetails = async (req, res) => {
  try {
    const purchaseId = req.query.id;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(purchaseId)) {
      return res.status(400).render('buyer_dashboard/error.ejs', { 
        message: 'Invalid purchase ID',
        user
      });
    }

    const purchase = await Purchase.findById(purchaseId)
      .populate('sellerId', 'firstName lastName email phone city state')
      .populate('auctionId');
    
    if (!purchase) {
      return res.status(404).render('buyer_dashboard/error.ejs', { 
        message: 'Purchase not found',
        user
      });
    }

    if (purchase.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).render('buyer_dashboard/error.ejs', { 
        message: 'Unauthorized access to purchase details',
        user
      });
    }

    res.render('buyer_dashboard/purchase_details', { 
      purchase, 
      user 
    });
  } catch (err) {
    console.error('Error fetching purchase details:', err);
    res.status(500).render('buyer_dashboard/error.ejs', { 
      message: 'Failed to load purchase details',
      user: req.user || {}
    });
  }
};

// Controller for rental details route - show complete details for a specific rental
const getRentalDetails = async (req, res) => {
  try {
    const rentalId = req.params.id;
    const user = req.user;
    
    if (!mongoose.Types.ObjectId.isValid(rentalId)) {
      return res.status(400).render('buyer_dashboard/error.ejs', { 
        message: 'Invalid rental ID',
        user
      });
    }
    
    const rentalRequest = await RentalRequest.findById(rentalId);
    
    if (!rentalRequest) {
      return res.status(404).render('buyer_dashboard/error.ejs', { 
        message: 'Rental not found',
        user
      });
    }
    
    const rentalCost = await RentalCost.findOne({ rentalCarId: rentalId });
    
    if (!rentalCost) {
      return res.status(404).render('buyer_dashboard/error.ejs', { 
        message: 'Rental cost details not found',
        user
      });
    }
    
    const seller = await User.findById(rentalRequest.sellerId);
    
    if (!seller) {
      return res.status(404).render('buyer_dashboard/error.ejs', { 
        message: 'Seller details not found',
        user
      });
    }
    
    const rentalDetails = {
      vehicleName: rentalRequest.vehicleName,
      vehicleImage: rentalRequest.vehicleImage,
      year: rentalRequest.year,
      AC: rentalRequest.AC,
      capacity: rentalRequest.capacity,
      condition: rentalRequest.condition,
      fuelType: rentalRequest.fuelType,
      transmission: rentalRequest.transmission,
      costPerDay: rentalRequest.costPerDay,
      driverAvailable: rentalRequest.driverAvailable,
      driverRate: rentalRequest.driverRate,
      pickupDate: new Date(rentalRequest.pickupDate).toLocaleDateString(),
      dropDate: new Date(rentalRequest.dropDate).toLocaleDateString(),
      totalCost: rentalCost.totalCost,
      seller: {
        name: `${seller.firstName} ${seller.lastName}`,
        email: seller.email,
        phone: seller.phone,
        address: seller.doorNo && seller.street ? 
          `${seller.doorNo}, ${seller.street}, ${seller.city}, ${seller.state}` : 
          'Address not available'
      }
    };
    
    res.render('buyer_dashboard/rental_details', { rental: rentalDetails, user });
  } catch (err) {
    console.error('Error fetching rental details:', err);
    res.status(500).render('buyer_dashboard/error.ejs', { 
      message: 'Failed to load rental details',
      user: req.user || {}
    });
  }
};

module.exports = { 
  getPurchase, 
  getAuctionPurchaseDetails, 
  getRentalDetails 
};