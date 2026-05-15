const prisma = require('../lib/prisma');

async function getDashboard(req, res, next) {
  try {
    const userId = req.userId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalProjects, totalTasks, completedTasks, dueTodayTasks, recentTasks] = await prisma.$transaction([
      prisma.project.count({ where: { userId } }),
      prisma.task.count({ where: { project: { userId } } }),
      prisma.task.count({ where: { project: { userId }, status: 'DONE' } }),
      prisma.task.count({
        where: {
          project: { userId },
          deadline: { gte: today, lt: tomorrow },
          status: { not: 'DONE' },
        },
      }),
      prisma.task.findMany({
        where: { project: { userId } },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: { project: { select: { name: true } } },
      }),
    ]);

    res.json({ totalProjects, totalTasks, completedTasks, dueTodayTasks, recentTasks });
  } catch (err) { next(err); }
}

module.exports = { getDashboard };
