const LinkRepository = require('../repositories/LinkRepository');
const LinkDTO = require('../dto/LinkDTO');
const logger = require('../config/logger');

class LinkUseCase {
  constructor() {
    this.linkRepository = new LinkRepository();
  }

  async createLink(linkData, createdBy) {
    try {
      // Validate input data
      const { error, value } = LinkDTO.validateCreate(linkData);
      if (error) {
        throw new Error(`Validation error: ${error.details.map(d => d.message).join(', ')}`);
      }

      // Prepare data for creation
      const prismaData = LinkDTO.toPrisma({
        ...value,
        createdBy,
      });

      // Create link
      const link = await this.linkRepository.create(prismaData);

      logger.info(`Link created successfully`, {
        linkId: link.id,
        title: link.title,
        createdBy,
      });

      return LinkDTO.fromPrisma(link);
    } catch (error) {
      logger.error('Error creating link:', error);
      throw error;
    }
  }

  async getLinkById(id, userId = null) {
    try {
      const link = await this.linkRepository.findById(id);
      if (!link) {
        throw new Error('Link not found');
      }

      // Add user view status if userId provided
      if (userId) {
        const userHasViewed = await this.linkRepository.checkUserHasViewed(id, userId);
        link.userHasViewed = userHasViewed;
      }

      return LinkDTO.fromPrisma(link);
    } catch (error) {
      logger.error('Error getting link by ID:', error);
      throw error;
    }
  }

  async getLinks(filters = {}, options = {}, userId = null) {
    try {
      // Validate query parameters
      const { error, value } = LinkDTO.validateQuery({ ...filters, ...options });
      if (error) {
        throw new Error(`Validation error: ${error.details.map(d => d.message).join(', ')}`);
      }

      const result = await this.linkRepository.findManyWithUserViews(filters, options, userId);

      return {
        links: result.links.map(link => this.addNewBadgeLogic(link, userId)),
        pagination: result.pagination,
      };
    } catch (error) {
      logger.error('Error getting links:', error);
      throw error;
    }
  }

  async getActiveLinksForUser(userRole, options = {}, userId = null) {
    try {
      let links = [];
      if (userRole === 'admin' || userRole === 'super_admin') {
        // Fetch links for admins: targetAudience 'admins' or 'all'
        const adminLinks = await this.linkRepository.findActiveByTargetAudienceWithUserViews('admins', options, userId);
        const allLinks = await this.linkRepository.findActiveByTargetAudienceWithUserViews('all', options, userId);

        // Also fetch links with targetAudience 'students' created by this admin
        let studentLinks = [];
        if (userId) {
          const studentLinksResult = await this.linkRepository.findManyWithUserViews({ targetAudience: 'students', createdBy: userId }, options, userId);
          studentLinks = studentLinksResult.links || [];
        }

        // Merge and deduplicate by id
        const map = new Map();
        [...adminLinks, ...allLinks, ...studentLinks].forEach(l => map.set(l.id, l));
        links = Array.from(map.values());
      } else if (userRole === 'student') {
        // Students: fetch links for 'students' and 'all'
        const studentLinks = await this.linkRepository.findActiveByTargetAudienceWithUserViews('students', options, userId);
        const allLinks = await this.linkRepository.findActiveByTargetAudienceWithUserViews('all', options, userId);
        // Merge and deduplicate by id
        const map = new Map();
        [...studentLinks, ...allLinks].forEach(l => map.set(l.id, l));
        links = Array.from(map.values());
      } else {
        // Default: just 'all'
        links = await this.linkRepository.findActiveByTargetAudienceWithUserViews('all', options, userId);
      }

      return links.map(link => this.addNewBadgeLogic(link, userId));
    } catch (error) {
      logger.error('Error getting active links for user:', error);
      throw error;
    }
  }

  async updateLink(id, updateData, updatedBy, userId = null) {
    try {
      // Check if link exists
      const existingLink = await this.linkRepository.findById(id);
      if (!existingLink) {
        throw new Error('Link not found');
      }

      // Validate update data
      const { error, value } = LinkDTO.validateUpdate(updateData);
      if (error) {
        throw new Error(`Validation error: ${error.details.map(d => d.message).join(', ')}`);
      }

      // Prepare data for update
      const prismaData = LinkDTO.toPrisma(value);

      // Update link
      const updatedLink = await this.linkRepository.update(id, prismaData);

      logger.info(`Link updated successfully`, {
        linkId: id,
        updatedBy,
        changes: Object.keys(value),
      });

      // Add user view status if userId provided
      if (userId) {
        const userHasViewed = await this.linkRepository.checkUserHasViewed(id, userId);
        updatedLink.userHasViewed = userHasViewed;
        return this.addNewBadgeLogic(updatedLink, userId);
      }

      return LinkDTO.fromPrisma(updatedLink);
    } catch (error) {
      logger.error('Error updating link:', error);
      throw error;
    }
  }

  async deleteLink(id, deletedBy) {
    try {
      // Check if link exists
      const existingLink = await this.linkRepository.findById(id);
      if (!existingLink) {
        throw new Error('Link not found');
      }

      // Delete link
      await this.linkRepository.delete(id);

      logger.info(`Link deleted successfully`, {
        linkId: id,
        title: existingLink.title,
        deletedBy,
      });

      return { message: 'Link deleted successfully' };
    } catch (error) {
      logger.error('Error deleting link:', error);
      throw error;
    }
  }

