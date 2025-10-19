const allowedFeeTypes = ['tuition', 'library', 'examination', 'laboratory', 'other'];
const allowedPaymentMethods = ['bank_transfer', 'cash', 'cheque', 'online_banking'];

class PaymentCreateDTO {
  constructor(body, file, headers) {
    this.paymentAmount = body.paymentAmount;
    this.paymentDate = body.paymentDate;
    this.feeType = body.feeType;
    this.paymentMethod = body.paymentMethod;
    this.referenceNumber = body.referenceNumber;
    this.remarks = body.remarks;
    this.semester = body.semester;
    this.file = file; // multer file object
    this.headers = headers || {};
  }

  validate() {
    const errors = {};

    const amount = Number(this.paymentAmount);
    if (!this.paymentAmount || Number.isNaN(amount) || amount <= 0) {
      errors.paymentAmount = 'Must be a number greater than 0';
    }

    if (!this.paymentDate) {
      errors.paymentDate = 'Payment date is required';
    } else {
      const d = new Date(this.paymentDate);
      if (isNaN(d.getTime())) {
        errors.paymentDate = 'Invalid date format, expected YYYY-MM-DD';
      } else {
        const now = new Date();
        // Disallow dates more than 1 year in the future
        const maxFuture = new Date(now);
        maxFuture.setFullYear(now.getFullYear() + 1);
        if (d > maxFuture) {
          errors.paymentDate = 'Payment date is too far in the future';
        }
      }
    }

    if (!this.feeType || !allowedFeeTypes.includes(this.feeType)) {
      errors.feeType = `feeType is required and must be one of: ${allowedFeeTypes.join(', ')}`;
    }

    if (!this.paymentMethod || !allowedPaymentMethods.includes(this.paymentMethod)) {
      errors.paymentMethod = `paymentMethod is required and must be one of: ${allowedPaymentMethods.join(', ')}`;
    }

    // File validations
    if (!this.file) {
      errors.slipFile = 'slipFile is required';
    } else {
      const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowed.includes(this.file.mimetype)) {
        errors.slipFile = 'File type not allowed. Allowed: pdf, jpg, jpeg, png';
      }
      const maxBytes = 10 * 1024 * 1024; // 10MB
      if (this.file.size > maxBytes) {
        errors.slipFile = 'File size exceeds 10MB limit';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

class PaymentListQueryDTO {
  constructor(query) {
    this.page = Math.max(1, Number(query.page) || 1);
    this.perPage = Math.min(100, Math.max(1, Number(query.perPage) || 10));
    this.q = query.q;
    this.status = query.status; // verified|pending|rejected
    this.startDate = query.startDate;
    this.endDate = query.endDate;
    this.semester = query.semester;
  }
}

module.exports = {
  PaymentCreateDTO,
  PaymentListQueryDTO,
  allowedFeeTypes,
  allowedPaymentMethods
};
