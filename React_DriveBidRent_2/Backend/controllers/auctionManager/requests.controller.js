// controllers/auctionManager/requests.controller.js
import AuctionRequest from '../../models/AuctionRequest.js';

const send = (success, message, data = null) => ({
  success,
  message,
  data
});

export const getRequests = async (req, res) => {
  try {
    console.log('📋 [getRequests] ========================================');
    console.log('📋 [getRequests] Fetching ALL pending requests visible to all auction managers');
    console.log('📋 [getRequests] Requesting auction manager:', req.user._id);
    
    const requests = await AuctionRequest.find({ status: 'pending' })
      .populate('sellerId', 'firstName lastName city email')
      .sort({ createdAt: -1 });

    console.log('✅ [getRequests] Found', requests.length, 'pending requests (available for ANY manager to assign)');
    if (requests.length > 0) {
      console.log('📋 [getRequests] Request IDs:', requests.map(r => ({
        id: r._id.toString(),
        vehicle: r.vehicleName,
        seller: `${r.sellerId.firstName} ${r.sellerId.lastName}`,
        assignedManager: r.assignedAuctionManager || 'None'
      })));
    }
    console.log('📋 [getRequests] ========================================');
    
    res.json(send(true, 'Requests fetched', requests));
  } catch (err) {
    console.error('❌ [getRequests] Error:', err);
    res.json(send(false, 'Failed to load requests'));
  }
};

// Migration endpoint to fix existing data (call this once)
export const migrateExistingAssignments = async (req, res) => {
  try {
    console.log('🔄 [MIGRATION] Starting migration of existing assignments...');
    
    const AuctionManager = (await import('../../models/AuctionManager.js')).default;
    
    // Get all auction managers
    const managers = await AuctionManager.find({}).select('_id auctionCars firstName lastName');
    
    let updated = 0;
    let errors = 0;
    
    for (const manager of managers) {
      if (manager.auctionCars && manager.auctionCars.length > 0) {
        console.log(`🔄 Processing manager ${manager.firstName} ${manager.lastName} with ${manager.auctionCars.length} cars`);
        
        for (const carId of manager.auctionCars) {
          try {
            const car = await AuctionRequest.findById(carId);
            if (car && !car.assignedAuctionManager) {
              car.assignedAuctionManager = manager._id;
              await car.save();
              console.log(`✅ Updated car ${car.vehicleName} with manager ${manager.firstName} ${manager.lastName}`);
              updated++;
            }
          } catch (err) {
            console.error(`❌ Error updating car ${carId}:`, err.message);
            errors++;
          }
        }
      }
    }
    
    console.log('🔄 [MIGRATION] Complete!', { updated, errors });
    res.json(send(true, 'Migration completed', { updated, errors }));
  } catch (err) {
    console.error('❌ [MIGRATION] Error:', err);
    res.json(send(false, 'Migration failed'));
  }
};