  async updateLinkOrder(linkUpdates, updatedBy) {
    try {
      // Validate that all provided IDs exist
      const linkIds = linkUpdates.map(update => update.id);
      const existingLinks = await Promise.all(
        linkIds.map(id => this.linkRepository.exists(id))
      );

      const nonExistentLinks = linkIds.filter((id, index) => !existingLinks[index]);
      if (nonExistentLinks.length > 0) {
        throw new Error(`Links not found: ${nonExistentLinks.join(', ')}`);
      }

      // Update orders
      await this.linkRepository.updateOrder(linkUpdates);

      logger.info(`Link orders updated successfully`, {
        updatedBy,
        linkCount: linkUpdates.length,
      });

      return { message: 'Link orders updated successfully' };
    } catch (error) {
      logger.error('Error updating link orders:', error);
      throw error;
    }
  }

  async getLinkCategories() {
    try {
      const categories = await this.linkRepository.getCategories();
      return categories;
    } catch (error) {
      logger.error('Error getting link categories:', error);
      throw error;
    }
  }

  async getLinkStatistics(filters = {}, requestUserId = null ,userRole = null) {
    try {
      const statistics = await this.linkRepository.getStatisticsWithFilters(filters, requestUserId, userRole);
      return statistics;
    } catch (error) {
      logger.error('Error getting link statistics:', error);
      throw error;
    }
  }

  async getUserLinks(userId, options = {}) {
    try {
      // Use findManyWithUserViews and pass userId so creator bypasses date filters and we get userHasViewed
      const result = await this.linkRepository.findManyWithUserViews({ createdBy: userId }, options, userId);

      return {
        links: result.links.map(link => this.addNewBadgeLogic(link, userId)),
        pagination: result.pagination,
      };
    } catch (error) {
      logger.error('Error getting user links:', error);
      throw error;
    }
  }

  async toggleLinkStatus(id, updatedBy, userId = null) {
    try {
      const existingLink = await this.linkRepository.findById(id);
      if (!existingLink) {
        throw new Error('Link not found');
      }

      const updatedLink = await this.linkRepository.update(id, {
        isActive: !existingLink.isActive,
      });

      logger.info(`Link status toggled successfully`, {
        linkId: id,
        newStatus: updatedLink.isActive,
        updatedBy,
      });

      // Add user view status if userId provided
      if (userId) {
        const userHasViewed = await this.linkRepository.checkUserHasViewed(id, userId);
        updatedLink.userHasViewed = userHasViewed;
        return this.addNewBadgeLogic(updatedLink, userId);
      }

      return LinkDTO.fromPrisma(updatedLink);
    } catch (error) {
      logger.error('Error toggling link status:', error);
      throw error;
    }
  }

  async duplicateLink(id, createdBy) {
    try {
      const existingLink = await this.linkRepository.findById(id);
      if (!existingLink) {
        throw new Error('Link not found');
      }

      // Create a copy with modified title
      const duplicateData = {
        title: `${existingLink.title} (Copy)`,
        url: existingLink.url,
        description: existingLink.description,
        category: existingLink.category,
        priority: existingLink.priority,
        icon: existingLink.icon,
        openMode: existingLink.openMode,
        targetAudience: existingLink.targetAudience,
        order: existingLink.order + 1,
        startDate: existingLink.startDate,
        endDate: existingLink.endDate,
        isActive: false, // Start as inactive
      };

      return await this.createLink(duplicateData, createdBy);
    } catch (error) {
      logger.error('Error duplicating link:', error);
      throw error;
    }
  }

  async incrementLinkView(id, userId = null) {
    try {
      let updatedLink;
      
      if (userId) {
        // Record per-user view for NEW badge functionality
        updatedLink = await this.linkRepository.recordUserView(id, userId);
      } else {
        // Just increment total view count
        updatedLink = await this.linkRepository.incrementViewCount(id);
      }

      logger.info(`Link view count incremented`, {
        linkId: id,
        userId,
        newViewCount: updatedLink.viewCount,
      });

      return this.addNewBadgeLogic(updatedLink, userId);
    } catch (error) {
      logger.error('Error incrementing link view count:', error);
      throw error;
    }
  }

  // Helper method to add NEW badge logic to link data
  addNewBadgeLogic(link, userId = null) {
    const linkData = LinkDTO.fromPrisma(link, link.userHasViewed);
    
    // Calculate if link should show NEW badge
    if (userId && linkData.userHasViewed) {
      // User has viewed this link, never show NEW badge
      linkData.showNewBadge = false;
    } else if (linkData.isNew) {
      // Admin manually marked as new, show NEW badge
      linkData.showNewBadge = true;
    } else {
      // Check if link was created within the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      linkData.showNewBadge = linkData.createdAt > sevenDaysAgo;
    }

    return linkData;
  }

  async getMostViewedLinks(limit = 10) {
    try {
      const links = await this.linkRepository.getMostViewedLinks(limit);
      return links.map(link => LinkDTO.fromPrisma(link));
    } catch (error) {
      logger.error('Error getting most viewed links:', error);
      throw error;
    }
  }
}

module.exports = LinkUseCase;