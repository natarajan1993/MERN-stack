const express = require("express")
const {
    check,
    validationResult
} = require('express-validator/check');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Post = require('../../models/Post');

const router = express.Router();

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post('/', [auth, [
    check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req); // Check for any token validation errors
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    try {
        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Post({
            text: req.body.text, // post text is from request body
            name: user.name, // username and avatar is from user object
            avatar: user.avatar,
            user: req.user.id // user id is from request
        });

        const post = await newPost.save(); // save the new post
        res.json(post); // send the post object as a response
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/posts
// @desc    Get all posts
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({
            date: -1
        });
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/posts/:post_id
// @desc    Get post by ID
// @access  Private
router.get('/:post_id', auth, async (req, res) => {
    try {
        const posts = await Post.findById(req.params.post_id);

        if (!posts) return res.status(404).json({
            msg: 'Post not found'
        })
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({
            msg: 'Post not found'
        })
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/posts/:post_id
// @desc    Delete post by ID
// @access  Private
router.delete('/:post_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);

        if (!post) return res.status(404).json({
            msg: 'Post not found'
        });

        //Check if user is the owner of the post
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({
                msg: 'User not authorized'
            });
        }

        await post.remove();

        res.json({
            msg: 'Post removed'
        });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({
            msg: 'Post not found'
        })
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/posts/like:post_id
// @desc    Like a post
// @access  Private

router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        // Check if post has already been liked
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({
                msg: 'Post already liked'
            });
        }
        post.likes.unshift({
            user: req.user.id
        });
        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// @route   PUT api/posts/unlike:post_id
// @desc    Unlike a post
// @access  Private

router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        // Check if post has already been liked
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({
                msg: 'Post not yet liked'
            });
        }
        // Get removeIndex
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
        post.likes.splice(removeIndex, 1);
        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/posts/comment/:id
// @desc    Comment on a post
// @access  Private
router.post('/comment/:post_id', [auth, [
    check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req); // Check for any token validation errors
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.post_id);

        const newComment = {
            text: req.body.text, // comment text is from request body
            name: user.name, // username and avatar is from user object
            avatar: user.avatar,
            user: req.user.id // user id is from request
        };

        post.comments.unshift(newComment);

        await post.save(); // save the new post
        res.json(post.comments); // send the post object as a response
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/posts/comment/:post_id/:comment_id
// @desc    Delete comment on a post
// @access  Private
router.delete('/comment/:post_id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);
        //Get comment from post
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);
        if (!comment) { // Check if comment exists
            return res.status(404).json({
                msg: "Comment not found"
            });
        }
        // Check if deleting user is creator of comment
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({
                msg: 'User not authorized'
            });
        }
        // Get the index of the comment we need to remove based on user id. We are doing this because we don't have a way to get the id of the comment made by that session's user. So we are matching the comment object's user id string to the session's user id
        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);
        post.comments.splice(removeIndex, 1);
        await post.save();
        res.json(post.comments);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
module.exports = router;