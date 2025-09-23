const multer = require('multer');
const path = require('path');

function getUploadMiddleware() {
  let upload;
  if (process.env.UPLOAD_DRIVER === 's3') {
    const multerS3 = require('multer-s3');
    const AWS = require('aws-sdk');
    const s3 = new AWS.S3({
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY,
      region: process.env.S3_REGION,
    });
    upload = multer({
      storage: multerS3({
        s3,
        bucket: process.env.S3_BUCKET,
        ...(process.env.S3_IS_PRE_SIGNED === 'false' ? { acl: 'public-read' } : {}),
        key: (req, file, cb) => {
          let userId = req.user && req.user.id ? req.user.id : (req.body && req.body.id ? req.body.id : 'unknown');
          cb(null, `uploads/${userId}/profileImages/${Date.now()}-${file.originalname}`);
        }
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only .jpg, .jpeg, .png files are allowed!'));
        }
      }
    });
  } else {
    throw new Error('Local disk uploads are not supported on Vercel. Please set UPLOAD_DRIVER=s3 in your environment variables.');
  }
  return upload;
}

module.exports = getUploadMiddleware;
