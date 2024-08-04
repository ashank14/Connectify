import { postsModel } from "../models/postsModel.js";
import { userModel } from "../models/userModel.js"; // Import userModel

// Add a comment to a post
export const addComment = async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;

  // Ensure req.user is defined and has necessary properties
  const userId = req.user?.userId;

  try {
    const post = await postsModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Fetch the username from userModel based on userId
    const user = await userModel.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const username = user.username;

    // Create a new comment object with userId and username
    const newComment = {
      userId: userId,
      username: username,
      text: text,
    };

    // Push the new comment into the comments array of the post
    post.comments.push(newComment);

    // Save the updated post document
    const savedPost = await post.save();

    res.status(201).json(savedPost); // Return the updated post
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get comments for a post
export const getComments = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await postsModel
      .findById(postId)
      .populate("comments.userId", "username");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
