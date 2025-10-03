const express = require('express');
const router = express.Router();
const AuctionRequest = require('../../models/AuctionRequest');
const isMechanicLoggedin = require('../../middlewares/isMechanicLoggedin');

router.get("/past-tasks", isMechanicLoggedin, async (req, res) => {
  try {
    const completedTasks = await AuctionRequest.find({
      assignedMechanic: req.user._id,
      reviewStatus: 'completed'
    }).sort({ createdAt: -1 });

    res.render("mechanic_dashboard/past-tasks.ejs", { 
      completedTasks
    });
  } catch (err) {
    console.error(err);
    res.render("mechanic_dashboard/past-tasks.ejs", { 
      completedTasks: []
    });
  }
});

module.exports = router;