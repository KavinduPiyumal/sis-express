const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  region: process.env.S3_REGION,
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY
});

// Generate a pre-signed upload URL for S3
function getS3UploadUrl(fileName, fileType) {
  return s3.getSignedUrl('putObject', {
    Bucket: process.env.S3_BUCKET,
    Key: fileName, // e.g., uploads/<userId>/profileImages/filename.png
    Expires: 60, // URL expires in 60 seconds
    ContentType: fileType
  });
}

// Generate a pre-signed download URL for S3
function getS3DownloadUrl(fileName) {
  return s3.getSignedUrl('getObject', {
    Bucket: process.env.S3_BUCKET,
    Key: fileName,
    Expires: 60 // URL expires in 60 seconds
  });
}

module.exports = {
  getS3UploadUrl,
  getS3DownloadUrl
};
