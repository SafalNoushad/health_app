const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let db;

async function connectToDatabase() {
  if (!db) {
    await client.connect();
    db = client.db('health_app'); 
    console.log('Connected to MongoDB - health_app database');
  }
  return db;
}

module.exports = connectToDatabase;