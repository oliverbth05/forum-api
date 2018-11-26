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
        default: 'https://frontend-templates-oliverbth05.c9users.io:8081/images/default_user.jfif'
    }
})

var User = mongoose.model('User', userSchema)

module.exports = User