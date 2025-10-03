const express = require('express');
const router = express.Router();
const AuctionRequest = require('../../models/AuctionRequest');
const User = require('../../models/User');
const isAuctionManager = require('../../middlewares/isAuctionManager');

router.get('/assign-mechanic/:id', isAuctionManager, async (req, res) => {
    try {
        const request = await AuctionRequest.findById(req.params.id).populate('sellerId');
        if (!request) {
            return res.status(404).send('Request not found');
        }

        // Find mechanics in the same city as the seller
        const mechanics = await User.find({
            userType: 'mechanic',
            'city': request.sellerId.city,
            approved_status: 'Yes'
        }).select('firstName lastName shopName experienceYears');

        res.render('auctionmanager/assign-mechanic.ejs', { 
            request: request,
            mechanics: mechanics 
        });
    } catch(err) {
        console.error('Error fetching request details:', err);
        res.status(500).send('Error loading request details');
    }
});

router.post('/assign-mechanic-update/:id', isAuctionManager, async (req, res) => {
    try {
        const { mechanicName, mechanicId } = req.body;
        
        const updatedRequest = await AuctionRequest.findByIdAndUpdate(
            req.params.id,
            { 
                status: 'assignedMechanic',
                assignedMechanic: mechanicId,
                mechanicName: mechanicName
            },
            { new: true }
        );

        if (!updatedRequest) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        res.json({ success: true });
    } catch(err) {
        console.error('Error assigning mechanic:', err);
        res.status(500).json({ success: false, message: 'Error assigning mechanic' });
    }
});

module.exports = router;