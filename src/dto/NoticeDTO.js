class CreateNoticeDTO {
  constructor(data) {
    this.title = data.title;
    this.body = data.body;
    this.category = data.category || 'general';
    this.priority = data.priority || 'normal';
    this.audience = Array.isArray(data.audience) ? data.audience : [data.audience || 'all'];
    this.tags = Array.isArray(data.tags) ? data.tags : [];
    this.startDate = data.startDate ? new Date(data.startDate) : null;
    this.endDate = data.endDate ? new Date(data.endDate) : null;
    this.isPinned = Boolean(data.isPinned);
    this.status = data.status || 'draft';
    this.attachments = Array.isArray(data.attachments) ? data.attachments : [];
    this.excerpt = data.excerpt || this.generateExcerpt(data.body);
  }

  generateExcerpt(content, maxLength = 150) {
    if (!content) return '';
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...'
      : plainText;
  }

  validate() {
    const errors = [];

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!this.body || this.body.trim().length === 0) {
      errors.push('Body is required');
    }

    if (this.title && this.title.length > 200) {
      errors.push('Title must be less than 200 characters');
    }

    const validCategories = ['general', 'academic', 'finance', 'event', 'emergency'];
    if (!validCategories.includes(this.category)) {
      errors.push('Invalid category');
    }

    const validPriorities = ['normal', 'high', 'critical'];
    if (!validPriorities.includes(this.priority)) {
      errors.push('Invalid priority');
    }

    const validAudiences = ['all', 'students', 'admins', 'all_students', 'all_lecturers'];
    const invalidAudiences = this.audience.filter(aud => !validAudiences.includes(aud));
    if (invalidAudiences.length > 0) {
      errors.push(`Invalid audience values: ${invalidAudiences.join(', ')}`);
    }

    const validStatuses = ['published', 'draft', 'archived'];
    if (!validStatuses.includes(this.status)) {
      errors.push('Invalid status');
    }

    if (this.startDate && this.endDate && this.startDate >= this.endDate) {
      errors.push('End date must be after start date');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
}

class UpdateNoticeDTO {
  constructor(data) {
    if (data.title !== undefined) this.title = data.title;
    if (data.body !== undefined) this.body = data.body;
    if (data.category !== undefined) this.category = data.category;
    if (data.priority !== undefined) this.priority = data.priority;
    if (data.audience !== undefined) {
      this.audience = Array.isArray(data.audience) ? data.audience : [data.audience];
    }
    if (data.tags !== undefined) {
      this.tags = Array.isArray(data.tags) ? data.tags : [];
    }
    if (data.startDate !== undefined) {
      this.startDate = data.startDate ? new Date(data.startDate) : null;
    }
    if (data.endDate !== undefined) {
      this.endDate = data.endDate ? new Date(data.endDate) : null;
    }
    if (data.isPinned !== undefined) this.isPinned = Boolean(data.isPinned);
    if (data.status !== undefined) this.status = data.status;
    if (data.attachments !== undefined) {
      this.attachments = Array.isArray(data.attachments) ? data.attachments : [];
    }
    if (data.excerpt !== undefined) this.excerpt = data.excerpt;
    
    // Auto-generate excerpt if body is updated but excerpt is not provided
    if (data.body !== undefined && data.excerpt === undefined) {
      this.excerpt = this.generateExcerpt(data.body);
    }
  }

  generateExcerpt(content, maxLength = 150) {
    if (!content) return '';
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...'
      : plainText;
  }

  validate() {
    const errors = [];

    if (this.title !== undefined && (!this.title || this.title.trim().length === 0)) {
      errors.push('Title cannot be empty');
    }

    if (this.body !== undefined && (!this.body || this.body.trim().length === 0)) {
      errors.push('Body cannot be empty');
    }

    if (this.title && this.title.length > 200) {
      errors.push('Title must be less than 200 characters');
    }

    if (this.category !== undefined) {
      const validCategories = ['general', 'academic', 'finance', 'event', 'emergency'];
      if (!validCategories.includes(this.category)) {
        errors.push('Invalid category');
      }
    }

    if (this.priority !== undefined) {
      const validPriorities = ['normal', 'high', 'critical'];
      if (!validPriorities.includes(this.priority)) {
        errors.push('Invalid priority');
      }
    }

    if (this.audience !== undefined) {
      const validAudiences = ['all', 'students', 'admins', 'all_students', 'all_lecturers'];
      const invalidAudiences = this.audience.filter(aud => !validAudiences.includes(aud));
      if (invalidAudiences.length > 0) {
        errors.push(`Invalid audience values: ${invalidAudiences.join(', ')}`);
      }
    }

    if (this.status !== undefined) {
      const validStatuses = ['published', 'draft', 'archived'];
      if (!validStatuses.includes(this.status)) {
        errors.push('Invalid status');
      }
    }

    if (this.startDate !== undefined && this.endDate !== undefined && 
        this.startDate && this.endDate && this.startDate >= this.endDate) {
      errors.push('End date must be after start date');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
}

class NoticeFilterDTO {
  constructor(query) {
    this.page = Math.max(1, parseInt(query.page) || 1);
    this.limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    this.search = query.search?.trim() || '';
    this.category = this.parseArrayParam(query.category);
    this.priority = this.parseArrayParam(query.priority);
    this.status = this.parseArrayParam(query.status);
    this.audience = this.parseArrayParam(query.audience);
    this.tags = this.parseArrayParam(query.tags);
    
    // Fix: Handle null, undefined, and string values properly
    this.isPinned = this.parseBooleanParam(query.isPinned);
    this.isRead = this.parseBooleanParam(query.isRead);
    
    this.author = query.author?.trim() || '';
    this.dateFrom = query.dateFrom ? new Date(query.dateFrom) : null;
    this.dateTo = query.dateTo ? new Date(query.dateTo) : null;
    this.sortBy = query.sortBy || 'createdAt';
    this.sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
  }

  parseArrayParam(param) {
    if (!param) return [];
    if (Array.isArray(param)) return param;
    return param.split(',').map(item => item.trim()).filter(item => item);
  }

  parseBooleanParam(param) {
    // Handle null, undefined, and various string representations
    if (param === null || param === undefined || param === 'null' || param === 'undefined' || param === '') {
      return undefined; // Don't filter by this field
    }
    
    if (typeof param === 'boolean') {
      return param;
    }
    
    if (typeof param === 'string') {
      const lowerParam = param.toLowerCase();
      if (lowerParam === 'true') return true;
      if (lowerParam === 'false') return false;
      return undefined; // Invalid value, don't filter
    }
    
    return undefined; // Default: don't filter
  }

  getOffset() {
    return (this.page - 1) * this.limit;
  }

  validate() {
    const errors = [];

    const validSortBy = ['createdAt', 'updatedAt', 'title', 'priority', 'publishDate'];
    if (!validSortBy.includes(this.sortBy)) {
      errors.push('Invalid sortBy value');
    }

    if (this.dateFrom && this.dateTo && this.dateFrom >= this.dateTo) {
      errors.push('dateFrom must be before dateTo');
    }

    const validCategories = ['general', 'academic', 'finance', 'event', 'emergency'];
    const invalidCategories = this.category.filter(cat => !validCategories.includes(cat));
    if (invalidCategories.length > 0) {
      errors.push(`Invalid category values: ${invalidCategories.join(', ')}`);
    }

    const validPriorities = ['normal', 'high', 'critical'];
    const invalidPriorities = this.priority.filter(pri => !validPriorities.includes(pri));
    if (invalidPriorities.length > 0) {
      errors.push(`Invalid priority values: ${invalidPriorities.join(', ')}`);
    }

    const validStatuses = ['published', 'draft', 'archived'];
    const invalidStatuses = this.status.filter(stat => !validStatuses.includes(stat));
    if (invalidStatuses.length > 0) {
      errors.push(`Invalid status values: ${invalidStatuses.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
}

class BulkActionDTO {
  constructor(data) {
    this.action = data.action;
    this.noticeIds = Array.isArray(data.noticeIds) ? data.noticeIds : [];
    this.data = data.data || {};
  }

  validate() {
    const errors = [];

    const validActions = ['delete', 'markRead', 'markUnread', 'pin', 'unpin', 'archive', 'unarchive', 'publish', 'unpublish', 'draft'];
    if (!validActions.includes(this.action)) {
      errors.push('Invalid action');
    }

    if (!Array.isArray(this.noticeIds) || this.noticeIds.length === 0) {
      errors.push('noticeIds must be a non-empty array');
    }

    // Validate UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const invalidIds = this.noticeIds.filter(id => !uuidRegex.test(id));
    if (invalidIds.length > 0) {
      errors.push('Invalid notice IDs format');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
}

class NoticeResponseDTO {
  constructor(notice, user = null, includeReadStatus = false) {
    this.id = notice.id;
    this.title = notice.title;
    this.body = notice.content;
    this.excerpt = notice.excerpt;
    this.category = notice.category;
    this.priority = notice.priority;
    this.status = notice.status;
    this.audience = Array.isArray(notice.targetAudience) ? notice.targetAudience : [notice.targetAudience];
    this.tags = notice.tags || [];
    this.startDate = notice.startDate?.toISOString();
    this.endDate = notice.endDate?.toISOString();
    this.isPinned = notice.isPinned;
    this.viewCount = notice.viewCount || 0;
    this.readCount = notice.readCount || 0;
    this.createdAt = notice.createdAt?.toISOString();
    this.updatedAt = notice.updatedAt?.toISOString();

    // Author information
    if (notice.createdByUser) {
      this.author = {
        id: notice.createdByUser.id,
        name: `${notice.createdByUser.firstName} ${notice.createdByUser.lastName}`,
        email: notice.createdByUser.email,
        avatar: notice.createdByUser.profileImage
      };
    }

    // Attachments
    if (notice.attachments) {
      this.attachments = notice.attachments.map(att => ({
        id: att.id,
        fileName: att.fileName,
        originalName: att.originalName,
        fileSize: att.fileSize,
        mimeType: att.mimeType,
        downloadUrl: att.downloadUrl || `/api/files/download/${att.id}`
      }));
    }

    // Read status for current user
    if (includeReadStatus && user) {
      const userRead = notice.reads?.find(read => read.userId === user.id);
      this.isRead = !!userRead;
      this.readAt = userRead?.readAt?.toISOString();
    }
  }
}

class NoticeStatsDTO {
  constructor(stats) {
    this.total = stats.total || 0;
    this.published = stats.published || 0;
    this.draft = stats.draft || 0;
    this.archived = stats.archived || 0;
    this.unread = stats.unread || 0;
    this.critical = stats.critical || 0;
    this.high = stats.high || 0;
    this.normal = stats.normal || 0;
    this.categoryStats = stats.categoryStats || {};
    this.recentActivity = stats.recentActivity || [];
  }
}

module.exports = {
  CreateNoticeDTO,
  UpdateNoticeDTO,
  NoticeFilterDTO,
  BulkActionDTO,
  NoticeResponseDTO,
  NoticeStatsDTO
};