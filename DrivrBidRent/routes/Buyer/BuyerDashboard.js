const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const RentalRequest = require('../../models/RentalRequest');
const AuctionRequest = require('../../models/AuctionRequest');
const AuctionBid = require('../../models/AuctionBid');
const Wishlist = require('../../models/Wishlist');
const bcrypt = require('bcrypt');
const isBuyerLoggedin=require('../../middlewares/isBuyerLoggedin');

// Main dashboard route
router.get('/buyer_dashboard', isBuyerLoggedin, async (req, res) => {
  try {
    const user = req.user;
    const page = req.query.page || 'dashboard';

    // Dashboard home with featured listings
    if (page === 'dashboard') {
      const featuredRentals = await RentalRequest.find({ status: 'available' })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('sellerId', 'firstName lastName')
        .exec();

      const featuredAuctions = await AuctionRequest.find({ 
        status: 'approved', 
        started_auction: 'yes'
      })
        .sort({ auctionDate: 1 })
        .limit(3)
        .populate('sellerId', 'firstName lastName')
        .exec();

      return res.render('buyer_dashboard/proj.ejs', {
        featuredRentals,
        featuredAuctions,
        user,
        error: null,
        success: null
      });
    }

    // All auctions page with search/filter
    if (page === 'auctions') {
      const { search, condition, fuelType, transmission, minPrice, maxPrice } = req.query;
      const query = { 
        status: 'approved', 
        started_auction: 'yes'
      };

      if (search) {
        query.vehicleName = { $regex: search, $options: 'i' };
      }

      if (condition) {
        query.condition = condition;
      }

      if (fuelType) {
        query.fuelType = fuelType;
      }

      if (transmission) {
        query.transmission = transmission;
      }

      if (minPrice || maxPrice) {
        query.startingBid = {};
        if (minPrice) query.startingBid.$gte = parseFloat(minPrice);
        if (maxPrice) query.startingBid.$lte = parseFloat(maxPrice);
      }

      const auctions = await AuctionRequest.find(query)
        .sort({ auctionDate: 1 })
        .populate('sellerId', 'firstName lastName email phone city state')
        .exec();

      return res.render('buyer_dashboard/auctions.ejs', {
        auctions,
        user,
        search,
        condition,
        fuelType,
        transmission,
        minPrice,
        maxPrice
      });
    }

    // All rentals page with search/filter
    if (page === 'rentals') {
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

      return res.render('buyer_dashboard/rentals.ejs', {
        rentals,
        user,
        searchQuery: search,
        fuelType,
        transmission,
        minPrice,
        maxPrice,
        capacity,
        city,
        uniqueCities
      });
    }

    // Wishlist page
    if (page === 'wishlist') {
      try {
        let wishlist = await Wishlist.findOne({ userId: req.user._id });
        
        if (!wishlist) {
          wishlist = new Wishlist({
            userId: req.user._id,
            auctions: [],
            rentals: []
          });
          await wishlist.save();
        }
        
        const rentalWishlist = await RentalRequest.find({
          _id: { $in: wishlist.rentals || [] }
        }).populate('sellerId', 'firstName lastName');
        
        const auctionWishlist = await AuctionRequest.find({
          _id: { $in: wishlist.auctions || [] },
          started_auction: 'yes'
        }).populate('sellerId', 'firstName lastName');
        
        return res.render('buyer_dashboard/wishlist', { 
          user, 
          auctionWishlist,
          rentalWishlist
        });
      } catch (err) {
        console.error('Error fetching wishlist:', err);
        return res.status(500).render('buyer_dashboard/error', {
          user,
          message: 'Failed to load wishlist data: ' + err.message
        });
      }
    }

    // Single rental view
    if (page === 'rental' && req.query.id) {
      const rental = await RentalRequest.findById(req.query.id)
        .populate('sellerId', 'firstName lastName email phone city state')
        .exec();

      if (!rental) {
        return res.status(404).render('buyer_dashboard/error.ejs', {
          user,
          message: 'Rental not found'
        });
      }

      return res.render('buyer_dashboard/rental.ejs', {
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
        user
      });
    }

    // Single auction view
    if (page === 'auction' && req.query.id) {
      const auction = await AuctionRequest.findOne({ 
        _id: req.query.id,
        started_auction: 'yes'
      })
        .populate('sellerId', 'firstName lastName email phone city state')
        .exec();

      if (!auction) {
        return res.status(404).render('buyer_dashboard/error.ejs', {
          user,
          message: 'Auction not found or has ended'
        });
      }

      const currentBid = await AuctionBid.findOne({ auctionId: req.query.id, isCurrentBid: true })
        .sort({ bidTime: -1 });

      const isCurrentBidder = currentBid && req.user._id.toString() === currentBid.buyerId.toString();

      return res.render('buyer_dashboard/auction.ejs', {
        auction,
        currentBid,
        isLoggedIn: !!req.user,
        isCurrentBidder,
        user
      });
    }

  } catch (err) {
    console.error('Error in buyer_dashboard route:', err);
    return res.status(500).render('buyer_dashboard/error.ejs', {
      user: req.user || {},
      message: 'An error occurred while loading the dashboard'
    });
  }
});

