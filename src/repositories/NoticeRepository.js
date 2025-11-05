const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class NoticeRepository {
  async findRecentForStudent(studentId, limit = 5) {
    // Find recent notices for students (targetAudience: students or all)
    return await prisma.notice.findMany({
      where: {
        isActive: true,
        OR: [
          { targetAudience: 'students' },
          { targetAudience: 'all' }
        ]
      },
      orderBy: [
        { priority: 'desc' }, // highlight > normal
        { createdAt: 'desc' }
      ],
      take: limit
    });
  }
  async findRecentForLecturer(lecturerId, limit = 5) {
    // Find recent notices created by this lecturer (userId)
    return await prisma.notice.findMany({
      where: {
        isActive: true,
        OR: [
          { targetAudience: 'admins' },
          { targetAudience: 'all' }
        ]
      },
      orderBy: [
        { priority: 'desc' }, // highlight > normal
        { createdAt: 'desc' }
      ],
      take: limit
    });
  }
  
  async create(noticeData, attachments = []) {
    const notice = await prisma.notice.create({
      data: {
        title: noticeData.title,
        content: noticeData.body,
        excerpt: noticeData.excerpt,
        category: noticeData.category,
        priority: noticeData.priority,
        status: noticeData.status,
        targetAudience: noticeData.audience[0], // Prisma enum expects single value
        tags: noticeData.tags,
        isPinned: noticeData.isPinned,
        startDate: noticeData.startDate,
        endDate: noticeData.endDate,
        createdBy: noticeData.createdBy,
        attachments: attachments.length > 0 ? {
          create: attachments.map(att => ({
            fileName: att.fileName,
            originalName: att.originalName,
            fileSize: att.fileSize,
            mimeType: att.mimeType,
            filePath: att.filePath || att.downloadUrl || att.fileName || 'unknown',
            downloadUrl: att.downloadUrl
          }))
        } : undefined
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true
          }
        },
        attachments: true,
        _count: {
          select: {
            reads: true
          }
        }
      }
    });

    return notice;
  }

  async findById(id, userId = null) {
    const notice = await prisma.notice.findUnique({
      where: { id },
      include: {
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true
          }
        },
        attachments: true,
        reads: userId ? {
          where: { userId }
        } : false,
        _count: {
          select: {
            reads: true
          }
        }
      }
    });

    if (notice && userId) {
      // Increment view count
      await this.incrementViewCount(id);
    }

    return notice;
  }

  async findMany(filters, userId = null, user = null) {
    const where = this.buildWhereClause(filters, userId, user);
    const orderBy = this.buildOrderByClause(filters.sortBy, filters.sortOrder);

    const [notices, total] = await Promise.all([
      prisma.notice.findMany({
        where,
        orderBy,
        skip: filters.getOffset(),
        take: filters.limit,
        include: {
          createdByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImage: true
            }
          },
          attachments: true,
          reads: userId ? {
            where: { userId }
          } : false,
          _count: {
            select: {
              reads: true
            }
          }
        }
      }),
      prisma.notice.count({ where })
    ]);

    return {
      notices,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit)
    };
  }

  async update(id, updateData, attachments = []) {
    // Map fields to match Prisma schema
    const mappedData = { ...updateData };
    
    // Map 'body' to 'content' to match Prisma schema
    if (mappedData.body !== undefined) {
      mappedData.content = mappedData.body;
      delete mappedData.body;
    }
    
    // Map 'audience' array to 'targetAudience' single value for Prisma enum
    if (mappedData.audience !== undefined && Array.isArray(mappedData.audience)) {
      mappedData.targetAudience = mappedData.audience[0];
      delete mappedData.audience;
    }

    // Handle attachments update
    const updatePayload = {
      data: {
        ...mappedData,
        updatedAt: new Date()
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true
          }
        },
        attachments: true,
        _count: {
          select: {
            reads: true
          }
        }
      }
    };

    // If attachments are provided, replace existing ones
    if (attachments.length > 0) {
      updatePayload.data.attachments = {
        deleteMany: {},  // Delete all existing attachments
        create: attachments.map(att => ({
          fileName: att.fileName,
          originalName: att.originalName,
          fileSize: att.fileSize,
          mimeType: att.mimeType,
          filePath: att.filePath || att.downloadUrl || att.fileName || 'unknown',
          downloadUrl: att.downloadUrl
        }))
      };
    }

    return await prisma.notice.update({
      where: { id },
      ...updatePayload
    });
  }

  async delete(id) {
    return await prisma.notice.delete({
      where: { id }
    });
  }

  async bulkUpdate(noticeIds, updateData) {
    return await prisma.notice.updateMany({
      where: {
        id: { in: noticeIds }
      },
      data: updateData
    });
  }

  async bulkDelete(noticeIds) {
    return await prisma.notice.deleteMany({
      where: {
        id: { in: noticeIds }
      }
    });
  }

  async markAsRead(noticeId, userId) {
    const existingRead = await prisma.noticeRead.findUnique({
      where: {
        noticeId_userId: {
          noticeId,
          userId
        }
      }
    });

    if (!existingRead) {
      await prisma.noticeRead.create({
        data: {
          noticeId,
          userId
        }
      });

      // Increment read count
      await prisma.notice.update({
        where: { id: noticeId },
        data: {
          readCount: {
            increment: 1
          }
        }
      });
    }

    return { readAt: new Date(), isNew: !existingRead };
  }

  async markAsUnread(noticeId, userId) {
    const deletedRead = await prisma.noticeRead.deleteMany({
      where: {
        noticeId,
        userId
      }
    });

    if (deletedRead.count > 0) {
      // Decrement read count
      await prisma.notice.update({
        where: { id: noticeId },
        data: {
          readCount: {
            decrement: 1
          }
        }
      });
    }

    return deletedRead.count > 0;
  }

  async bulkMarkAsRead(noticeIds, userId) {
    // Get notices that are not already read by this user
    const unreadNotices = await prisma.notice.findMany({
      where: {
        id: { in: noticeIds },
        reads: {
          none: {
            userId
          }
        }
      },
      select: { id: true }
    });

    if (unreadNotices.length > 0) {
      const unreadNoticeIds = unreadNotices.map(n => n.id);
      
      // Create read records
      await prisma.noticeRead.createMany({
        data: unreadNoticeIds.map(noticeId => ({
          noticeId,
          userId
        }))
      });

      // Increment read counts
      await prisma.notice.updateMany({
        where: {
          id: { in: unreadNoticeIds }
        },
        data: {
          readCount: {
            increment: 1
          }
        }
      });
    }

    return unreadNotices.length;
  }

  async bulkMarkAsUnread(noticeIds, userId) {
    const deletedReads = await prisma.noticeRead.deleteMany({
      where: {
        noticeId: { in: noticeIds },
        userId
      }
    });

    if (deletedReads.count > 0) {
      // Decrement read counts
      await prisma.notice.updateMany({
        where: {
          id: { in: noticeIds }
        },
        data: {
          readCount: {
            decrement: 1
          }
        }
      });
    }

    return deletedReads.count;
  }

  async incrementViewCount(noticeId) {
    return await prisma.notice.update({
      where: { id: noticeId },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });
  }

  buildRoleBasedWhere(user = null) {
    if (user && user.role === 'student') {
      return { targetAudience: { in: ['all', 'students'] } };
    } else if (user && ['admin', 'super_admin'].includes(user.role)) {
      return {
        OR: [
          { targetAudience: { in: ['all', 'admins'] } },
          { 
            targetAudience: 'students',
            createdBy: user.id
          }
        ]
      };
    }
    return {};
  }

  async getStats(userId = null, user = null) {
    // Base where clause for role-based filtering
    const roleWhere = this.buildRoleBasedWhere(user);

    const buildWhereWithRole = (additionalWhere = {}) => {
      if (Object.keys(roleWhere).length === 0) {
        return additionalWhere;
      }
      if (Object.keys(additionalWhere).length === 0) {
        return roleWhere;
      }
      return {
        AND: [
          roleWhere,
          additionalWhere
        ]
      };
    };

    const [
      total,
      published,
      draft,
      archived,
      unread,
      critical,
      high,
      normal,
      categoryStats
    ] = await Promise.all([
      prisma.notice.count({ where: roleWhere }),
      prisma.notice.count({ where: buildWhereWithRole({ status: 'published' }) }),
      prisma.notice.count({ where: buildWhereWithRole({ status: 'draft' }) }),
      prisma.notice.count({ where: buildWhereWithRole({ status: 'archived' }) }),
      userId ? prisma.notice.count({
        where: buildWhereWithRole({
          status: 'published',
          reads: {
            none: {
              userId
            }
          }
        })
      }) : 0,
      prisma.notice.count({ where: buildWhereWithRole({ priority: 'critical' }) }),
      prisma.notice.count({ where: buildWhereWithRole({ priority: 'high' }) }),
      prisma.notice.count({ where: buildWhereWithRole({ priority: 'normal' }) }),
      this.getCategoryStats(user)
    ]);

    return {
      total,
      published,
      draft,
      archived,
      unread,
      critical,
      high,
      normal,
      categoryStats
    };
  }

  async getCategoryStats(user = null) {
    const roleWhere = this.buildRoleBasedWhere(user);

    const stats = await prisma.notice.groupBy({
      by: ['category'],
      where: roleWhere,
      _count: {
        category: true
      }
    });

    return stats.reduce((acc, stat) => {
      acc[stat.category] = stat._count.category;
      return acc;
    }, {});
  }

  async getSearchSuggestions(query, limit = 5, user = null) {
    const suggestions = [];
    
    // Base where clause for role-based filtering
    const roleWhere = this.buildRoleBasedWhere(user);
    const baseWhere = { 
      status: 'published',
      ...(Object.keys(roleWhere).length > 0 ? { AND: [roleWhere] } : {})
    };

    // Title suggestions
    const titleMatches = await prisma.notice.findMany({
      where: {
        ...baseWhere,
        title: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select: { title: true },
      take: limit
    });

    titleMatches.forEach(notice => {
      suggestions.push({
        type: 'title',
        value: notice.title,
        count: 1
      });
    });

    // Tag suggestions
    const tagMatches = await prisma.notice.findMany({
      where: {
        ...baseWhere,
        tags: {
          hasSome: [query]
        }
      },
      select: { tags: true },
      take: limit
    });

    const tagCounts = {};
    tagMatches.forEach(notice => {
      notice.tags.forEach(tag => {
        if (tag.toLowerCase().includes(query.toLowerCase())) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      });
    });

    Object.entries(tagCounts).forEach(([tag, count]) => {
      suggestions.push({
        type: 'tag',
        value: tag,
        count
      });
    });

    return suggestions.slice(0, limit);
  }

  async getMetadata(user = null) {
    const [categories, priorities, audiences, allTags] = await Promise.all([
      this.getCategories(),
      this.getPriorities(),
      this.getAudiences(),
      this.getAllTags(user)
    ]);

    return {
      categories,
      priorities,
      audiences,
      tags: allTags
    };
  }

  getCategories() {
    return [
      { value: 'general', label: 'General', icon: 'info', color: '#6366f1' },
      { value: 'academic', label: 'Academic', icon: 'academic-cap', color: '#059669' },
      { value: 'finance', label: 'Finance', icon: 'currency-dollar', color: '#dc2626' },
      { value: 'event', label: 'Event', icon: 'calendar', color: '#7c3aed' },
      { value: 'emergency', label: 'Emergency', icon: 'exclamation-triangle', color: '#ea580c' }
    ];
  }

  getPriorities() {
    return [
      { value: 'normal', label: 'Normal', color: '#6b7280' },
      { value: 'high', label: 'High', color: '#f59e0b' },
      { value: 'critical', label: 'Critical', color: '#ef4444' }
    ];
  }

  getAudiences() {
    return [
      { value: 'all', label: 'Everyone', description: 'All users' },
      { value: 'students', label: 'Students', description: 'Student users only' },
      { value: 'admins', label: 'Admins', description: 'Admin users only' },
      { value: 'all_students', label: 'All Students', description: 'All student users' },
      { value: 'all_lecturers', label: 'All Lecturers', description: 'All lecturer users' }
    ];
  }

  async getAllTags(user = null) {
    const roleWhere = this.buildRoleBasedWhere(user);
    const where = { 
      status: 'published',
      ...(Object.keys(roleWhere).length > 0 ? { AND: [roleWhere] } : {})
    };

    const notices = await prisma.notice.findMany({
      select: { tags: true },
      where
    });

    const allTags = notices.reduce((acc, notice) => {
      notice.tags.forEach(tag => acc.add(tag));
      return acc;
    }, new Set());

    return Array.from(allTags).sort();
  }

  buildWhereClause(filters, userId, user = null) {
    const conditions = [];

    // Role-based audience filtering
    const roleWhere = this.buildRoleBasedWhere(user);
    if (Object.keys(roleWhere).length > 0) {
      conditions.push(roleWhere);
    }

    // Search in title and content
    if (filters.search) {
      conditions.push({
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { content: { contains: filters.search, mode: 'insensitive' } }
        ]
      });
    }

    // Category filter
    if (filters.category.length > 0) {
      conditions.push({ category: { in: filters.category } });
    }

    // Priority filter
    if (filters.priority.length > 0) {
      conditions.push({ priority: { in: filters.priority } });
    }

    // Status filter
    if (filters.status.length > 0) {
      conditions.push({ status: { in: filters.status } });
    }

    // Audience filter - only apply if not already restricted by role
    if (filters.audience.length > 0 && (!user || !['student', 'admin', 'super_admin'].includes(user.role))) {
      conditions.push({ targetAudience: { in: filters.audience } });
    }

    // Tags filter
    if (filters.tags.length > 0) {
      conditions.push({ tags: { hasSome: filters.tags } });
    }

    // Pinned filter
    if (filters.isPinned !== undefined) {
      conditions.push({ isPinned: filters.isPinned });
    }

    // Author filter
    if (filters.author) {
      conditions.push({ createdBy: filters.author });
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      const dateCondition = {};
      if (filters.dateFrom) {
        dateCondition.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        dateCondition.lte = filters.dateTo;
      }
      conditions.push({ createdAt: dateCondition });
    }

    // Read/Unread filter for specific user
    if (filters.isRead !== undefined && userId) {
      if (filters.isRead) {
        conditions.push({ reads: { some: { userId } } });
      } else {
        conditions.push({ reads: { none: { userId } } });
      }
    }

    // Combine all conditions
    if (conditions.length === 0) {
      return {};
    } else if (conditions.length === 1) {
      return conditions[0];
    } else {
      return { AND: conditions };
    }
  }

  buildOrderByClause(sortBy, sortOrder) {
    const orderBy = [];
    
    switch (sortBy) {
      case 'priority':
        // Custom priority ordering: critical > high > normal
        // Use custom ordering for priority
        orderBy.push({
          priority: sortOrder === 'asc' 
            ? 'asc' 
            : 'desc'
        });
        break;
      case 'title':
        orderBy.push({ title: sortOrder });
        break;
      case 'publishDate':
        orderBy.push({ publishDate: sortOrder });
        break;
      case 'updatedAt':
        orderBy.push({ updatedAt: sortOrder });
        break;
      default:
        orderBy.push({ createdAt: sortOrder });
    }

    // Always add a secondary sort by createdAt for consistent ordering
    if (sortBy !== 'createdAt') {
      orderBy.push({ createdAt: 'desc' });
    }

    return orderBy;
  }
}

module.exports = NoticeRepository;