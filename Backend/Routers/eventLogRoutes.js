const express = require('express');
const router = express.Router();
const eventLogController = require('../Controllers/eventLogController');

router.post('/', eventLogController.addEventLog);
router.get('/', eventLogController.getAllEventLogs);


module.exports = router;
