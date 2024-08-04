// import express from "express";
// import zod, { date } from "zod";
// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";

// import { userModel } from "../models/userModel.js";
// import { postsModel } from "../models/postsModel.js";
// import { authMiddleware } from "../middleware/authMiddleware.js";
// import { friendsModel } from "../models/friendsModel.js";
// import { requestsModel } from "../models/requestsModel.js";
// import { messageModel } from "../models/messageModel.js";
// const router = express.Router();
// dotenv.config();

// const jwtsecret = process.env.JWT_SECRET;
// const signupbody = zod.object({
//   email: zod.string().email(),
//   password: zod.string(),
//   username: zod.string(),
// });

// export const createPost = async (req, res) => {
//   try {
//     const userId = req.headers.userid;
//     console.log(userId);
//     if (!userId) {
//       return res
//         .status(401)
//         .json({ message: "Unauthorized: User ID missing in headers" });
//     }
//     const user = await userModel.findOne({
//       _id: userId,
//     });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const { base64 } = req.body;

//     // Create a new post with initialized comments array
//     const newpost = await postsModel.create({
//       userId: userId,
//       likes: 0,
//       caption: req.body.caption,
//       username: user.username,
//       image: base64,
//       comments: [], // Initialize comments as an empty array
//     });

//     res.status(201).json({ message: "Post created successfully" });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error creating post", error: error.message });
//   }
// };

// export const getPosts = async (req, res) => {
//   try {
//     const userId = req.headers.userid;
//     const friends = await friendsModel.findOne({
//       userId: userId,
//     });
//     if (!friends) {
//       return res.status(411).json({
//         message: "Add friends to see their posts on your feed",
//       });
//     }

//     const friendsArray = friends.friends;
//     const posts = await postsModel.find({ userId: { $in: friendsArray } });
//     return res.status(200).json(posts);
//   } catch (error) {
//     return res.status(500).json({
//       message: "error getting the posts",
//     });
//   }
// };

import { postsModel } from "../models/postsModel.js";

// Function to like a post
export const likePost = async (postId, userId) => {
  try {
    const post = await postsModel.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Check if the user already liked the post
    const alreadyLiked = post.likedBy.some(
      (like) => like.userId.toString() === userId
    );
    if (alreadyLiked) {
      post.likes--;
      post.likedBy = post.likedBy.filter(like => like.userId.toString() !== userId);
    } else {
      post.likes++;
      post.likedBy.push({ userId: userId });
    }
    await post.save();

    return { message: "Post liked successfully", post, liked: !alreadyLiked };
  } catch (error) {
    throw new Error(`Error liking post: ${error.message}`);
  }
};

// Function to check if a post is liked by the user
export const isPostLikedByUser = async (postId, userId) => {
  try {
    const post = await postsModel.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    const liked = post.likedBy.some(
      (like) => like.userId.toString() === userId
    );

    return liked;
  } catch (error) {
    throw new Error(`Error checking like status: ${error.message}`);
  }
};
