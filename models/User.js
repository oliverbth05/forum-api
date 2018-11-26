const mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    profileImage: {
        type: String,
        default: 'https://ob-forum-api.herokuapp.com/images/default_user.jfif'
    }
})

var User = mongoose.model('User', userSchema)

module.exports = User