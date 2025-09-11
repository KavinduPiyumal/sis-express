class UserDTO {
  constructor(user) {
    this.id = user.id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
    this.role = user.role;
    this.studentId = user.studentId;
    this.phone = user.phone;
    this.address = user.address;
    this.dateOfBirth = user.dateOfBirth;
    this.isActive = user.isActive;
    this.lastLoginAt = user.lastLoginAt;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    if (user.profileImage) {
      if (/^https?:\/\//.test(user.profileImage)) {
        // Already a full URL (S3 or external)
        this.profileImage = user.profileImage;
      } else if (process.env.UPLOAD_DRIVER === 's3') {
        if (process.env.S3_IS_PRE_SIGNED === 'true') {
          // S3: use pre-signed download URL utility
          const { getS3DownloadUrl } = require('../infrastructure/s3PresignedUrl');
          if (user.id) {
            this.profileImage = getS3DownloadUrl(`uploads/${user.id}/profileImages/${user.profileImage}`);
          } else {
            this.profileImage = getS3DownloadUrl(`uploads/profileImages/${user.profileImage}`);
          }
        }
        else {
          // S3: construct S3 URL if not already a full URL
          const s3Bucket = process.env.S3_BUCKET || '';
          const s3Region = process.env.S3_REGION || '';
          if (s3Bucket && s3Region && user.id) {
            this.profileImage = `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/uploads/${user.id}/profileImages/${user.profileImage}`;
          } else {
            this.profileImage = user.profileImage;
          }
        }

      } else {
        // Local file: construct full URL using CDN_URL
        const cdnUrl = process.env.CDN_URL || '';
        if (user.id) {
          this.profileImage = `${cdnUrl}/uploads/${user.id}/profileImages/${user.profileImage}`;
        } else {
          this.profileImage = `${cdnUrl}/uploads/profileImages/${user.profileImage}`;
        }
      }
    } else {
      this.profileImage = null;
    }
  }
}

class UserCreateDTO {
  constructor(data) {
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role;
    this.studentId = data.studentId;
    this.phone = data.phone;
    this.address = data.address;
    this.dateOfBirth = data.dateOfBirth;
    this.profileImage = data.profileImage;
  }
}

class UserUpdateDTO {
  constructor(data) {
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.phone = data.phone;
    this.address = data.address;
    this.dateOfBirth = data.dateOfBirth;
    this.isActive = data.isActive;
    this.profileImage = data.profileImage;
  }
}

class LoginDTO {
  constructor(data) {
    this.email = data.email;
    this.password = data.password;
  }
}

module.exports = {
  UserDTO,
  UserCreateDTO,
  UserUpdateDTO,
  LoginDTO
};
