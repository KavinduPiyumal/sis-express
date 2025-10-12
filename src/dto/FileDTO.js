class FileUploadDTO {
  constructor(data) {
    this.type = data.type || 'notice-attachment';
    this.files = data.files || [];
  }

  validate() {
    const errors = [];

    const validTypes = ['notice-attachment', 'profile-image', 'medical-report', 'payment-receipt'];
    if (!validTypes.includes(this.type)) {
      errors.push('Invalid file type');
    }

    if (!Array.isArray(this.files) || this.files.length === 0) {
      errors.push('At least one file is required');
    }

    // Validate file sizes (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    const oversizedFiles = this.files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      errors.push('Some files exceed the 5MB size limit');
    }

    // Validate file types for notice attachments
    if (this.type === 'notice-attachment') {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'text/plain'
      ];
      
      const invalidFiles = this.files.filter(file => !allowedTypes.includes(file.mimetype));
      if (invalidFiles.length > 0) {
        errors.push('Some files have unsupported formats');
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
}

class FileResponseDTO {
  constructor(file) {
    this.id = file.id || file.filename;
    this.fileName = file.fileName || file.filename;
    this.originalName = file.originalName || file.originalname;
    this.fileSize = file.fileSize || file.size;
    this.mimeType = file.mimeType || file.mimetype;
    this.url = file.url || file.path;
    this.uploadedAt = new Date().toISOString();
  }
}

module.exports = {
  FileUploadDTO,
  FileResponseDTO
};