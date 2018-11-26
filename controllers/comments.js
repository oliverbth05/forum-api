const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.getCommentsByPost = async (req, res, next) => {
    
    try {
        var found = await Comment.aggregate([
            { $match: {
                post_id: req.params.id }},
            { $project: {
                voteCount: {$size: "$votes"},
                author_id: '$author_id',
                author_username: "$author_username",
                date: '$date',
                votes: '$votes', 
                body: '$body',
                replies: '$replies',
                author_profileImage: '$author_profileImage'
            }},
            { $sort: {
                voteCount: -1
            }}
        ])
        res.json(found)
    }
    catch (error) {
        console.log(error)
    }
}

exports.postComment = async (req, res, next) => {
    
    try {
        var verified = await jwt.verify(req.body.token, 'secret')
        
        var created = await Comment.create({
            body: req.body.body,
            date: new Date(),
            author_username: req.body.author_username,
            author_id: req.body.author_id,
            author_profileImage: 'https://frontend-templates-oliverbth05.c9users.io:8081/avatars/' + req.body.author_id,
            post_id: req.body.post_id,
            votes: [],
            replies: []
        })
        var updated = await Post.updateOne({_id: req.body.post_id}, {$inc: {commentCount: 1}})
        res.json(created)
    }
    
    catch (error) {
        if (error.name === 'JsonWebTokenError') {
            res.status(403).json()
        }
    }
}

exports.voteComment = async (req, res, next) => {
    try {
        var voted = await Comment.updateOne({_id: req.body.comment_id}, {$push: {votes: {_id: req.body.voter_id}}})
        var found = await Comment.find({post_id: req.body.post_id}, null, {sort: {voteCount: -1, date: -1}})
        res.json(found) 
    }
    catch (error) {
        console.log(error)
    }
} 

exports.postReply = async (req, res, next) => {
    console.log(req.body.token)
    try {
        var verified = await jwt.verify(req.body.token, 'secret')
        var replied = await Comment.updateOne({_id: req.body.comment_id}, {$push: {replies: {
            body: req.body.body, 
            date: new Date(),
            author: req.body.author,
            author_id: req.body.author_id,
            author_profileImage: 'https://frontend-templates-oliverbth05.c9users.io:8081/avatars/' + req.body.author_id,
            parent_id: req.body.comment_id,
            votes: [],
            voteCount: 0
        }}})
        var found = await Comment.find({post_id: req.body.post_id}, null, {sort: {voteCount: -1, date: -1}})
        res.json(found)
    }
    
    catch (error) {
        if (error.name === 'JsonWebTokenError') {
            res.status(403).json()
        }
    }
}

exports.deleteComment = async (req, res, next) => {
    
    try {
        var verified = await jwt.verify(req.body.token, 'secret')
        var deleted = await Comment.findByIdAndRemove({_id: req.params.id})
        if (deleted === null) {
            res.end()
        }
        res.status(200).json()
    }
    
    catch (error) {
        if (error.name === 'JsonWebTokenError') {
            res.status(403).json()
        }
    }
   
}

exports.getSingleComment = async (req, res, next) => {
    try {
        var found = await Comment.find({_id: req.params.id})
        res.json(found)
    }
    catch(error) {
        console.log(error)
    }
}

exports.updateSingleComment = async (req, res, next) => {
    try {
        var verified = await jwt.verify(req.body.token, 'secret')
        var updated = await Comment.updateOne({_id: req.body.comment_id}, {$set: {body: req.body.body}})
        res.status(200).json()
    }
    
    catch (error) {
        if (error.name === 'JsonWebTokenError') {
            res.status(403).json()
        }
    }
}