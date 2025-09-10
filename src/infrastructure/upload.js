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
        acl: 'public-read',
        key: (req, file, cb) => {
          cb(null, `profileImages/${Date.now()}-${file.originalname}`);
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
    // local disk storage
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads/profileImages'));
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
      }
    });
    upload = multer({
      storage: storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only .jpg, .jpeg, .png files are allowed!'));
        }
      }
    });
  }
  return upload;
}

module.exports = getUploadMiddleware;
