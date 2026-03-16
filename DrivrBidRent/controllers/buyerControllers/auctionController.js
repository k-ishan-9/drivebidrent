// controllers/auctionController.js
const AuctionBid = require('../models/AuctionBid');
const AuctionRequest = require('../models/AuctionRequest');

const endAuctionAndNotifyWinner = async (auctionId) => {
  try {
    const auction = await AuctionRequest.findById(auctionId);
    if (!auction) {
      throw new Error('Auction not found');
    }

    // Get the winning bid (current highest bid)
    const winningBid = await AuctionBid.findOne({
      auctionId: auctionId,
      isCurrentBid: true
    });

    if (!winningBid) {
      throw new Error('No winning bid found for this auction');
    }

    // Notify the winner
    await AuctionBid.notifyAuctionWinner(auctionId, winningBid.buyerId);

    // Update auction status
    auction.auction_status = 'completed';
    await auction.save();

    return { success: true, winnerId: winningBid.buyerId };
  } catch (error) {
    console.error('Error ending auction:', error);
    throw error;
  }
};

module.exports = {
  endAuctionAndNotifyWinner
};