const mongoose = require('mongoose');
const { seedDatabase } = require('../services/dataSeeder');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://anand:anand8126@cluster0.kcki8de.mongodb.net/dashboard_builder';

async function connectDB() {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB Atlas.');
    // Automatically seed mock collections
    await seedDatabase();
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    console.warn('Running server without persistent MongoDB storage fallback.');
  }
}

module.exports = { connectDB };
