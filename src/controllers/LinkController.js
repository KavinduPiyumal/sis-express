const LinkUseCase = require('../usecases/LinkUseCase');
const logger = require('../config/logger');

class LinkController {
  constructor() {
    this.linkUseCase = new LinkUseCase();
  }

  createLink = async (req, res, next) => {
    try {
      const link = await this.linkUseCase.createLink(req.body, req.user.id);

      res.status(201).json({
        success: true,
        message: 'Link created successfully',
        data: link,
      });
    } catch (error) {
      next(error);
    }
  };

  getLinks = async (req, res, next) => {
    try {
      const filters = {
        category: req.query.category,
        priority: req.query.priority,
        targetAudience: req.query.targetAudience,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
        search: req.query.search,
        createdBy: req.query.createdBy,
        includeExpired: req.query.includeExpired === 'true',
      };

      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'order',
        sortOrder: req.query.sortOrder || 'asc',
      };

      // Pass user ID for NEW badge functionality
      const userId = req.user ? req.user.id : null;
      const result = await this.linkUseCase.getLinks(filters, options, userId);

      res.json({
        success: true,
        data: result.links,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getActiveLinks = async (req, res, next) => {
    try {
      const options = {
        category: req.query.category,
        priority: req.query.priority,
        sortBy: req.query.sortBy || 'order',
        sortOrder: req.query.sortOrder || 'asc',
      };

      // Pass user ID for NEW badge functionality
      const userId = req.user ? req.user.id : null;
      const links = await this.linkUseCase.getActiveLinksForUser(req.user.role, options, userId);

      res.json({
        success: true,
        data: links,
      });
    } catch (error) {
      next(error);
    }
  };

  getLinkById = async (req, res, next) => {
    try {
      // Pass user ID for NEW badge functionality
      const userId = req.user ? req.user.id : null;
      const link = await this.linkUseCase.getLinkById(req.params.id, userId);

      res.json({
        success: true,
        data: link,
      });
    } catch (error) {
      next(error);
    }
  };

  updateLink = async (req, res, next) => {
    try {
      // Pass user ID for NEW badge functionality
      const userId = req.user ? req.user.id : null;
      const link = await this.linkUseCase.updateLink(req.params.id, req.body, req.user.id, userId);

      res.json({
        success: true,
        message: 'Link updated successfully',
        data: link,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteLink = async (req, res, next) => {
    try {
      await this.linkUseCase.deleteLink(req.params.id, req.user.id);

      res.json({
        success: true,
        message: 'Link deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  updateLinkOrder = async (req, res, next) => {
    try {
      const { linkUpdates } = req.body;

      if (!Array.isArray(linkUpdates)) {
        return res.status(400).json({
          success: false,
          message: 'linkUpdates must be an array',
        });
      }

      await this.linkUseCase.updateLinkOrder(linkUpdates, req.user.id);

      res.json({
        success: true,
        message: 'Link orders updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  toggleLinkStatus = async (req, res, next) => {
    try {
      // Pass user ID for NEW badge functionality
      const userId = req.user ? req.user.id : null;
      const link = await this.linkUseCase.toggleLinkStatus(req.params.id, req.user.id, userId);

      res.json({
        success: true,
        message: 'Link status toggled successfully',
        data: link,
      });
    } catch (error) {
      next(error);
    }
  };

  duplicateLink = async (req, res, next) => {
    try {
      const link = await this.linkUseCase.duplicateLink(req.params.id, req.user.id);

      res.status(201).json({
        success: true,
        message: 'Link duplicated successfully',
        data: link,
      });
    } catch (error) {
      next(error);
    }
  };

  getLinkCategories = async (req, res, next) => {
    try {
      const categories = await this.linkUseCase.getLinkCategories();

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  };

  getLinkStatistics = async (req, res, next) => {
    try {
      const filters = {
        createdBy: req.query.createdBy,
        includeExpired: req.query.includeExpired === 'true',
      };

      const requestUserId = req.user ? req.user.id : null;
      const userRole = req.user ? req.user.role : null;
      const statistics = await this.linkUseCase.getLinkStatistics(filters, requestUserId, userRole);

      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      next(error);
    }
  };

  getUserLinks = async (req, res, next) => {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'desc',
      };

      const result = await this.linkUseCase.getUserLinks(req.user.id, options);

      res.json({
        success: true,
        data: result.links,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // Public endpoint for getting active links (no authentication required)
  getPublicActiveLinks = async (req, res, next) => {
    try {
      const options = {
        category: req.query.category,
        priority: req.query.priority,
        sortBy: req.query.sortBy || 'order',
        sortOrder: req.query.sortOrder || 'asc',
      };

      // Get links for all users (public access)
      const links = await this.linkUseCase.getActiveLinksForUser('all', options);

      res.json({
        success: true,
        data: links,
      });
    } catch (error) {
      next(error);
    }
  };

  // Bulk operations
  bulkUpdateLinks = async (req, res, next) => {
    try {
      const { linkIds, updateData } = req.body;

      if (!Array.isArray(linkIds) || linkIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'linkIds must be a non-empty array',
        });
      }

      const results = await Promise.allSettled(
        linkIds.map(id => this.linkUseCase.updateLink(id, updateData, req.user.id))
      );

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      res.json({
        success: true,
        message: `Bulk update completed: ${successful} successful, ${failed} failed`,
        data: {
          successful,
          failed,
          results: results.map((result, index) => ({
            linkId: linkIds[index],
            status: result.status,
            data: result.status === 'fulfilled' ? result.value : null,
            error: result.status === 'rejected' ? result.reason.message : null,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  bulkDeleteLinks = async (req, res, next) => {
    try {
      const { linkIds } = req.body;

      if (!Array.isArray(linkIds) || linkIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'linkIds must be a non-empty array',
        });
      }

      const results = await Promise.allSettled(
        linkIds.map(id => this.linkUseCase.deleteLink(id, req.user.id))
      );

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      res.json({
        success: true,
        message: `Bulk delete completed: ${successful} successful, ${failed} failed`,
        data: {
          successful,
          failed,
          results: results.map((result, index) => ({
            linkId: linkIds[index],
            status: result.status,
            error: result.status === 'rejected' ? result.reason.message : null,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // View tracking methods
  incrementLinkView = async (req, res, next) => {
    try {
      // Pass user ID for per-user view tracking
      const userId = req.user ? req.user.id : null;
      const link = await this.linkUseCase.incrementLinkView(req.params.id, userId);

      res.json({
        success: true,
        message: 'Link view count incremented',
        data: link,
      });
    } catch (error) {
      next(error);
    }
  };

  getMostViewedLinks = async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const links = await this.linkUseCase.getMostViewedLinks(limit);

      res.json({
        success: true,
        data: links,
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = LinkController;