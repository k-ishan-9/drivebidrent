// config/db.js
import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGO_URI environment variable is not set. Please set it in your .env file.');
    process.exit(1);
  }

  try {
    // Mongoose v6+ no longer requires or uses `useNewUrlParser` / `useUnifiedTopology` options.
    await mongoose.connect(uri);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message || err);
    // Do not exit the process so nodemon keeps running — caller can decide how to proceed.
    // This helps during development when DB may be temporarily unreachable.
    return;
  }
};

export default connectDB;