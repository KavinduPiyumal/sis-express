const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class LinkRepository {
  async findHighlightsForStudent(studentId, limit = 5) {
    // Get all links for students, but order by highlight first, then createdAt desc
    return await prisma.link.findMany({
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
  async findHighlightsForLecturer(lecturerId, limit = 5) {
    // Find highlighted links for admins/lecturers (priority: highlight, targetAudience: admins or all)
    return await prisma.link.findMany({
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
  async create(data) {
    try {
      return await prisma.link.create({
        data,
        include: {
          createdByUser: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Failed to create link: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      return await prisma.link.findUnique({
        where: { id },
        include: {
          createdByUser: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Failed to find link by ID: ${error.message}`);
    }
  }

  async findMany(filters = {}, options = {}, requestUserId = null) {
    try {
      const {
        category,
        priority,
        targetAudience,
        isActive,
        search,
        createdBy,
        includeExpired = false,
      } = filters;

      const {
        page = 1,
        limit = 10,
        sortBy = 'order',
        sortOrder = 'asc',
      } = options;

      const where = {};
      const now = new Date();

      // Basic filters
      if (category) where.category = category;
      if (priority) where.priority = priority;
      if (targetAudience) where.targetAudience = targetAudience;
      if (isActive !== undefined) where.isActive = isActive;
      if (createdBy) where.createdBy = createdBy;

      // Date filters - only show active links unless includeExpired is true
      // Exception: if caller is filtering by createdBy, include that user's links
      // even if their startDate is in the future or endDate is in the past.
      if (!includeExpired) {
        const startOr = [
          { startDate: null },
          { startDate: { lte: now } },
        ];

        const endOr = [
          { endDate: null },
          { endDate: { gte: now } },
        ];

        // allow bypass if caller explicitly filters by createdBy
        if (createdBy) {
          startOr.push({ createdBy });
          endOr.push({ createdBy });
        }

        // or allow bypass when the requesting user is the creator (implicit)
        if (requestUserId) {
          startOr.push({ createdBy: requestUserId });
          endOr.push({ createdBy: requestUserId });
        }

        where.AND = [
          { OR: startOr },
          { OR: endOr },
        ];
      }

      // Search filter
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } },
        ];
      }

      const orderBy = {};
      orderBy[sortBy] = sortOrder;

      const skip = (page - 1) * limit;

      const [links, total] = await Promise.all([
        prisma.link.findMany({
          where,
          include: {
            createdByUser: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.link.count({ where }),
      ]);

      return {
        links,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrevious: page > 1,
        },
      };
    } catch (error) {
      throw new Error(`Failed to find links: ${error.message}`);
    }
  }

  async findActiveByTargetAudience(targetAudience, options = {}) {
    try {
      const now = new Date();
      const {
        category,
        priority,
        sortBy = 'order',
        sortOrder = 'asc',
      } = options;

      // Build date-aware where clause; allow creator to see their own future/expired links
      const startOr = [
        { startDate: null },
        { startDate: { lte: now } },
      ];

      const endOr = [
        { endDate: null },
        { endDate: { gte: now } },
      ];

      if (options.createdBy) {
        startOr.push({ createdBy: options.createdBy });
        endOr.push({ createdBy: options.createdBy });
      }

      const where = {
        isActive: true,
        AND: [
          { OR: startOr },
          { OR: endOr },
          { OR: [ { targetAudience: 'all' }, { targetAudience } ] },
        ],
      };

      if (category) where.category = category;
      if (priority) where.priority = priority;

      const orderBy = {};
      orderBy[sortBy] = sortOrder;

      return await prisma.link.findMany({
        where,
        include: {
          createdByUser: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy,
      });
    } catch (error) {
      throw new Error(`Failed to find active links: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      return await prisma.link.update({
        where: { id },
        data,
        include: {
          createdByUser: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Link not found');
      }
      throw new Error(`Failed to update link: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      return await prisma.link.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Link not found');
      }
      throw new Error(`Failed to delete link: ${error.message}`);
    }
  }

  async updateOrder(linkUpdates) {
    try {
      const updatePromises = linkUpdates.map(({ id, order }) =>
        prisma.link.update({
          where: { id },
          data: { order },
        })
      );

      return await Promise.all(updatePromises);
    } catch (error) {
      throw new Error(`Failed to update link orders: ${error.message}`);
    }
  }

  async getCategories() {
    try {
      const categories = await prisma.link.findMany({
        select: { category: true },
        where: {
          category: { not: null },
          isActive: true,
        },
        distinct: ['category'],
      });

      return categories
        .map(item => item.category)
        .filter(Boolean)
        .sort();
    } catch (error) {
      throw new Error(`Failed to get categories: ${error.message}`);
    }
  }

  async getStatistics() {
    try {
      // default: no filters
      return await this.getStatisticsWithFilters({}, null);
    } catch (error) {
      throw new Error(`Failed to get statistics: ${error.message}`);
    }
  }

  // New: statistics with optional filters and requestUserId to allow creator bypass
  async getStatisticsWithFilters(filters = {}, requestUserId = null, userRole = null) {
    try {
      const { createdBy, includeExpired = false, targetAudience } = filters;
      const now = new Date();
      const where = {};

      // LOGGING: Show scenario context
      // eslint-disable-next-line no-console
      console.log('[LinkStats] userRole:', userRole, 'requestUserId:', requestUserId, 'targetAudience:', targetAudience, 'createdBy:', createdBy);

      // Scenario logic
      if (userRole === 'admin' || userRole === 'super_admin') {
        if (targetAudience === 'students') {
          // Only links created by this admin
          where.targetAudience = 'students';
          if (requestUserId) where['createdByUser.id'] = requestUserId;
        } else if (targetAudience === 'admins' || targetAudience === 'all') {
          where.targetAudience = targetAudience;
        } else if (targetAudience) {
          // If some other audience, restrict to that
          where.targetAudience = targetAudience;
        } else {
          // If no targetAudience, restrict to admins and all
          where.targetAudience = { in: ['admins', 'all'] };
        }
      } else if (userRole === 'student') {
        // Students: only 'students' and 'all' allowed
        if (targetAudience === 'students' || targetAudience === 'all') {
          where.targetAudience = targetAudience;
        } else {
          // If not allowed, return zero stats
          // eslint-disable-next-line no-console
          console.log('[LinkStats] Student role, forbidden targetAudience:', targetAudience);
          return { total: 0, active: 0, inactive: 0, totalViews: 0, byPriority: {}, byTargetAudience: {}, byCategory: {} };
        }
      } else {
        // Default: just filter by targetAudience if present
        if (targetAudience) where.targetAudience = targetAudience;
      }

  if (createdBy) where.createdBy = createdBy;

  // LOGGING: Show where filter before date logic
  // eslint-disable-next-line no-console
  console.log('[LinkStats] where filter before date logic:', JSON.stringify(where));

      if (!includeExpired) {
        const startOr = [
          { startDate: null },
          { startDate: { lte: now } },
        ];
        const endOr = [
          { endDate: null },
          { endDate: { gte: now } },
        ];

        // allow bypass when caller explicitly filtered by createdBy
        if (createdBy) {
          startOr.push({ createdBy });
          endOr.push({ createdBy });
        }

        // or allow bypass when the requesting user is the creator (implicit)
        if (requestUserId) {
          startOr.push({ createdBy: requestUserId });
          endOr.push({ createdBy: requestUserId });
        }

        where.AND = [
          { OR: startOr },
          { OR: endOr },
        ];
      }

      // LOGGING: Show final where filter
      // eslint-disable-next-line no-console
      console.log('[LinkStats] FINAL where filter:', JSON.stringify(where));

      const [
        total,
        active,
        totalViews,
        byPriority,
        byTargetAudience,
        byCategory,
      ] = await Promise.all([
        prisma.link.count({ where }),
        prisma.link.count({ where: { ...where, isActive: true } }),
        prisma.link.aggregate({ where, _sum: { viewCount: true } }),
        prisma.link.groupBy({ by: ['priority'], _count: { priority: true }, where }),
        prisma.link.groupBy({ by: ['targetAudience'], _count: { targetAudience: true }, where }),
        prisma.link.groupBy({ by: ['category'], _count: { category: true }, where: { ...where, category: { not: null } } }),
      ]);

      return {
        total,
        active,
        inactive: total - active,
        totalViews: totalViews._sum.viewCount || 0,
        byPriority: byPriority.reduce((acc, item) => {
          acc[item.priority] = item._count.priority;
          return acc;
        }, {}),
        byTargetAudience: byTargetAudience.reduce((acc, item) => {
          acc[item.targetAudience] = item._count.targetAudience;
          return acc;
        }, {}),
        byCategory: byCategory.reduce((acc, item) => {
          acc[item.category] = item._count.category;
          return acc;
        }, {}),
      };
    } catch (error) {
      throw new Error(`Failed to get statistics: ${error.message}`);
    }
  }

  async exists(id) {
    try {
      const count = await prisma.link.count({
        where: { id },
      });
      return count > 0;
    } catch (error) {
      throw new Error(`Failed to check if link exists: ${error.message}`);
    }
  }

  async incrementViewCount(id) {
    try {
      return await prisma.link.update({
        where: { id },
        data: {
          viewCount: {
            increment: 1,
          },
        },
        include: {
          createdByUser: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Link not found');
      }
      throw new Error(`Failed to increment view count: ${error.message}`);
    }
  }

  // Per-user view tracking methods for NEW badge functionality
  async createUserView(linkId, userId) {
    try {
      return await prisma.linkView.create({
        data: {
          linkId,
          userId
        }
      });
    } catch (error) {
      // If view already exists, ignore the error (unique constraint violation)
      if (error.code === 'P2002') {
        return null;
      }
      throw error;
    }
  }

  async checkUserHasViewed(linkId, userId) {
    try {
      const view = await prisma.linkView.findUnique({
        where: {
          linkId_userId: {
            linkId,
            userId
          }
        }
      });
      return !!view;
    } catch (error) {
      throw new Error(`Failed to check user view: ${error.message}`);
    }
  }

  async recordUserView(linkId, userId) {
    try {
      // Create user view record and increment total view count
      await this.createUserView(linkId, userId);
      return this.incrementViewCount(linkId);
    } catch (error) {
      throw new Error(`Failed to record user view: ${error.message}`);
    }
  }

  async findManyWithUserViews(filters = {}, options = {}, userId = null) {
    try {
      // pass the requesting user's id to findMany so their own links bypass date filters
      const result = await this.findMany(filters, options, userId);
      
      if (!userId) {
        return result;
      }

      // Get user view status for all links
      const linkIds = result.links.map(link => link.id);
      const userViews = await prisma.linkView.findMany({
        where: {
          linkId: { in: linkIds },
          userId
        },
        select: { linkId: true }
      });

      const viewedLinkIds = new Set(userViews.map(view => view.linkId));

      // Add userHasViewed flag to each link
      result.links = result.links.map(link => ({
        ...link,
        userHasViewed: viewedLinkIds.has(link.id)
      }));

      return result;
    } catch (error) {
      throw new Error(`Failed to find links with user views: ${error.message}`);
    }
  }

  async findActiveByTargetAudienceWithUserViews(targetAudience, options = {}, userId = null) {
    try {
      // If a userId is provided, pass it through as createdBy so creators see their own future links
      const opts = { ...options };
      if (userId) opts.createdBy = userId;

      const links = await this.findActiveByTargetAudience(targetAudience, opts);
      
      if (!userId || !links.length) {
        return links.map(link => ({
          ...link,
          userHasViewed: false
        }));
      }

      // Get user view status for all links
      const linkIds = links.map(link => link.id);
      const userViews = await prisma.linkView.findMany({
        where: {
          linkId: { in: linkIds },
          userId
        },
        select: { linkId: true }
      });

      const viewedLinkIds = new Set(userViews.map(view => view.linkId));

      // Add userHasViewed flag to each link
      return links.map(link => ({
        ...link,
        userHasViewed: viewedLinkIds.has(link.id)
      }));
    } catch (error) {
      throw new Error(`Failed to find active links with user views: ${error.message}`);
    }
  }

  async getMostViewedLinks(limit = 10) {
    try {
      return await prisma.link.findMany({
        where: { isActive: true },
        include: {
          createdByUser: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { viewCount: 'desc' },
        take: limit,
      });
    } catch (error) {
      throw new Error(`Failed to get most viewed links: ${error.message}`);
    }
  }

  async findByCreatedBy(createdBy, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = options;

      // Pass the createdBy as the requesting user so creators see their own future/expired links
      return await this.findMany(
        { createdBy },
        { page, limit, sortBy, sortOrder },
        createdBy
      );
    } catch (error) {
      throw new Error(`Failed to find links by creator: ${error.message}`);
    }
  }
}

module.exports = LinkRepository;