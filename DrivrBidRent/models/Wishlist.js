const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  auctions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction'  // Reference to future Auction model
  }],
  rentals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RentalRequest'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
WishlistSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Wishlist', WishlistSchema);