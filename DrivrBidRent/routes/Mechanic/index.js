const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const AuctionRequest = require('../../models/AuctionRequest');
const isMechanicLoggedin = require('../../middlewares/isMechanicLoggedin');

router.get("/index", isMechanicLoggedin, async (req, res) => {
  try {
    const user = req.user;
    
    // Check if mechanic is approved
    if (user.approved_status !== 'Yes') {
      return res.render("mechanic_dashboard/index.ejs", { 
        user,
        showApprovalPopup: true,
        assignedVehicles: [],
        displayedVehicles: [],
        completedTasks: [],
        allCompletedTasks: []
      });
    }

    // Get current assigned vehicles (status: 'assignedMechanic', reviewStatus: 'pending')
    const assignedVehicles = await AuctionRequest.find({
      assignedMechanic: req.user._id,
      status: 'assignedMechanic',
      reviewStatus: 'pending'
    }).sort({ createdAt: -1 });

    // Get completed tasks (reviewStatus: 'completed')
    const allCompletedTasks = await AuctionRequest.find({
      assignedMechanic: req.user._id,
      reviewStatus: 'completed'
    }).sort({ createdAt: -1 });

    res.render("mechanic_dashboard/index.ejs", { 
      user,
      assignedVehicles,
      displayedVehicles: assignedVehicles.slice(0, 3),
      completedTasks: allCompletedTasks.slice(0, 2),
      allCompletedTasks,
      showApprovalPopup: false
    });
  } catch (err) {
    console.error(err);
    res.render("mechanic_dashboard/index.ejs", { 
      user: req.user || {},
      assignedVehicles: [],
      displayedVehicles: [],
      completedTasks: [],
      allCompletedTasks: [],
      showApprovalPopup: false
    });
  }
});

module.exports = router;