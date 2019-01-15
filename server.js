'use strict'
const path          = require('path')
const express       = require('express');
const cors          = require('cors');
const mongoose      = require('mongoose');
const bodyParser    = require('body-parser');

const userRoutes    = require('./routes/user.js');
const postRoutes    = require('./routes/posts.js');
const commentRoutes = require('./routes/comments.js');

const app           = express();


//General Middleware
app.use(cors())
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, 'images')))

//Routes
app.use(userRoutes)
app.use(postRoutes)
app.use(commentRoutes)

mongoose.connect('mongodb://node_client:PASWRD@ds241723.mlab.com:41723/forum')
.then(result => {
    console.log('connected to MongoDB')
    app.listen(process.env.PORT || 3000, () => {
        console.log('server started');
    })
})
.catch(err => {
    console.log(err)
})
