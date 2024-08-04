import express from "express";
import { likePost, isPostLikedByUser } from "../controllers/postsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { postsModel } from "../models/postsModel.js";

const router = express.Router();

router.post("/like/:postId", async (req, res) => {
  const { postId } = req.params;
  const userId = req.headers.userid;

  try {
    const result = await likePost(postId, userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/liked/:postId", async (req, res) => {
  const { postId } = req.params;
  const userId = req.headers.userid;

  try {
    const liked = await isPostLikedByUser(postId, userId);
    res.status(200).json({ liked });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


export default router;
