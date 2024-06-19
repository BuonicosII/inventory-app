const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || require('./env').cloud_name,
    api_key: process.env.CLOUDINARY_API_KEY || require('./env').api_key,
    api_secret: process.env.CLOUDINARY_API_SECRET || require('./env').api_secret
  });

module.exports = cloudinary