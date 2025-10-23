class FeeTypeCreateDTO {
  constructor(body) {
    this.name = body.name && String(body.name).trim();
    this.defaultAmount = typeof body.defaultAmount !== 'undefined' ? Number(body.defaultAmount) : null;
    this.code = body.code ? String(body.code).trim() : null;
    this.description = body.description ? String(body.description).trim() : null;
    this.isActive = typeof body.isActive === 'undefined' ? true : Boolean(body.isActive);
  }

  validate() {
    const errors = {};
    if (!this.name) errors.name = 'name is required';
    if (this.defaultAmount !== null && (Number.isNaN(this.defaultAmount) || this.defaultAmount < 0)) errors.defaultAmount = 'defaultAmount must be a non-negative number';
    if (this.code && this.code.length > 50) errors.code = 'code max length 50 chars';
    if (this.description && this.description.length > 2000) errors.description = 'description max length 2000 chars';
    return { isValid: Object.keys(errors).length === 0, errors };
  }
}

class FeeTypeListQueryDTO {
  constructor(query) {
    this.page = Math.max(1, Number(query.page) || 1);
    this.perPage = Math.min(100, Math.max(1, Number(query.perPage) || 20));
    this.q = query.q;
    this.active = typeof query.active === 'undefined' ? undefined : (String(query.active) === 'true');
  }

  validate() {
    const errors = {};
    if (this.page <= 0) errors.page = 'page must be >= 1';
    if (this.perPage <= 0 || this.perPage > 100) errors.perPage = 'perPage must be between 1 and 100';
    return { isValid: Object.keys(errors).length === 0, errors };
  }
}

module.exports = { FeeTypeCreateDTO, FeeTypeListQueryDTO };
