const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/tasks');

router.use(authenticate);

router.get('/', getTasks);
router.post('/', createTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
