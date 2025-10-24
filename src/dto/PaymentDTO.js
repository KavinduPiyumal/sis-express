const allowedFeeTypes = ['tuition', 'library', 'examination', 'laboratory', 'other'];
const allowedPaymentMethods = ['bank_transfer', 'cash', 'cheque', 'online_banking'];

class PaymentCreateDTO {
  constructor(body, file, headers) {
    this.paymentAmount = body.paymentAmount;
    this.paymentDate = body.paymentDate;
    // Allow either a free-text feeType (legacy) or a feeTypeId (UUID) referencing FeeType table
    this.feeType = body.feeType;
    this.feeTypeId = body.feeTypeId || null;
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

    // Accept either a feeType string (free text/code) OR a feeTypeId (UUID) that references the FeeType model.
    if ((!this.feeType || String(this.feeType).trim() === '') && !this.feeTypeId) {
      errors.feeType = 'feeType (string) or feeTypeId (uuid) is required';
    }
    // if feeTypeId is provided, do a basic UUID-ish sanity check (optional)
    if (this.feeTypeId) {
      const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
      if (!uuidRegex.test(String(this.feeTypeId))) {
        errors.feeTypeId = 'feeTypeId must be a valid UUID';
      }
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
    this.perPage = Math.min(100, Math.max(1, Number(query.perPage) || 5));
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
