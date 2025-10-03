const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const User = require("./models/User");
const RentalRequest = require("./models/RentalRequest");
const AuctionRequest = require("./models/AuctionRequest");
const authController = require("./controllers/authController");

const addAuctionRoute = require("./routes/Seller/AddAuction");
const auctionDetailsRoutes = require("./routes/Seller/AuctionDetail");
const addRentalRoute = require("./routes/Seller/AddRental");
const seller_profileRoute = require("./routes/Seller/profile");
const viewAuctionsRoute = require("./routes/Seller/ViewAuctions.js");
const viewRentalsRoute = require("./routes/Seller/ViewRentals.js");
const viewearningsRoute = require("./routes/Seller/ViewEarnings.js");
const rentalDetailsRoute = require("./routes/Seller/RentalDetails");
const updateRentalRoute = require('./routes/Seller/UpdateRental');

const AuctionManagerHomeRoute = require("./routes/AuctionManager/Home.js");
const Auctionrequests = require("./routes/AuctionManager/Requests.js");
const AssignMechanic = require("./routes/AuctionManager/AssignMechanic.js");
const Pendingcars = require("./routes/AuctionManager/Pending.js");
const approvedCars = require("./routes/AuctionManager/ApprovedCars.js");
const PendingCarDetails = require("./routes/AuctionManager/PendingCarDetails.js");

const AdminHomepage = require("./routes/Admin/AdminHome.js");
const ManageUsers = require("./routes/Admin/ManageUSers.js");
const adminProfile = require("./routes/Admin/AdminProfile.js");
const Analytics = require("./routes/Admin/Analytics.js");
const ManageEarnings = require("./routes/Admin/ManageEarnings.js");

const Aboutus = require("./routes/Buyer/Aboutus.js");

const BuyerDashboardRoute = require("./routes/Buyer/BuyerDashboard.js");
const BuyerAuctionRoute = require("./routes/Buyer/Auction.js");
const BuyerDriverRoute = require("./routes/Buyer/Driver.js");
const BuyerRentalRoute = require("./routes/Buyer/Rental.js");
const BuyerPurchaseRoute = require("./routes/Buyer/Purchase.js");
const BuyerWishlistRoute = require("./routes/Buyer/Wishlist.js");

const DriverDashboard = require("./routes/Driver/Dashboard.js");

const index = require("./routes/Mechanic/index.js");
const currentTasks = require("./routes/Mechanic/current-tasks.js"); 
const pendingTasks = require("./routes/Mechanic/pending-tasks.js");
const pastTasks = require("./routes/Mechanic/past-tasks.js");   
const profile = require("./routes/Mechanic/profile.js");
const mcardetails = require("./routes/Mechanic/mcardetails.js")

// Assume middlewares are created similarly
const isSellerLoggedin = require("./middlewares/isSellerLoggedin.js");
const isMechanicLoggedin = require("./middlewares/isMechanicLoggedin.js");
const isAdminLoggedin = require("./middlewares/isAdminLoggedin.js");
const isAuctionManager = require("./middlewares/isAuctionManager.js");

const app = express();

mongoose
  .connect(process.env.MONGODB_URI || "mongodb+srv://Jeevan:Bunny123@cluster0.2jrrwqn.mongodb.net/DriveBidRent")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", async (req, res) => {
  try {
    const topRentals = await RentalRequest.find({ status: 'available' })
      .sort({ createdAt: -1 })
      .limit(4);

    const topAuctions = await AuctionRequest.find({ started_auction: 'yes'})
      .sort({ auctionDate: -1 })
      .limit(4);

    res.render("homepage.ejs", { topRentals, topAuctions });
  } catch (err) {
    console.error("Error fetching top rentals and auctions:", err);
    res.render("homepage.ejs", { topRentals: [], topAuctions: [], error: "Failed to load top rentals and auctions" });
  }
});

app.get("/signup", authController.getSignup);
app.post("/signup", authController.postSignup);

app.get("/login", authController.getLogin);
app.post("/login", authController.postLogin);

app.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/login");
});

