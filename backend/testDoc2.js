import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/ai-learning-assistant')
  .then(async () => {
    console.log('MongoDB Connected');
    const Document = mongoose.model('Document', new mongoose.Schema({}, {strict: false}));
    const doc = await Document.findOne();
    if (doc) {
      console.log("Database Document Object:");
      console.log(JSON.stringify(doc, null, 2));
    } else {
      console.log("No documents found in DB");
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
