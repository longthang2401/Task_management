const express = require('express');
const router = express.Router();
const controller = require("../controllers/auth.controller")  
const authMiddleware = require('../../../middleware/authMiddelware');

router.post('/register', controller.register)
router.post('/login', controller.login)

router.get('/profile', authMiddleware, controller.getProfile);


router.put('/profile', authMiddleware, controller.updateProfile);
 
 module.exports = router;