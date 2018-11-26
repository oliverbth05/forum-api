const jwt = require('jsonwebtoken');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const fs = require('fs');

function getImageName(str) {
    var imageName = '';
    
    for(var i = str.length - 1; str[i] !== '/'; i--) {
        imageName += str[i]
    }
    
    return imageName.split('').reverse().join('')
}


exports.getAllPosts = async (req, res, next) => {
    
    var sortQuery;
    if (req.query.sort ==='new') {
        sortQuery = {
            $sort: {
                date: -1
            } 
        }
    }
    else if (req.query.sort === 'top') {
        sortQuery = {
            $sort: {
                voteCount: -1
            }
        }
    } 
    else if (req.query.sort === 'hot') {
        sortQuery =  {
            $sort: {
                voteCount: -1, date: -1
            }
        } 
    }
    else {
        sortQuery = null
    }
  
    const currentPage = req.query.page || 1;
    const perPage = 10;
    const page = ((currentPage - 1) * perPage)
    
    try {
        const totalItems = await Post.find().countDocuments()
        const data = await Post.aggregate([
            {$project: { voteCount: { $size: "$votes" }, title: "$title", author: "$author", date: '$date', image: '$image'}},
            sortQuery,
            {$skip: page},
            {$limit: perPage},
        ])
        res.json(data)
    }
    catch(error) {
        console.log(error)
    }
}

exports.getSinglePost = async (req, res, next) => {
    try {
        var foundPost = await Post.findOne({_id: req.params.id})
        var foundUser = await User.findOne({_id: foundPost.author_id}, {_id: 0, profileImage: 1})
        var post = foundPost.toObject();
        var user = foundUser.toObject();
        post.profileImage = user.profileImage;
        
        res.json(post)
    }
    catch (error) {
        console.log(error)
    }
}

exports.createPost = async (req, res, next) => {
    
    try {
        var verified = await jwt.verify(req.body.token, 'secret')
    
        var imageUrl = '';
        var baseUrl = 'https://frontend-templates-oliverbth05.c9users.io:8081/';
        if(req.file) { 
            imageUrl = baseUrl + req.file.path
        }
                
        await Post.create({
            title:  req.body.title,
            author: req.body.author,
            author_id: req.body.author_id,
            body:   req.body.body,
            image: imageUrl,
            date: new Date(),
            votes: [],  
        })
        
        res.status(200).json()
    }    
    catch (error) {
        if (error.name === 'JsonWebTokenError') {
            res.status(403).json()
        }
    }
}

exports.updatePost = async (req, res, next) => {
    var imageUrl;
    var baseUrl = 'https://frontend-templates-oliverbth05.c9users.io:8081/';
    try {
        
        var verified = await jwt.verify(req.body.token, 'secret')
        
        if(req.file) { 
            imageUrl = baseUrl + req.file.path //New Image url
            
            var oldPost = await Post.findOne({_id: req.body.post_id}); //Finds the old image url and deletes it from system
            
            if (oldPost.image !== '') {
                var oldPath = getImageName(oldPost.image);
                var source = '/home/ubuntu/workspace/blog_api/images/' + oldPath;

                fs.unlink(source, (err) => {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        console.log('image deleted')
                    }
                });
            }
            
            await Post.updateOne({_id: req.body.post_id}, {$set: { //REplace old url with new
                title: req.body.title,
                body: req.body.body,
                image: imageUrl
            }
            })
            res.status(200).json()
        }
        
        else { //No image file to be updated
            await Post.updateOne({_id: req.body.post_id}, {$set: {
                title: req.body.title,
                body: req.body.body
            }})
        
            res.status(200).json()
        }
    }
    catch (error) {
        if (error.name === 'JsonWebTokenError') {
            res.status(403).json()
        }
    }
}

exports.deletePost = async (req, res, next) => {
    try {
        var verified = await jwt.verify(req.body.token, 'secret')
        await Post.deleteOne({_id: req.params.id})
        await Comment.deleteMany({post_id: req.params.id})
        res.status(200).json()
    }
    catch (error) {
        if (error.name === 'JsonWebTokenError') {
            res.status(403).json()
        }
    }
}

exports.votePost = async (req, res, next) => {
    try {
        await Post.updateOne({_id: req.body.post_id}, { $addToSet: { votes: {_id: req.body.voter_id}}})  
        var found = await Post.findOne({_id: req.body.post_id})
        res.json(found)
    }
    catch(error) {
        console.log(error)
    }
}