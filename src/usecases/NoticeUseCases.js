const NoticeRepository = require('../repositories/NoticeRepository');
const { CreateNoticeDTO, UpdateNoticeDTO, NoticeFilterDTO, BulkActionDTO, NoticeResponseDTO, NoticeStatsDTO } = require('../dto/NoticeDTO');

class CreateNoticeUseCase {
  constructor() {
    this.noticeRepository = new NoticeRepository();
  }

  async execute(data, user, attachments = []) {
    const createNoticeDTO = new CreateNoticeDTO(data);
    const validation = createNoticeDTO.validate();

    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    createNoticeDTO.createdBy = user.id;

    try {
      const notice = await this.noticeRepository.create(createNoticeDTO, attachments);
      return new NoticeResponseDTO(notice);
    } catch (error) {
      throw new Error(`Failed to create notice: ${error.message}`);
    }
  }
}

class GetNoticesUseCase {
  constructor() {
    this.noticeRepository = new NoticeRepository();
  }

  async execute(query, user) {
    const filterDTO = new NoticeFilterDTO(query);
    const validation = filterDTO.validate();

    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    try {
      const result = await this.noticeRepository.findMany(filterDTO, user?.id);
      
      const notices = result.notices.map(notice => 
        new NoticeResponseDTO(notice, user, true)
      );

      // Get aggregations
      const aggregations = await this.getAggregations(filterDTO, user?.id);

      return {
        notices,
        pagination: {
          currentPage: result.page,
          totalPages: result.totalPages,
          totalItems: result.total,
          hasNext: result.page < result.totalPages,
          hasPrev: result.page > 1
        },
        aggregations
      };
    } catch (error) {
      throw new Error(`Failed to get notices: ${error.message}`);
    }
  }

  async getAggregations(filters, userId) {
    const stats = await this.noticeRepository.getStats(userId);
    return {
      categoryCount: stats.categoryStats,
      priorityCount: {
        normal: stats.normal,
        high: stats.high,
        critical: stats.critical
      },
      statusCount: {
        published: stats.published,
        draft: stats.draft,
        archived: stats.archived
      },
      totalUnread: stats.unread
    };
  }
}

class GetNoticeByIdUseCase {
  constructor() {
    this.noticeRepository = new NoticeRepository();
  }

  async execute(id, user) {
    try {
      const notice = await this.noticeRepository.findById(id, user?.id);
      
      if (!notice) {
        throw new Error('Notice not found');
      }

      return new NoticeResponseDTO(notice, user, true);
    } catch (error) {
      throw new Error(`Failed to get notice: ${error.message}`);
    }
  }
}

class UpdateNoticeUseCase {
  constructor() {
    this.noticeRepository = new NoticeRepository();
  }

  async execute(id, data, user, attachments = []) {
    const updateNoticeDTO = new UpdateNoticeDTO(data);
    const validation = updateNoticeDTO.validate();

    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    try {
      // Check if notice exists and user has permission
      const existingNotice = await this.noticeRepository.findById(id);
      if (!existingNotice) {
        throw new Error('Notice not found');
      }

      // Check ownership or admin permission
      if (existingNotice.createdBy !== user.id && !['super_admin', 'admin'].includes(user.role)) {
        throw new Error('Unauthorized to update this notice');
      }

      const updatedNotice = await this.noticeRepository.update(id, updateNoticeDTO, attachments);
      return new NoticeResponseDTO(updatedNotice);
    } catch (error) {
      throw new Error(`Failed to update notice: ${error.message}`);
    }
  }
}

class DeleteNoticeUseCase {
  constructor() {
    this.noticeRepository = new NoticeRepository();
  }

  async execute(id, user) {
    try {
      // Check if notice exists and user has permission
      const existingNotice = await this.noticeRepository.findById(id);
      if (!existingNotice) {
        throw new Error('Notice not found');
      }

      // Check ownership or admin permission
      if (existingNotice.createdBy !== user.id && !['super_admin', 'admin'].includes(user.role)) {
        throw new Error('Unauthorized to delete this notice');
      }

      await this.noticeRepository.delete(id);
      return { success: true, message: 'Notice deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete notice: ${error.message}`);
    }
  }
}

class BulkActionUseCase {
  constructor() {
    this.noticeRepository = new NoticeRepository();
  }

  async execute(data, user) {
    const bulkActionDTO = new BulkActionDTO(data);
    const validation = bulkActionDTO.validate();

    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    try {
      let result;
      const { action, noticeIds } = bulkActionDTO;

      switch (action) {
        case 'delete':
          result = await this.handleBulkDelete(noticeIds, user);
          break;
        case 'markRead':
          result = await this.handleBulkMarkRead(noticeIds, user);
          break;
        case 'markUnread':
          result = await this.handleBulkMarkUnread(noticeIds, user);
          break;
        case 'pin':
          result = await this.handleBulkPin(noticeIds, user, true);
          break;
        case 'unpin':
          result = await this.handleBulkPin(noticeIds, user, false);
          break;
        case 'archive':
          result = await this.handleBulkStatusUpdate(noticeIds, user, 'archived');
          break;
        case 'unarchive':
          result = await this.handleBulkStatusUpdate(noticeIds, user, 'published');
          break;
        case 'publish':
          result = await this.handleBulkStatusUpdate(noticeIds, user, 'published');
          break;
        case 'unpublish':
          result = await this.handleBulkStatusUpdate(noticeIds, user, 'draft');
          break;
        case 'draft':
          result = await this.handleBulkStatusUpdate(noticeIds, user, 'draft');
          break;
        default:
          throw new Error('Invalid bulk action');
      }

      return result;
    } catch (error) {
      throw new Error(`Bulk action failed: ${error.message}`);
    }
  }

