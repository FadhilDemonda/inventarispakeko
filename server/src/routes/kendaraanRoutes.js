const express = require('express');
const router = express.Router();
const kendaraanController = require('../controllers/kendaraanController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/alerts', kendaraanController.getAlerts);
router.get('/', kendaraanController.getAll);
router.get('/:id', kendaraanController.getById);
router.post('/', kendaraanController.create);
router.put('/:id', kendaraanController.update);
router.delete('/:id', kendaraanController.delete);

module.exports = router;
