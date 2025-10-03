const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const bcrypt = require('bcrypt');
const isAdminLoggedIn = require('../../middlewares/isAdminLoggedIn');

// Route to render admin profile page
router.get('/admin-profile', isAdminLoggedIn, async (req, res) => {
  try {
    // Fetch admin user from database using JWT user ID
    const adminUser = await User.findById(req.user._id);
    
    if (!adminUser || adminUser.userType !== 'admin') {
      return res.redirect('/login');
    }
    
    res.render('admin_dashboard/admin-profile.ejs', { admin: adminUser });
  } catch (err) {
    console.error('Error fetching admin profile:', err);
    res.status(500).send('Server error');
  }
});

// Route to update admin password
router.post('/update-admin-password', isAdminLoggedIn, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Get admin user using JWT user ID
    const adminUser = await User.findById(req.user._id);
    
    if (!adminUser || adminUser.userType !== 'admin') {
      return res.status(404).json({ success: false, message: 'Admin user not found' });
    }
    
    // Verify current password
    const isMatch = await adminUser.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    
    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match' });
    }
    
    // Update password
    adminUser.password = newPassword;
    await adminUser.save();
    
    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error updating admin password:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;