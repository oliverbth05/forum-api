'use strict'
const path          = require('path')
const express       = require('express');
const cors          = require('cors');
const mongoose      = require('mongoose');
const bodyParser    = require('body-parser');
const multer        = require('multer');

const userRoutes    = require('./routes/user.js');
const postRoutes    = require('./routes/posts.js');
const commentRoutes = require('./routes/comments.js');

const app           = express();
 
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => { 
        cb(null, new Date().toISOString() + '-' + file.originalname)
    }
})

const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'avatars')
    },
    filename: (req, file, cb) => {
        cb(null, req.body.user_id)
    }
})

//General Middleware
app.use(cors())
app.use(bodyParser.json())

app.use('/images', express.static(path.join(__dirname, 'images')))
app.use('/posts', multer({storage: fileStorage}).single('image'))

app.use('/avatars', express.static(path.join(__dirname, 'avatars')))
app.use('/user/:id/data/profile/avatar', multer({storage: avatarStorage}).single('avatar'))

//Routes
app.use(userRoutes)
app.use(postRoutes)
app.use(commentRoutes)

mongoose.connect('mongodb://node_client:joejoe9124@ds241723.mlab.com:41723/forum')
.then(result => {
    console.log('connected to MongoDB')
    app.listen(process.env.PORT, process.env.IP, () => {
        console.log('server started');
    })
})
.catch(err => {
    console.log(err)
})