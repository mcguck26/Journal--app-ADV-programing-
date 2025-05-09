// utils/gridFsStorage.js
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
require('dotenv').config();

const storage = new GridFsStorage({
  url: process.env.MONGODB_URI || 'mongodb://localhost:27017/journal-app',
  file: (req, file) => {
    return {
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: 'uploads' // collection name in MongoDB
    };
  }
});

const upload = multer({ storage });

module.exports = upload;

//This was completed by Skylar 