// Backend/app.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";

import connectDB from "./config/db.js";
import "./models/User.js";
import "./models/AuctionManager.js";
import "./models/RentalRequest.js";
import "./models/AuctionRequest.js";
import "./models/Chat.js";
import "./models/Message.js";
import "./models/InspectionChat.js";
import "./models/InspectionMessage.js";

import authRoutes from "./routes/auth.routes.js";
import homeRoutes from "./routes/home.routes.js";
import sellerRoutes from "./routes/seller.routes.js";
import auctionManagerRoutes from "./routes/auctionManager.routes.js";
import mechanicRoutes from "./routes/mechanic.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import buyerRoutes from "./routes/buyer.routes.js";
import superadminRoutes from "./routes/superadmin.routes.js";
import chatRoutes from './routes/chat.routes.js';
import inspectionChatRoutes from './routes/inspectionChat.routes.js';

import sellerMiddleware from "./middlewares/seller.middleware.js";
import mechanicMiddleware from "./middlewares/mechanic.middleware.js";
import adminMiddleware from "./middlewares/admin.middleware.js";
import auctionManagerMiddleware from "./middlewares/auction_manager.middleware.js";
import buyerMiddleware from "./middlewares/buyer.middleware.js";
import superadminMiddleware from "./middlewares/superadmin.middleware.js";
import errorHandler from "./middlewares/errorHandler.middleware.js";
import { devLogger, accessLogger, errorLogger } from "./middlewares/logger.middleware.js";
import { corsOptions, helmetConfig, limiter } from "./middlewares/security.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Logging middlewares
app.use(devLogger);
app.use(accessLogger);
app.use(errorLogger);

// Security & parsing middlewares
app.use(cors(corsOptions));
app.use(helmetConfig);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(limiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/seller", sellerMiddleware, sellerRoutes);
app.use("/api/buyer", buyerMiddleware, buyerRoutes);
app.use("/api/auctionmanager", auctionManagerMiddleware, auctionManagerRoutes);
app.use("/api/mechanic", mechanicMiddleware, mechanicRoutes);
app.use("/api/admin", adminMiddleware, adminRoutes);
app.use("/api/superadmin", superadminMiddleware, superadminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/inspection-chat', inspectionChatRoutes);

// Serve client in production
if (process.env.NODE_ENV === "production") {
  const clientDistPath = path.join(__dirname, "..", "client", "dist");
  (async () => {
    try {
      const fs = await import("fs");
      if (fs.existsSync(clientDistPath)) {
        app.use(express.static(clientDistPath));
        app.get("*", (req, res) => {
          if (req.path.startsWith("/api")) {
            return res.status(404).json({ error: "API route not found" });
          }
          res.sendFile(path.join(clientDistPath, "index.html"));
        });
        console.log("Production mode: Serving client build from", clientDistPath);
      } else {
        console.warn("Client build not found at:", clientDistPath);
      }
    } catch (err) {
      console.error("Error checking client build:", err);
    }
  })();
}

// 404 handler for unmatched API routes
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "API route not found" });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error("Failed to connect to database or start server:", err);
    process.exit(1);
  }
};

startServer();

export default app;