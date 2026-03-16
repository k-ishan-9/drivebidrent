// models/RentalCost.js
import mongoose from 'mongoose';

const RentalCostSchema = new mongoose.Schema({
  rentalCarId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RentalRequest',
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
  totalCost: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('RentalCost', RentalCostSchema);