const express = require('express');
const router = express.Router();
const AuctionRequest = require('../../models/AuctionRequest');
const User = require('../../models/User');
const isMechanicLoggedin = require('../../middlewares/isMechanicLoggedin');

router.get("/vehicle-details/:id", isMechanicLoggedin, async (req, res) => {
  try {
    const vehicle = await AuctionRequest.findById(req.params.id)
      .populate('sellerId', 'firstName lastName phone doorNo street city state googleAddressLink');
    
    if (!vehicle) {
      return res.status(404).send("Vehicle not found");
    }

    res.render("mechanic_dashboard/mcar-details.ejs", { 
      vehicle,
      seller: vehicle.sellerId
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching vehicle details");
  }
});

router.post('/submit-review/:id', isMechanicLoggedin, async (req, res) => {
  try {
    const { mechanicalCondition, bodyCondition, recommendations, conditionRating } = req.body;
    
    await AuctionRequest.findByIdAndUpdate(req.params.id, {
      mechanicReview: {
        mechanicalCondition,
        bodyCondition,
        recommendations,
        conditionRating
      },
      reviewStatus: 'completed' // Update reviewStatus to completed
    });

    res.redirect('/mechanic_dashboard/index');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error submitting review');
  }
});

module.exports = router;