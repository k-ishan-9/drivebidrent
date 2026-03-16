// controllers/buyerControllers/wishlistController.js
const Wishlist = require('../../models/Wishlist');
const RentalRequest = require('../../models/RentalRequest');
const AuctionRequest = require('../../models/AuctionRequest');

// Controller for wishlist view
const getWishlist = async (req, res) => {
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
      status: 'approved',
      started_auction: 'yes'
    }).populate('sellerId', 'firstName lastName');
    
    res.render('buyer_dashboard/wishlist', { 
      user: req.user, 
      auctionWishlist,
      rentalWishlist
    });
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    res.status(500).render('buyer_dashboard/error.ejs', {
      user: req.user || {},
      message: 'Failed to load wishlist data'
    });
  }
};

// Controller for getting wishlist items via API
const getWishlistApi = async (req, res) => {
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
};

// Controller for adding to wishlist via API
const addToWishlistApi = async (req, res) => {
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
      const auction = await AuctionRequest.findById(auctionId);
      if (!auction) {
        return res.status(404).json({
          success: false,
          message: 'Auction not found'
        });
      }
      
      if (!wishlist.auctions.includes(auctionId)) {
        wishlist.auctions.push(auctionId);
      }
    }
    
    await wishlist.save();
    
    res.json({
      success: true,
      message: 'Item added to wishlist'
    });
  } catch (err) {
    console.error('Error adding to wishlist:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update wishlist'
    });
  }
};

// Controller for removing from wishlist via API
const removeFromWishlistApi = async (req, res) => {
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
      message: 'Item removed from wishlist'
    });
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from wishlist'
    });
  }
};

module.exports = { 
  getWishlist, 
  getWishlistApi, 
  addToWishlistApi, 
  removeFromWishlistApi 
};