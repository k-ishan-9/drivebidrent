const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const bcrypt = require('bcrypt');
const isMechanicLoggedin = require('../../middlewares/isMechanicLoggedin');

// Get mechanic profile page
router.get("/profile", isMechanicLoggedin, async (req, res) => {
  try {
    const user = req.user;
    
    res.render("mechanic_dashboard/profile.ejs", { user });
  } catch (error) {
    console.error("Error fetching mechanic profile:", error);
    res.status(500).send("Server error");
  }
});

// Route to handle password change
router.post('/change-password', isMechanicLoggedin, async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    
    // Validate inputs
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match' });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long' });
    }
    
    // Get user from req.user
    const user = req.user;
    
    // Check if old password is correct
    const isMatch = await user.comparePassword(oldPassword);
    
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;