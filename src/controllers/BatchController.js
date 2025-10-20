const prisma = require('../infrastructure/prisma');

module.exports = {
  async create(req, res) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Create the batch first
        const batch = await tx.batch.create({ data: req.body });

        // Fetch the related degree program to get duration
        const program = await tx.degreeProgram.findUnique({
          where: { id: batch.programId },
          select: { duration: true }
        });
        if (!program) {
          // Throw to trigger rollback
          throw new Error('Degree program not found for batch');
        }

        // Prepare semesters (2 per year, e.g. 1st Year Semester 1, etc)
        const semestersToCreate = [];
        for (let year = 1; year <= program.duration; year++) {
          for (let sem = 1; sem <= 2; sem++) {
            let name = `${year}st Year Semester ${sem}`;
            if (year === 2) name = `2nd Year Semester ${sem}`;
            else if (year === 3) name = `3rd Year Semester ${sem}`;
            else if (year > 3) name = `${year}th Year Semester ${sem}`;
            semestersToCreate.push({
              name,
              batchId: batch.id,
              status: (year === 1 && sem === 1) ? 'inprogress' : 'pending',
              // startDate and endDate can be set later by admin
              startDate: new Date(),
              endDate: new Date()
            });
          }
        }

        // Bulk create semesters
        await tx.semester.createMany({ data: semestersToCreate });

        // Optionally, fetch the created semesters to return
        const semesters = await tx.semester.findMany({ where: { batchId: batch.id }, orderBy: { name: 'asc' } });

        return { ...batch, semesters };
      });
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getAll(req, res) {
    try {
      // Pagination: page (1-based) and limit (perPage)
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const perPageRaw = parseInt(req.query.limit, 10) || 20;
      const perPage = Math.min(Math.max(1, perPageRaw), 100); // cap limit to 100

      // Optional search query (search by batch name)
      const q = (req.query.q || req.query.search || '').toString().trim();
      const where = q ? { name: { contains: q, mode: 'insensitive' } } : {};

      // Get total count for pagination meta
      const total = await prisma.batch.count({ where });
      const totalPages = total === 0 ? 1 : Math.ceil(total / perPage);

      // Adjust page if it's out of range
      const safePage = page > totalPages ? totalPages : page;

      // Fetch batches with their current semester (status: inprogress)
      const batches = await prisma.batch.findMany({
        where,
        skip: (safePage - 1) * perPage,
        take: perPage,
        orderBy: { name: 'asc' },
        include: {
          semesters: {
            where: { status: 'inprogress' },
            orderBy: { startDate: 'asc' }
          }
        }
      });

      // Attach currentSemester (first inprogress semester if exists) to each batch
      const batchesWithCurrent = batches.map(batch => {
        const currentSemester = batch.semesters && batch.semesters.length > 0 ? batch.semesters[0] : null;
        // Remove semesters array to avoid confusion, attach currentSemester only
        const { semesters, ...rest } = batch;
        return { ...rest, currentSemester };
      });

      res.json({
        success: true,
        data: batchesWithCurrent,
        meta: {
          total,
          totalPages,
          page: safePage,
          perPage
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getById(req, res) {
    try {
      const batch = await prisma.batch.findUnique({ where: { id: req.params.id } });
      if (!batch) return res.status(404).json({ error: 'Not found' });
      res.json(batch);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async update(req, res) {
    try {
      const batch = await prisma.batch.update({ where: { id: req.params.id }, data: req.body });
      res.json(batch);
    } catch (err) {
      if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
      res.status(400).json({ error: err.message });
    }
  },

 async delete(req, res) {
  try {
    await prisma.batch.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    // Handle Prisma record not found
    if (err.code === 'P2025') {
      return res.status(404).json({ 
        success: false,
        error: 'Batch not found' 
      });
    }
    
    // Handle foreign key constraint violation (both P2003 and PostgreSQL constraint errors)
    if (err.code === 'P2003' || 
        (err.message && err.message.includes('foreign key constraint')) ||
        (err.message && err.message.includes('violates RESTRICT setting'))) {
      return res.status(409).json({ 
        success: false,
        error: 'Cannot delete batch. Please delete or reassign the semesters before deleting this batch.',
        message: 'Failed to delete batch. This batch has related semesters that must be removed first.',
        details: 'Please delete or reassign the semesters before deleting this batch.'
      });
    }
    
    // Handle other errors
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: err.message 
    });
  }
}
  ,
  // Admin tool: fix semesters for a batch (delete and recreate semesters)
  async fixSemesters(req, res) {
    try {
      const batchId = req.params.id;
      // Find batch and its degree program
      const batch = await prisma.batch.findUnique({ where: { id: batchId } });
      if (!batch) return res.status(404).json({ error: 'Batch not found' });
      const program = await prisma.degreeProgram.findUnique({ where: { id: batch.programId }, select: { duration: true } });
      if (!program) return res.status(400).json({ error: 'Degree program not found for batch' });

      // Delete all semesters for this batch
      await prisma.semester.deleteMany({ where: { batchId } });

      // Prepare correct semesters
      const semestersToCreate = [];
      for (let year = 1; year <= program.duration; year++) {
        for (let sem = 1; sem <= 2; sem++) {
          let name = `${year}st Year Semester ${sem}`;
          if (year === 2) name = `2nd Year Semester ${sem}`;
          else if (year === 3) name = `3rd Year Semester ${sem}`;
          else if (year > 3) name = `${year}th Year Semester ${sem}`;
          semestersToCreate.push({
            name,
            batchId,
            status: (year === 1 && sem === 1) ? 'inprogress' : 'pending',
            startDate: new Date(),
            endDate: new Date()
          });
        }
      }
      await prisma.semester.createMany({ data: semestersToCreate });
      const semesters = await prisma.semester.findMany({ where: { batchId }, orderBy: { name: 'asc' } });
      res.json({ success: true, batchId, semesters });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
