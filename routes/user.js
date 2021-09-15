const router = require('express').Router();

const userController = require('../controller/user');

router.post('/register',userController.registerHandler)

module.exports = router;