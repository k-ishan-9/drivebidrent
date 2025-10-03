const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuctionRequest',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicleName: {
    type: String,
    required: true
  },
  vehicleImage: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  mileage: {
    type: Number,
    required: true
  },
  purchasePrice: {
    type: Number,
    required: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  sellerName: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  }
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
