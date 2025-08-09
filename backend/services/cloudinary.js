const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImage(bufferOrPath, options = {}) {
  const uploadOptions = {
    folder: options.folder || 'talikhata',
    resource_type: 'image',
    overwrite: false,
    unique_filename: true,
    use_filename: false,
    transformation: options.transformation || [{ quality: 'auto', fetch_format: 'auto' }],
  };

  return new Promise((resolve, reject) => {
    // Support both file path and buffer
    if (Buffer.isBuffer(bufferOrPath)) {
      const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
      stream.end(bufferOrPath);
    } else {
      cloudinary.uploader.upload(bufferOrPath, uploadOptions, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    }
  });
}

module.exports = { cloudinary, uploadImage };