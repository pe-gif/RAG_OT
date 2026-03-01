require('dotenv').config(); // Load your .env file
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;

console.log("---- DEBUGGING CONNECTION ----");
console.log("1. Reading URI from .env...");

if (!uri) {
  console.error("❌ ERROR: MONGO_URI is missing in .env file!");
  process.exit(1);
} else {
  // Hide the password in the log for safety
  console.log("   URI found: " + uri.split('@')[1]); 
}

console.log("2. Attempting to connect...");

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("✅ SUCCESS! Connected to MongoDB Atlas.");
    console.log("   The issue is NOT your connection string.");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ CONNECTION FAILED:");
    console.error(err.message);
    console.log("\nSUGGESTION: Check your IP Whitelist in Atlas 'Network Access'.");
    process.exit(1);
  });