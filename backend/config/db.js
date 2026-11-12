const mongoose = require("mongoose");

const connectDB = async () => {
  const maxRetries = 5;
  const retryDelay = 3000; // 3 seconds between retries

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // FIXED: Changed from MONGODB_CONNECTED to MONGODB_URI
      const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/examapp');
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn; // Return connection for use elsewhere
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt < maxRetries) {
        console.log(`Retrying in ${retryDelay/1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        console.error("All MongoDB connection attempts failed. Exiting...");
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;