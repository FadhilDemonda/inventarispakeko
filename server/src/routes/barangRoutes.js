const express = require('express');
const router = express.Router();
const barangController = require('../controllers/barangController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', barangController.getAll);
router.get('/:id', barangController.getById);
router.post('/', barangController.create);
router.put('/:id', barangController.update);
router.delete('/:id', barangController.delete);

module.exports = router;
