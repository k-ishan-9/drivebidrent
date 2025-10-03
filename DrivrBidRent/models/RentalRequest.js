const mongoose = require('mongoose');

const RentalRequestSchema = new mongoose.Schema({
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
  AC: {
    type: String,
    enum: ['available', 'not'],
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair'],
    required: true
  },
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel'],
    required: true
  },
  transmission: {
    type: String,
    enum: ['automatic', 'manual'],
    required: true
  },
  costPerDay: {
    type: Number,
    required: true
  },
  driverAvailable: {
    type: Boolean,
    required: true
  },
  driverRate: {
    type: Number,
    required: function() { return this.driverAvailable === true; }
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pickupDate: {
    type: Date
  },
  dropDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('RentalRequest', RentalRequestSchema);