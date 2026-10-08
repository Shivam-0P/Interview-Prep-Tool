const express = require('express')
const router= express.Router();
const middleware = require('../middleware/Register')


router.post('/register',middleware.registeruser)
router.post('/login', middleware.loginuser)
router.post('/prep/ask', middleware.askPrepQuestion)


module.exports = router; 

