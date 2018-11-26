const express = require('express');
const userController = require('../controllers/user.js');

const router = express.Router(); 

router.post('/user/auth/register', userController.registerUser)
router.post('/user/auth/login', userController.logInUser)
router.get('/user/:id/data/profile', userController.getUserProfile)
router.get('/user/:id/data/posts', userController.getUserPosts)
router.put('/user/:id/data/profile/avatar', userController.updateUserAvatar)

module.exports = router;
 