const express = require('express');
const { getKitchenOrders } = require('../controllers/kitchenController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('staff', 'admin'));

router.get('/orders', getKitchenOrders);
router.get('/queue', getKitchenOrders);
router.get('/', getKitchenOrders);

module.exports = router;
