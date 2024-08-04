import express from "express";
import { addComment, getComments } from "../controllers/commentsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Route to add a comment to a post (requires authentication)
router.post("/:postId", authMiddleware, addComment);

// Route to get comments for a post
router.get("/:postId", getComments);

export default router;
