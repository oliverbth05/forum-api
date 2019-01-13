const jwt = require('jsonwebtoken');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

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
            {$project: { voteCount: { $size: "$votes" }, title: "$title", author: "$author", date: '$date', image: '$image', views: '$views'}},
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
        await Post.updateOne({_id: req.params.id}, {$inc: {views: 1}})
        res.json(foundPost)
    }
    catch (error) {
        console.log(error)
    }
}

exports.createPost = async (req, res, next) => {
    try {
        var verified = await jwt.verify(req.body.token, 'secret')
       
        await Post.create({
            title:  req.body.title,
            author: req.body.author,
            author_id: req.body.author_id,
            body:   req.body.body,
            image: req.body.image,
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
    var baseUrl = 'https://ob-forum-api.herokuapp.com/';
    try {
        var verified = await jwt.verify(req.body.token, 'secret')

          
        await Post.updateOne({_id: req.body.post_id}, {$set: { //REplace old url with new
            title: req.body.title,
            body: req.body.body,
            image: req.body.image
        }
        })
        res.status(200).json()

    }

    catch (error) {
        if (error.name === 'JsonWebTokenError') {
            res.status(403).json()
        }
    }
}

exports.deletePost = async (req, res, next) => {
    try {
        await Post.deleteOne({_id: req.params.id})
        await Comment.deleteMany({post_id: req.params.id})
        res.status(200).json()
    }
    catch (error) {
        res.status(500).json()
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