// Route to handle bid placement
router.post('/auction/place-bid', isBuyerLoggedin, async (req, res) => {
  try {
    const { auctionId, bidAmount } = req.body;
    const buyerId = req.user._id;

    if (!auctionId || !bidAmount) {
      return res.status(400).json({ success: false, message: 'Auction ID and bid amount are required' });
    }

    const bidValue = parseFloat(bidAmount);
    if (isNaN(bidValue) || bidValue <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid bid amount' });
    }

    const auction = await AuctionRequest.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    if (auction.started_auction !== 'yes' || auction.auction_stopped) {
      return res.status(400).json({ success: false, message: 'Auction is not active or has been stopped' });
    }

    const currentBid = await AuctionBid.findOne({ auctionId, isCurrentBid: true })
      .sort({ bidTime: -1 });

    if (currentBid && currentBid.buyerId.toString() === buyerId.toString()) {
      return res.status(400).json({ success: false, message: 'You already have the current bid' });
    }

    const minBid = currentBid ? currentBid.bidAmount + 2000 : auction.startingBid;
    if (bidValue < minBid) {
      return res.status(400).json({ 
        success: false, 
        message: `Your bid must be at least ₹${minBid.toLocaleString()}` 
      });
    }

    const newBid = new AuctionBid({
      auctionId,
      sellerId: auction.sellerId,
      buyerId,
      bidAmount: bidValue,
      isCurrentBid: true
    });

    await newBid.save();

    return res.json({ success: true, message: 'Bid placed successfully' });
  } catch (error) {
    console.error('Error placing bid:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// API to get wishlist items
router.get('/api/wishlist', isBuyerLoggedin, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user._id });
    
    if (!wishlist) {
      wishlist = new Wishlist({
        userId: req.user._id,
        auctions: [],
        rentals: []
      });
      await wishlist.save();
    }
    
    res.json({
      success: true,
      wishlist: {
        auctions: wishlist.auctions || [],
        rentals: wishlist.rentals || []
      }
    });
  } catch (err) {
    console.error('Error fetching wishlist data:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve wishlist'
    });
  }
});

// API to add to wishlist
router.post('/api/wishlist', isBuyerLoggedin, async (req, res) => {
  try {
    const { rentalId, auctionId, type } = req.body;
    
    if (!type || (type === 'rental' && !rentalId) || (type === 'auction' && !auctionId)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    let wishlist = await Wishlist.findOne({ userId: req.user._id });
    
    if (!wishlist) {
      wishlist = new Wishlist({
        userId: req.user._id,
        auctions: [],
        rentals: []
      });
    }
    
    if (type === 'rental' && rentalId) {
      const rental = await RentalRequest.findById(rentalId);
      if (!rental) {
        return res.status(404).json({
          success: false,
          message: 'Rental not found'
        });
      }
      
      if (!wishlist.rentals.includes(rentalId)) {
        wishlist.rentals.push(rentalId);
      }
    } else if (type === 'auction' && auctionId) {
      const auction = await AuctionRequest.findOne({ 
        _id: auctionId,
        started_auction: 'yes'
      });
      if (!auction) {
        return res.status(404).json({
          success: false,
          message: 'Auction not found or has ended'
        });
      }
      
      if (!wishlist.auctions.includes(auctionId)) {
        wishlist.auctions.push(auctionId);
      }
    }
    
    await wishlist.save();
    
    res.json({
      success: true,
      message: 'Item added to wishlist',
      wishlist: {
        auctions: wishlist.auctions,
        rentals: wishlist.rentals
      }
    });
  } catch (err) {
    console.error('Error adding to wishlist:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update wishlist'
    });
  }
});

// API to remove from wishlist
router.delete('/api/wishlist', isBuyerLoggedin, async (req, res) => {
  try {
    const { rentalId, auctionId, type } = req.body;
    
    if (!type || (type === 'rental' && !rentalId) || (type === 'auction' && !auctionId)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    const wishlist = await Wishlist.findOne({ userId: req.user._id });
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }
    
    if (type === 'rental' && rentalId) {
      wishlist.rentals = wishlist.rentals.filter(id => id.toString() !== rentalId);
    } else if (type === 'auction' && auctionId) {
      wishlist.auctions = wishlist.auctions.filter(id => id.toString() !== auctionId);
    }
    
    await wishlist.save();
    
    res.json({
      success: true,
      message: 'Item removed from wishlist',
      wishlist: {
        auctions: wishlist.auctions,
        rentals: wishlist.rentals
      }
    });
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove from wishlist'
    });
  }
});

module.exports = router;