class AdminPaymentListDTO {
  constructor(query) {
    this.page = Math.max(1, Number(query.page) || 1);
    this.perPage = Math.min(100, Math.max(1, Number(query.perPage) || 20));
    this.q = query.q;
    this.status = query.status; // pending|approved|rejected|need_more_info|all
    this.semester = query.semester;
    this.startDate = query.startDate;
    this.endDate = query.endDate;
    this.sortBy = query.sortBy || 'paymentDate';
    this.sortDir = (query.sortDir || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
  }

  validate() {
    const errors = {};
    if (this.perPage <= 0 || this.perPage > 100) errors.perPage = 'perPage must be between 1 and 100';
    if (this.page <= 0) errors.page = 'page must be >= 1';
    if (this.startDate && isNaN(new Date(this.startDate).getTime())) errors.startDate = 'Invalid startDate';
    if (this.endDate && isNaN(new Date(this.endDate).getTime())) errors.endDate = 'Invalid endDate';
    if (this.startDate && this.endDate) {
      if (new Date(this.startDate) > new Date(this.endDate)) errors.dateRange = 'startDate must be <= endDate';
    }
    const allowed = ['pending', 'approved', 'rejected', 'need_more_info', 'all'];
    if (this.status && !allowed.includes(this.status)) errors.status = `status must be one of: ${allowed.join(',')}`;
    return { isValid: Object.keys(errors).length === 0, errors };
  }
}

class AdminPaymentActionDTO {
  constructor(body) {
    this.action = body.action; // approve|reject|need_more_info
    this.remarks = body.remarks || '';
    this.notifyStudent = typeof body.notifyStudent === 'undefined' ? true : Boolean(body.notifyStudent);
    this.expectedStatus = body.expectedStatus; // optional optimistic concurrency
  }

  validate() {
    const errors = {};
    const allowed = ['approve', 'reject', 'need_more_info'];
    if (!this.action || !allowed.includes(this.action)) errors.action = `action required and must be one of: ${allowed.join(',')}`;
    if (this.remarks && this.remarks.length > 1000) errors.remarks = 'remarks max length 1000 chars';
    return { isValid: Object.keys(errors).length === 0, errors };
  }
}

class AdminNoteDTO {
  constructor(body) {
    this.text = body.text || '';
  }
  validate() {
    const errors = {};
    if (!this.text || !this.text.trim()) errors.text = 'text is required';
    if (this.text && this.text.length > 1000) errors.text = 'text max length 1000 chars';
    return { isValid: Object.keys(errors).length === 0, errors };
  }
}

module.exports = { AdminPaymentListDTO, AdminPaymentActionDTO, AdminNoteDTO };