app.use("/", BuyerDashboardRoute);
app.use("/", BuyerAuctionRoute);
app.use("/", BuyerDriverRoute);
app.use("/", BuyerRentalRoute);
app.use("/", BuyerPurchaseRoute);
app.use("/", BuyerWishlistRoute);
app.use("/", Aboutus);

app.get("/seller_dashboard/seller", isSellerLoggedin, async (req, res) => {
  try {
    res.render("seller_dashboard/seller.ejs", { user: req.user });
  } catch (err) {
    console.error(err);
    res.render("seller_dashboard/seller.ejs", { user: {} });
  }
});

app.use("/seller_dashboard", isSellerLoggedin, addAuctionRoute);
app.use("/seller_dashboard", isSellerLoggedin, auctionDetailsRoutes);
app.use("/seller_dashboard", isSellerLoggedin, addRentalRoute);
app.use("/seller_dashboard", isSellerLoggedin, seller_profileRoute);
app.use("/seller_dashboard", isSellerLoggedin, viewAuctionsRoute);
app.use("/seller_dashboard", isSellerLoggedin, viewRentalsRoute);
app.use("/seller_dashboard", isSellerLoggedin, viewearningsRoute);
app.use("/seller_dashboard", isSellerLoggedin, rentalDetailsRoute);
app.use('/seller_dashboard', isSellerLoggedin, updateRentalRoute);

app.get("/seller_dashboard/update-rental", isSellerLoggedin, async (req, res) => {
  try {
    const rentalId = req.query.id;
    if (!rentalId) {
      return res.redirect("/seller_dashboard/view-rentals");
    }

    res.render("seller_dashboard/update-rental.ejs", { user: req.user, rentalId });
  } catch (err) {
    console.error(err);
    res.render("seller_dashboard/update-rental.ejs", {
      user: req.user,
      error: "Failed to load data",
    });
  }
});

app.get("/seller_dashboard/view-bids", isSellerLoggedin, async (req, res) => {
  try {
    const auctionId = req.query.id;
    if (!auctionId) {
      return res.redirect("/seller_dashboard/view-auctions");
    }

    res.render("seller_dashboard/view-bids.ejs", { user: req.user, auctionId });
  } catch (err) {
    console.error(err);
    res.render("seller_dashboard/view-bids.ejs", {
      user: req.user,
      error: "Failed to load data",
    });
  }
});

app.get("/seller_dashboard/view-rentals", isSellerLoggedin, async (req, res) => {
  try {
    res.render("seller_dashboard/view-rentals.ejs", { user: req.user });
  } catch (err) {
    console.error(err);
    res.render("seller_dashboard/view-rentals.ejs", {
      user: req.user,
      error: "Failed to load data",
    });
  }
});


app.use("/auctionmanager", isAuctionManager, AuctionManagerHomeRoute);
app.use("/auctionmanager", isAuctionManager, Auctionrequests);
app.use("/auctionmanager", isAuctionManager, AssignMechanic);
app.use("/auctionmanager", isAuctionManager, Pendingcars);
app.use("/auctionmanager", isAuctionManager, approvedCars);
app.use("/auctionmanager", isAuctionManager, PendingCarDetails);

app.use("/admin", isAdminLoggedin, AdminHomepage);
app.use("/admin", isAdminLoggedin, ManageUsers);
app.use("/admin", isAdminLoggedin, adminProfile);
app.use("/admin", isAdminLoggedin, Analytics);
app.use("/admin", isAdminLoggedin, ManageEarnings);

app.use("/mechanic_dashboard", isMechanicLoggedin, currentTasks);
app.use("/mechanic_dashboard", isMechanicLoggedin, pendingTasks);
app.use("/mechanic_dashboard", isMechanicLoggedin, pastTasks);
app.use("/mechanic_dashboard", isMechanicLoggedin, profile);
app.use("/mechanic_dashboard", isMechanicLoggedin, index);
app.use("/mechanic_dashboard", isMechanicLoggedin, mcardetails);

app.get("/logout",(req,res)=>{
  res.cookie("jwt","");
  res.redirect("/");
})

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;