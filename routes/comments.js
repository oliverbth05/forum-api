const express = require('express');
const commentsController = require('../controllers/comments.js');

const router = express.Router();

router.get('/posts/:id/comments', commentsController.getCommentsByPost)
router.post('/posts/:id/comments', commentsController.postComment) 
router.put('/posts/:id/comments/:id/votes', commentsController.voteComment)
router.delete('/posts/:id/comments/:id', commentsController.deleteComment)
router.post('/posts/:id/comments/:id/replies', commentsController.postReply)
router.get('/comment/:id', commentsController.getSingleComment)
router.put('/comment', commentsController.updateSingleComment)
router.get('/comment/:comment_id/replies/:reply_id', commentsController.getSingleReply)
router.put('/comment/reply', commentsController.updateReply)
router.delete('/comment/:comment_id/reply/:reply_id/:token', commentsController.deleteReply)

module.exports = router
