const express = require('express');
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');
const { uploadImage } = require('../services/cloudinary');

const router = express.Router();

// Multer memory storage to pass buffer to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.post('/image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({
        error: 'Cloudinary is not configured',
        message: 'Missing Cloudinary environment variables',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please attach an image file in the "image" field',
      });
    }

    const folder = req.body.folder || `talikhata/users/${req.user._id.toString()}`;

    const result = await uploadImage(req.file.buffer, { folder });

    return res.status(201).json({
      message: 'Image uploaded successfully',
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return res.status(500).json({
      error: 'Upload failed',
      message: error.message || 'Something went wrong during upload',
    });
  }
});

module.exports = router;