const express = require('express');
const postsController = require('../controllers/posts.js');

const router = express.Router();

router.get('/posts', postsController.getAllPosts)
router.get('/posts/:id', postsController.getSinglePost)
router.post('/posts', postsController.createPost)
router.put('/posts/:id', postsController.updatePost)
router.delete('/posts/:id', postsController.deletePost)
router.put('/posts/:id/votes', postsController.votePost)

module.exports = router;