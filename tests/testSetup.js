require("dotenv").config();
const mongoose = require("mongoose");

const connectTestDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
};

const closeTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};

const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

module.exports = { connectTestDB, closeTestDB, clearTestDB };