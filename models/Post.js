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
    image: {
        type: String,
    },
    date: { type: Date, default: Date.now },
    votes: [{}],
  });

var Post = mongoose.model('Post', postSchema)

module.exports = Post
