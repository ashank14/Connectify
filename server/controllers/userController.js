export const createPost = async (req, res) => {
  try {
    const userId = req.headers.userid;
    console.log(userId);
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User ID missing in headers" });
    }
    const user = await userModel.findOne({
      _id: userId,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { base64 } = req.body;

    // Create a new post with initialized comments array
    const newpost = await postsModel.create({
      userId: userId,
      likes: 0,
      caption: req.body.caption,
      username: user.username,
      image: base64,
      comments: [], // Initialize comments as an empty array
    });

    res.status(201).json({ message: "Post created successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating post", error: error.message });
  }
};
