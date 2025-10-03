const jwt = require("jsonwebtoken");
const User = require("../models/User");

const isBuyerLoggedin = async (req, res, next) => {
  let token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user || req.user.userType !== "buyer" || decoded.userType !== "buyer" || decoded.email !== req.user.email) {
        return res.redirect('/login');
      }

      next();
    } catch (error) {
      console.error('Error in isBuyerLoggedin middleware:', error);
      return res.redirect('/login');
    }
  } else {
    return res.redirect('/login');
  }
};

module.exports = isBuyerLoggedin;