const express = require("express");
const router = express.Router();
const ForumPost = require("../models/ForumPost");
const authMiddleware = require("../middleware/authMiddleware");

// GET all posts
router.get("/", async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = {};
        if (category && category !== "All") {
            query.category = category;
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } },
                { cropTag: { $regex: search, $options: "i" } }
            ];
        }
        const posts = await ForumPost.find(query).sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch forum discussions" });
    }
});

// POST new discussion
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { title, content, category, cropTag } = req.body;
        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required" });
        }
        const newPost = new ForumPost({
            author: req.user.email || req.body.author || "Farmer",
            title,
            content,
            category: category || "General Advice",
            cropTag: cropTag || "All Crops"
        });
        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (error) {
        res.status(500).json({ message: "Failed to create forum post" });
    }
});

// POST reply to a discussion
router.post("/:id/reply", authMiddleware, async (req, res) => {
    try {
        const { comment, author } = req.body;
        if (!comment) return res.status(400).json({ message: "Comment cannot be empty" });

        const post = await ForumPost.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        post.replies.push({
            author: author || req.user.email || "Farmer",
            comment,
            date: new Date()
        });
        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: "Failed to add reply" });
    }
});

// POST like / upvote
router.post("/:id/like", authMiddleware, async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const userIdentifier = req.user.email || req.user.id;
        const index = post.likedBy.indexOf(userIdentifier);
        if (index === -1) {
            post.likedBy.push(userIdentifier);
            post.likes = (post.likes || 0) + 1;
        } else {
            post.likedBy.splice(index, 1);
            post.likes = Math.max(0, (post.likes || 0) - 1);
        }
        await post.save();
        res.json({ likes: post.likes, liked: index === -1 });
    } catch (error) {
        res.status(500).json({ message: "Failed to update like" });
    }
});

// DELETE discussion (Author or Admin)
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        await ForumPost.findByIdAndDelete(req.params.id);
        res.json({ message: "Discussion deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete post" });
    }
});

module.exports = router;
