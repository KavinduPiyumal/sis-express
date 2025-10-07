const Joi = require('joi');

class LinkDTO {
  static createSchema = Joi.object({
    title: Joi.string().min(1).max(255).required(),
    url: Joi.string().uri().required(),
    description: Joi.string().max(1000).optional(),
    category: Joi.string().max(100).optional(),
    priority: Joi.string().valid('normal', 'highlight').default('normal'),
    icon: Joi.string().max(100).optional(),
    openMode: Joi.string().valid('newtab', 'sametab').default('newtab'),
    isActive: Joi.boolean().default(true),
    isNew: Joi.boolean().default(false),
    targetAudience: Joi.string().valid('all', 'students', 'admins').default('all'),
    order: Joi.number().integer().min(0).default(0),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
  });

  static updateSchema = Joi.object({
    title: Joi.string().min(1).max(255).optional(),
    url: Joi.string().uri().optional(),
    description: Joi.string().max(1000).optional(),
    category: Joi.string().max(100).optional(),
    priority: Joi.string().valid('normal', 'highlight').optional(),
    icon: Joi.string().max(100).optional(),
    openMode: Joi.string().valid('newtab', 'sametab').optional(),
    isActive: Joi.boolean().optional(),
    isNew: Joi.boolean().optional(),
    targetAudience: Joi.string().valid('all', 'students', 'admins').optional(),
    order: Joi.number().integer().min(0).optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
  });

  static querySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    category: Joi.string().max(100).optional(),
    priority: Joi.string().valid('normal', 'highlight').optional(),
    targetAudience: Joi.string().valid('all', 'students', 'admins').optional(),
    isActive: Joi.boolean().optional(),
    search: Joi.string().max(255).optional(),
    sortBy: Joi.string().valid('title', 'order', 'createdAt', 'updatedAt').default('order'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
    createdBy: Joi.string().uuid().optional(),
    includeExpired: Joi.boolean().optional(),
  });

  static fromPrisma(link, userHasViewed = null) {
    if (!link) return null;
    
    const linkData = {
      id: link.id,
      title: link.title,
      url: link.url,
      description: link.description,
      category: link.category,
      priority: link.priority,
      icon: link.icon,
      openMode: link.openMode,
      isActive: link.isActive,
      isNew: link.isNew || false,
      targetAudience: link.targetAudience,
      order: link.order,
      startDate: link.startDate,
      endDate: link.endDate,
      viewCount: link.viewCount || 0,
      createdBy: link.createdBy,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt,
      createdByUser: link.createdByUser ? {
        id: link.createdByUser.id,
        username: link.createdByUser.username,
        firstName: link.createdByUser.firstName,
        lastName: link.createdByUser.lastName,
      } : undefined,
    };

    // Add userHasViewed flag for authenticated requests
    if (userHasViewed !== null) {
      linkData.userHasViewed = userHasViewed;
    }

    return linkData;
  }

  static toPrisma(data) {
    const prismaData = {};
    
    if (data.title !== undefined) prismaData.title = data.title;
    if (data.url !== undefined) prismaData.url = data.url;
    if (data.description !== undefined) prismaData.description = data.description;
    if (data.category !== undefined) prismaData.category = data.category;
    if (data.priority !== undefined) prismaData.priority = data.priority;
    if (data.icon !== undefined) prismaData.icon = data.icon;
    if (data.openMode !== undefined) prismaData.openMode = data.openMode;
    if (data.isActive !== undefined) prismaData.isActive = data.isActive;
    if (data.targetAudience !== undefined) prismaData.targetAudience = data.targetAudience;
    if (data.order !== undefined) prismaData.order = data.order;
    if (data.startDate !== undefined) prismaData.startDate = data.startDate;
    if (data.endDate !== undefined) prismaData.endDate = data.endDate;
  if (data.isNew !== undefined) prismaData.isNew = data.isNew;
    if (data.createdBy !== undefined) prismaData.createdBy = data.createdBy;
    
    return prismaData;
  }

  static validateCreate(data) {
    return this.createSchema.validate(data, { abortEarly: false });
  }

  static validateUpdate(data) {
    return this.updateSchema.validate(data, { abortEarly: false });
  }

  static validateQuery(data) {
    return this.querySchema.validate(data, { abortEarly: false });
  }

  static getActiveLinks(links) {
    const now = new Date();
    return links.filter(link => {
      if (!link.isActive) return false;
      if (link.startDate && new Date(link.startDate) > now) return false;
      if (link.endDate && new Date(link.endDate) < now) return false;
      return true;
    });
  }

  static filterByTargetAudience(links, userRole) {
    return links.filter(link => {
      if (link.targetAudience === 'all') return true;
      if (link.targetAudience === 'students' && userRole === 'student') return true;
      if (link.targetAudience === 'admins' && (userRole === 'admin' || userRole === 'super_admin')) return true;
      return false;
    });
  }

  static sortLinks(links, sortBy = 'order', sortOrder = 'asc') {
    return links.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'order':
          comparison = a.order - b.order;
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        case 'updatedAt':
          comparison = new Date(a.updatedAt) - new Date(b.updatedAt);
          break;
        default:
          comparison = a.order - b.order;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }
}

module.exports = LinkDTO;