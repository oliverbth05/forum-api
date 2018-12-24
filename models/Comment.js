const mongoose = require('mongoose');

var commentSchema = new mongoose.Schema({
    body: {
        type: String,
    },
    date: {
        type: Date, 
        default: Date.now()
    },
    author_username: {
        type: String,
    },
    author_id: {
        type: String,
    },
    post_id: {
        type: String,
    },
    votes: [{}],
    replies: [{
        body: {
            type: String,
            required: true
        },
        date: {
            type: Date,
        },
        author: {
            type: String,
            required: true
        },
        author_id: {
            type: String,
            required: true
        },
        post_id: {
            type: String,
            required: true
        },
        votes: [{}],
    }] 
  });

var Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment
