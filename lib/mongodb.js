// lib/mongodb.js
import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://mutasi:FirmanID123@mutasi.004zxiz.mongodb.net/?retryWrites=true&w=majority&appName=mutasi" // ganti dengan mongodb URI punyamu
const dbName = "mutasi" // ganti dengan nama database kamu

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    
    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw new Error('Failed to connect to MongoDB');
  }
}