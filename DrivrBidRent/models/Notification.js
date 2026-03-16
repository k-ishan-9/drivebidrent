const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['outbid', 'auction_ended', 'auction_won', 'new_auction']
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuctionRequest'
  },
  relatedBidId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuctionBid'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;