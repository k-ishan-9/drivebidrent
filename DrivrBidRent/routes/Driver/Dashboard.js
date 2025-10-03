const express = require('express');
const router = express.Router();

router.get('/driverdashboard', async (req, res) => {
    if (!req.session.userId || req.session.userType !== 'driver') {
      return res.redirect('/login');
    }
    
    try {
      const user = await User.findById(req.session.userId);
      res.render('driver_dashboard/driverdashboard.ejs', { user });
    } catch (err) {
      console.error(err);
      res.render('driver_dashboard/driverdashboard.ejs', { user: {} });
    }
  });

module.exports = router;