  async handleBulkDelete(noticeIds, user) {
    // Check permissions for each notice
    const notices = await Promise.all(
      noticeIds.map(id => this.noticeRepository.findById(id))
    );

    const unauthorizedNotices = notices.filter(notice => 
      notice && notice.createdBy !== user.id && !['super_admin', 'admin'].includes(user.role)
    );

    if (unauthorizedNotices.length > 0) {
      throw new Error('Unauthorized to delete some notices');
    }

    const result = await this.noticeRepository.bulkDelete(noticeIds);
    return {
      success: true,
      message: `${result.count} notices deleted successfully`,
      affectedCount: result.count
    };
  }

  async handleBulkMarkRead(noticeIds, user) {
    const count = await this.noticeRepository.bulkMarkAsRead(noticeIds, user.id);
    return {
      success: true,
      message: `${count} notices marked as read`,
      affectedCount: count
    };
  }

  async handleBulkMarkUnread(noticeIds, user) {
    const count = await this.noticeRepository.bulkMarkAsUnread(noticeIds, user.id);
    return {
      success: true,
      message: `${count} notices marked as unread`,
      affectedCount: count
    };
  }

  async handleBulkPin(noticeIds, user, isPinned) {
    const result = await this.noticeRepository.bulkUpdate(noticeIds, { isPinned });
    const action = isPinned ? 'pinned' : 'unpinned';
    return {
      success: true,
      message: `${result.count} notices ${action} successfully`,
      affectedCount: result.count
    };
  }

  async handleBulkStatusUpdate(noticeIds, user, status) {
    const result = await this.noticeRepository.bulkUpdate(noticeIds, { status });
    return {
      success: true,
      message: `${result.count} notices updated to ${status} status`,
      affectedCount: result.count
    };
  }
}

class MarkNoticeAsReadUseCase {
  constructor() {
    this.noticeRepository = new NoticeRepository();
  }

  async execute(noticeId, user) {
    try {
      const notice = await this.noticeRepository.findById(noticeId);
      if (!notice) {
        throw new Error('Notice not found');
      }

      const result = await this.noticeRepository.markAsRead(noticeId, user.id);
      
      // Get updated read count
      const updatedNotice = await this.noticeRepository.findById(noticeId);
      
      return {
        success: true,
        data: {
          readAt: result.readAt.toISOString(),
          readCount: updatedNotice.readCount,
          isNew: result.isNew
        }
      };
    } catch (error) {
      throw new Error(`Failed to mark notice as read: ${error.message}`);
    }
  }
}

class MarkNoticeAsUnreadUseCase {
  constructor() {
    this.noticeRepository = new NoticeRepository();
  }

  async execute(noticeId, user) {
    try {
      const notice = await this.noticeRepository.findById(noticeId);
      if (!notice) {
        throw new Error('Notice not found');
      }

      const result = await this.noticeRepository.markAsUnread(noticeId, user.id);
      
      return {
        success: true,
        data: {
          message: 'Notice marked as unread successfully'
        }
      };
    } catch (error) {
      throw new Error(`Failed to mark notice as unread: ${error.message}`);
    }
  }
}

class GetNoticeStatsUseCase {
  constructor() {
    this.noticeRepository = new NoticeRepository();
  }

  async execute(user) {
    try {
      const stats = await this.noticeRepository.getStats(user?.id);
      return new NoticeStatsDTO(stats);
    } catch (error) {
      throw new Error(`Failed to get notice stats: ${error.message}`);
    }
  }
}

class GetSearchSuggestionsUseCase {
  constructor() {
    this.noticeRepository = new NoticeRepository();
  }

  async execute(query, limit = 5) {
    try {
      if (!query || query.trim().length < 2) {
        return { suggestions: [] };
      }

      const suggestions = await this.noticeRepository.getSearchSuggestions(query.trim(), limit);
      return { suggestions };
    } catch (error) {
      throw new Error(`Failed to get search suggestions: ${error.message}`);
    }
  }
}

class GetNoticeMetadataUseCase {
  constructor() {
    this.noticeRepository = new NoticeRepository();
  }

  async execute() {
    try {
      const metadata = await this.noticeRepository.getMetadata();
      return metadata;
    } catch (error) {
      throw new Error(`Failed to get notice metadata: ${error.message}`);
    }
  }
}

module.exports = {
  CreateNoticeUseCase,
  GetNoticesUseCase,
  GetNoticeByIdUseCase,
  UpdateNoticeUseCase,
  DeleteNoticeUseCase,
  BulkActionUseCase,
  MarkNoticeAsReadUseCase,
  MarkNoticeAsUnreadUseCase,
  GetNoticeStatsUseCase,
  GetSearchSuggestionsUseCase,
  GetNoticeMetadataUseCase
};