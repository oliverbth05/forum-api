const mongoose = require('mongoose');

var postSchema = new mongoose.Schema({
    title:  {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    author_id: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: false
    },
    tags: {
        type: Array,
        required: false,
        default: []
    },
    image: {
        type: String,
    },
    views: {
        type: Number,
        default: 0
    },
    date: { type: Date, default: Date.now },
    votes: [{}],
  });

var Post = mongoose.model('Post', postSchema)

module.exports = Post
