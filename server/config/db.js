const mongoose = require('mongoose');


const connectDB = async () => {
  console.log('Trying to connect to MongoDB...');
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error(
        'MongoDB connection string is missing. Set MONGO_URI (or MONGODB_URI) in server/.env.'
      );
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
};

module.exports = connectDB;
