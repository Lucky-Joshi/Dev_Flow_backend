const prisma = require('../lib/prisma');

async function getTasks(req, res, next) {
  try {
    const { projectId } = req.query;
    const where = {
      project: { userId: req.userId },
      ...(projectId && { projectId }),
    };
    const tasks = await prisma.task.findMany({
      where,
      include: { logs: { orderBy: { createdAt: 'desc' }, take: 5 } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tasks);
  } catch (err) { next(err); }
}

async function createTask(req, res, next) {
  try {
    const { title, description, status, priority, deadline, projectId } = req.body;
    if (!title || !projectId) {
      return res.status(400).json({ error: 'Title and projectId are required' });
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.userId },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        deadline: deadline ? new Date(deadline) : null,
        projectId,
      },
    });

    await prisma.activityLog.create({
      data: { taskId: task.id, message: `Task created` },
    });

    res.status(201).json(task);
  } catch (err) { next(err); }
}

async function updateTask(req, res, next) {
  try {
    const { title, description, status, priority, deadline } = req.body;

    const task = await prisma.task.findFirst({
      where: { id: req.params.id, project: { userId: req.userId } },
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
      },
    });

    // Log status changes
    if (status && status !== task.status) {
      await prisma.activityLog.create({
        data: { taskId: task.id, message: `Status changed from ${task.status} to ${status}` },
      });
    }

    res.json(updated);
  } catch (err) { next(err); }
}

async function deleteTask(req, res, next) {
  try {
    const task = await prisma.task.findFirst({
      where: { id: req.params.id, project: { userId: req.userId } },
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    await prisma.task.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { getTasks, createTask, updateTask, deleteTask };
