const prisma = require('../lib/prisma');

async function getDashboard(req, res, next) {
  try {
    const userId = req.userId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Single round-trip for all aggregated counts
    const [rows] = await prisma.$queryRaw`
        SELECT
          (SELECT COUNT(*)::int FROM "Project" WHERE "userId" = ${userId})                           AS "totalProjects",
          (SELECT COUNT(*)::int FROM "Task"   WHERE "projectId" IN
            (SELECT "id" FROM "Project" WHERE "userId" = ${userId}))                                 AS "totalTasks",
          (SELECT COUNT(*)::int FROM "Task"   WHERE "projectId" IN
            (SELECT "id" FROM "Project" WHERE "userId" = ${userId}) AND "status"::text = 'DONE')      AS "completedTasks",
          (SELECT COUNT(*)::int FROM "Task"   WHERE "projectId" IN
            (SELECT "id" FROM "Project" WHERE "userId" = ${userId})
             AND "deadline" >= ${today}
             AND "deadline" <  ${tomorrow}
             AND "status"::text <> 'DONE')                                                            AS "dueTodayTasks"
    `;

    const recentTasks = await prisma.task.findMany({
      where: { project: { userId } },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: { project: { select: { name: true } } },
    });

    const { totalProjects, totalTasks, completedTasks, dueTodayTasks } = rows[0];
    res.json({ totalProjects, totalTasks, completedTasks, dueTodayTasks, recentTasks });
  } catch (err) { next(err); }
}

module.exports = { getDashboard };
