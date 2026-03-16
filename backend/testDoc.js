import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/ai-learning-assistant')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

import Document from './models/Document.js';

async function testFetch() {
  const doc = await Document.findOne();
  if (doc) {
    console.log("Database Document Object:");
    console.log(JSON.stringify(doc, null, 2));
  } else {
    console.log("No documents found in DB");
  }
  process.exit(0);
}

testFetch();
