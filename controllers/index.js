var express = require('express');
var router = express.Router();

router.use('/', require('./download'));
router.use('/', require('./upload'));
router.use('/', require('./home'));

module.exports = router;
