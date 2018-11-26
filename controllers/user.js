const fs = require('fs');
const path = require('path');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Post = require('../models/Post');
 
exports.registerUser = async (req, res, next) => {
    
    if(!req.body.email || !req.body.username || !req.body.password) {
        return res.send(400, {error: 'Please provide all of the fields.' })
    }
    
    try {
        var found = await User.find({email: req.body.email})
        if (found.length > 0) {
            return res.send(400, {error: 'A registered account already exists under the provided email.' })
        }    
        
        var created = await User.create({
            email: req.body.email,
            username: req.body.username,
            password: bcrypt.hashSync(req.body.password, 8),
            summary: '',
            createdAt: new Date(),
        })
        
        var source = path.join(__dirname, '..', 'default_user.jfif');
        var destination = path.join(__dirname, '..', 'avatars', created._id); //Creating a copy of default avatar
        fs.createReadStream(source).pipe(fs.createWriteStream(destination));  
        var url = 'https://ob-forum-api.herokuapp.com/avatars/' + created._id; //Setting the user avatar directory requires the _id
        
        var updated = await User.updateOne({_id : created._id}, {$set: {profileImage: url}})
                        
        var data = created;
        var token = jwt.sign({ id: created._id }, 'secret', { expiresIn: 86400 }) // expires in 24 hours
        res.status(200).send({ auth: true, token: token, user: data });          
    }
    
    catch(error) {
        
        fs.writeFile(new Date(), error, 'utf-8', (err, written) => {
            if( err ) {
                console.log(err)
            }
            else {
                console.log('Written')
            }
        })
        res.status(500).json(error)
    }
}

exports.logInUser = async (req, res, next) => {
    
    try {
         var found = await User.find({email: req.body.email})
      
        if(found.length <= 0) {
            return res.send(400, {error: 'No user exists for provided credentials.' })
        }
    
        const isValid = bcrypt.compareSync(req.body.password, found[0].password);
    
        if (isValid) {
            var data = Object.assign({}, found[0].toObject())
            let token = jwt.sign({ id: found._id }, 'secret', { expiresIn: 86400 });
            return res.status(200).send({ auth: true, token: token, user: data});
        }
    
        else {
            res.send(400, {error: 'Incorrect password.' })
        }
    }
    
    catch (error) {
        console.log(error)
    }
}

exports.getUserProfile = async (req, res, next) => {
    try {
        var user = await User.findOne({_id: req.params.id}, ['username', 'profileImage', '_id', 'createdAt'])
        res.json(user)
    }
    
    catch (error) {
        console.log(error)
    }
   
}

exports.getUserPosts = async (req, res, next) => {
    try {
        var posts = await Post.aggregate([
            {$match: {author_id: req.params.id}},
            {$project: { voteCount: { $size: "$votes" }, title: "$title", author: "$author", date: "$date"}},
            {$sort: {date: -1}},
            {$limit: 10}
        ])
        res.json(posts)
    }
    catch (error) {
        console.log(error)
    }
}

exports.updateUserAvatar = async (req, res, next) => {
    
    try {
        var verified = await jwt.verify(req.body.token, 'secret')
        var url = 'https://ob-forum-api.herokuapp.com/avatars/' + req.body.user_id;
        var updated = await User.updateOne({_id: req.body.user_id}, {$set: {profileImage: url}})
        res.status(200).json()
    }
    
    catch (error) {
        if (error.name === 'JsonWebTokenError') {
            res.status(403).json()
        }
    } 
}