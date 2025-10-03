const express = require('express');
const router = express.Router();
const AuctionRequest = require('../../models/AuctionRequest');
const isMechanicLoggedin = require('../../middlewares/isMechanicLoggedin');

router.get("/current-tasks", isMechanicLoggedin, async (req, res) => {
  try {
    const assignedVehicles = await AuctionRequest.find({
      assignedMechanic: req.user._id,
      status: 'assignedMechanic'
    }).sort({ createdAt: -1 });

    res.render("mechanic_dashboard/current-tasks.ejs", { 
      assignedVehicles
    });
  } catch (err) {
    console.error(err);
    res.render("mechanic_dashboard/current-tasks.ejs", { 
      assignedVehicles: []
    });
  }
});

module.exports = router;