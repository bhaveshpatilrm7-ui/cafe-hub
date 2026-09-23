const express = require('express');
const {
  getTables,
  createTable,
  updateTable,
  deleteTable
} = require('../controllers/tableController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getTables)
  .post(protect, authorize('admin'), createTable);

router.route('/:id')
  .put(protect, authorize('admin'), updateTable)
  .delete(protect, authorize('admin'), deleteTable);

module.exports = router;
