const express = require('express');
const router = express.Router();
const AuctionRequest = require('../../models/AuctionRequest');
const User = require('../../models/User');
const isAuctionManager = require('../../middlewares/isAuctionManager');

// GET route for the auction manager home page
router.get('/home1', isAuctionManager, async (req, res) => {
    try {
        // Fetch all pending auction requests (status: pending)
        const auctionReqPend = await AuctionRequest.find({ status: 'pending' })
            .populate('sellerId')
            .sort({ createdAt: -1 })
            .limit(3);
        
        // Fetch cars with assigned mechanics (status: assignedMechanic)
        const pendingCars = await AuctionRequest.find({ status: 'assignedMechanic' })
            .populate('sellerId')
            .sort({ createdAt: -1 })
            .limit(3);
        
        // Fetch approved cars (status: approved)
        const approvedCars = await AuctionRequest.find({ status: 'approved' })
            .populate('sellerId')
            .sort({ createdAt: -1 })
            .limit(3);

        res.render('auctionmanager/home1.ejs', { 
            auctionReqPend: auctionReqPend,
            pendingCars: pendingCars,
            approvedCars: approvedCars
        });
    } catch(err) {
        console.error('Error fetching dashboard data:', err);
        res.render('auctionmanager/home1.ejs', { 
            auctionReqPend: [],
            pendingCars: [],
            approvedCars: [],
            error: 'Failed to load dashboard data' 
        });
    }
});

// GET route for the requests page (showing all pending requests)
router.get('/requests', isAuctionManager, async (req, res) => {
    try {
        // Fetch all pending auction requests
        const auctionReqPend = await AuctionRequest.find({ status: 'pending' })
            .populate('sellerId')
            .sort({ createdAt: -1 });
        
        res.render('auctionmanager/requests.ejs', { auctionReqPend: auctionReqPend });
    } catch(err) {
        console.error('Error fetching auction requests:', err);
        res.render('auctionmanager/requests.ejs', { 
            auctionReqPend: [], 
            error: 'Failed to load auction requests' 
        });
    }
});

// GET route for pending cars (cars with assigned mechanics)
router.get('/pending', isAuctionManager, async (req, res) => {
    try {
        // Fetch all cars with assigned mechanics
        const pendingCars = await AuctionRequest.find({ status: 'assignedMechanic' })
            .populate('sellerId')
            .sort({ createdAt: -1 });
        
        res.render('auctionmanager/pending.ejs', { 
            pendingCars: pendingCars 
        });
    } catch(err) {
        console.error('Error fetching pending cars:', err);
        res.render('auctionmanager/pending.ejs', { 
            pendingCars: [], 
            error: 'Failed to load pending cars' 
        });
    }
});

// GET route for approved cars
router.get('/approvedcars', isAuctionManager, async (req, res) => {
    try {
        // Fetch all approved cars
        const approvedCars = await AuctionRequest.find({ status: 'approved' })
            .populate('sellerId')
            .sort({ createdAt: -1 });
        
        res.render('auctionmanager/approvedcars.ejs', { 
            approvedCars: approvedCars 
        });
    } catch(err) {
        console.error('Error fetching approved cars:', err);
        res.render('auctionmanager/approvedcars.ejs', { 
            approvedCars: [], 
            error: 'Failed to load approved cars' 
        });
    }
});

// GET route for assigning mechanic to a specific car
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

// POST route to update mechanic assignment
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