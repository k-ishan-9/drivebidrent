// controllers/auth.controller.js
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const authController = {
  // === SIGNUP ===
  signup: async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        userType,
        phone,
        dateOfBirth,
        termsAccepted,
        experienceYears,
        shopName,
        repairBikes,
        repairCars,
        googleAddressLink,
        approved_status,
      } = req.body;

      // Optional field for mechanics only
      const mechanicGoogleLink = userType === "mechanic" ? googleAddressLink : undefined;

      // Normalize address fields (handles both string and array from frontend)
      let doorNo = "", street = "", city = "", state = "";
      ["doorNo", "street", "city", "state"].forEach((field) => {
        const val = req.body[field];
        const normalized = Array.isArray(val) ? val.find(v => v?.trim()) || "" : val || "";
        if (field === "doorNo") doorNo = normalized;
        if (field === "street") street = normalized;
        if (field === "city") city = normalized;
        if (field === "state") state = normalized;
      });

      // Convert boolean values from form
      const isBikeRepair = repairBikes === "on" || repairBikes === true;
      const isCarRepair = repairCars === "on" || repairCars === true;

      // === VALIDATIONS ===
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      const allowedTypes = ['buyer', 'seller', 'driver', 'mechanic', 'admin', 'auction_manager', 'superadmin'];
      if (!userType || !allowedTypes.includes(userType)) {
        return res.status(400).json({ success: false, message: 'Invalid or missing userType' });
      }

      if (!phone || !/^\d{10}$/.test(phone)) {
        return res.status(400).json({ success: false, message: "Phone number must be 10 digits" });
      }

      if (!dateOfBirth) {
        return res.status(400).json({ success: false, message: "Date of birth is required" });
      }

      const dob = new Date(dateOfBirth);
      const age = new Date().getFullYear() - dob.getFullYear();
      if (age < 18) {
        return res.status(400).json({ success: false, message: "You must be at least 18 years old" });
      }

      if (password.length < 8) {
        return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
      }

      if (!termsAccepted) {
        return res.status(400).json({ success: false, message: "You must accept terms" });
      }

      // Check for existing user
      const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
      if (existingUser) {
        return res.status(409).json({ success: false, message: "Email or phone already exists" });
      }

      // Build user data
      const userData = {
        firstName,
        lastName,
        email,
        password,
        userType,
        dateOfBirth: dob,
        phone,
        doorNo,
        street,
        city,
        state,
        shopName: userType === 'mechanic' ? shopName : undefined,
        experienceYears: experienceYears ? parseInt(experienceYears) : undefined,
        approved_status: approved_status || "No",
        repairBikes: isBikeRepair,
        repairCars: isCarRepair,
        googleAddressLink: mechanicGoogleLink,
      };

      const user = new User(userData);
      await user.save();

      const token = generateToken(user);
      res.cookie("jwt", token, { httpOnly: true, sameSite: "strict" });

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
          id: user._id,
          userType: user.userType,
          firstName: user.firstName,
        }
      });

    } catch (err) {
      console.error("Signup error:", err);

      if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message).join('; ');
        return res.status(400).json({ success: false, message: messages });
      }

      const message = err.code === 11000 ? "User already exists" : "Signup failed";
      return res.status(err.code === 11000 ? 409 : 500).json({ success: false, message });
    }
  },

  // === LOGIN ===
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log('Login attempt for email:', email);

      const user = await User.findOne({ email });
      console.log('User found:', user ? 'YES' : 'NO');
      if (user) {
        console.log('User data:', {
          id: user._id,
          userType: user.userType,
          firstName: user.firstName,
          email: user.email,
          approved_status: user.approved_status
        });
      }

      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
      }

      const token = generateToken(user);
      res.cookie("jwt", token, { httpOnly: true, sameSite: "strict", maxAge: 30 * 24 * 60 * 60 * 1000 });

      // CRITICAL FIX: These now match your current frontend routes (from App.jsx)
      const redirectMap = {
        buyer: "/buyer",                    // Updated: now uses BuyerLayout
        seller: "/seller",                  // Correct
        driver: "/driver-dashboard",        // Adjust if you have a driver layout
        mechanic: "/mechanic/dashboard",    // Correct
        admin: "/admin",                    // Updated: now uses /admin base
        auction_manager: "/auctionmanager", // Updated to match frontend
        superadmin: "/superadmin"          // Super Admin route
      };

      const redirectUrl = redirectMap[user.userType] || "/";

      // Include notification flag in response so frontend can show badge immediately
      const responseUser = {
        _id: user._id,
        id: user._id,
        userType: user.userType,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        approved_status: user.approved_status,
        notificationFlag: !!user.notificationFlag,
        doorNo: user.doorNo || '',
        street: user.street || '',
        city: user.city || '',
        state: user.state || ''
      };

      console.log('Sending response with user:', responseUser);

      return res.json({
        success: true,
        message: "Login successful",
        redirect: redirectUrl,
        user: responseUser
      });

    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ success: false, message: "Login failed" });
    }
  },

  // === LOGOUT ===
  logout: (req, res) => {
    res.clearCookie("jwt");
    return res.json({ success: true, message: "Logged out successfully" });
  }
};

export default authController;