const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
} = require('../controllers/projects');

router.use(authenticate);

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProject);
router.patch('/:id', updateProject);
router.delete('/:id', deleteProject);

module.exports = router;
