const prisma = require('../lib/prisma');

async function getProjects(req, res, next) {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.userId },
      include: { _count: { select: { tasks: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(projects);
  } catch (err) { next(err); }
}

async function createProject(req, res, next) {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const project = await prisma.project.create({
      data: { name, description, userId: req.userId },
    });
    res.status(201).json(project);
  } catch (err) { next(err); }
}

async function getProject(req, res, next) {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { tasks: { orderBy: { createdAt: 'desc' } } },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) { next(err); }
}

async function updateProject(req, res, next) {
  try {
    const { name, description } = req.body;
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: { name, description },
    });
    res.json(updated);
  } catch (err) { next(err); }
}

async function deleteProject(req, res, next) {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    await prisma.project.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { getProjects, createProject, getProject, updateProject, deleteProject };
