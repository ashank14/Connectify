import express from "express";
import zod, { date } from "zod";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import { userModel } from "../models/userModel.js";
import { postsModel } from "../models/postsModel.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { friendsModel } from "../models/friendsModel.js";
import { requestsModel } from "../models/requestsModel.js";
import { messageModel } from "../models/messageModel.js";
const router = express.Router();
dotenv.config();

const jwtsecret = process.env.JWT_SECRET;
const signupbody = zod.object({
  email: zod.string().email(),
  password: zod.string(),
  username: zod.string(),
});

//post/get-> localhost:5000/api/user/signup
router.get("/hello",async(req,res)=>{
  return res.json({
    message:"Hello from connectify backend"
  })
});
router.post("/signup", async (req, res) => {
  try {
    const { success } = signupbody.safeParse(req.body);
    if (!success) {
      return res.status(411).json({
        message: "incorrect input",
      });
    }
    const existinguser = await userModel.findOne({
      username: req.body.username,
    });
    if (existinguser) {
      return res.status(411).json({
        message: "username already taken",
      });
    }
    const newUser = await userModel.create({
      email: req.body.email,
      password: req.body.password,
      username: req.body.username,
    });

    const userId = newUser._id;
    await requestsModel.create({
      userId: userId,
      requests: [],
    });
    await friendsModel.create({
      userId: userId,
      friends: [],
    });
    const token = jwt.sign(
      {
        userId,
      },
      jwtsecret
    );

    res.status(200).json({
      message: "User created Successfully",
      token: token,
      userId: userId,
    });
  } catch (error) {
    res.status(500).json({
      message: "error while signing up",
    });
  }
});

const signinbody = zod.object({
  username: zod.string(),
  password: zod.string(),
});

router.post("/signin", async (req, res) => {
  try {
    const { success, data } = signinbody.safeParse(req.body);
    if (!success) {
      return res.status(400).json({ message: "Incorrect input", errors: data });
    }

    const { username, password } = data;

    const user = await userModel.findOne({ username, password });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found or credentials incorrect" });
    }

    const token = jwt.sign({ userId: user._id }, jwtsecret);

    res.json({
      token,
      userId: user._id,
    });
  } catch (error) {
    console.error("Error while signing in:", error);
    res
      .status(500)
      .json({ message: "Error while signing in", error: error.message });
  }
});

router.post("/createpost", authMiddleware, async (req, res) => {
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
});

router.get("/getusers", async (req, res) => {
  try {
    const userId = req.headers.userid;
    const users = await userModel.find({ _id: { $ne: userId } });

    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get('/searchuser', async (req, res) => {
  const searchQuery = req.query.search; // Get the search query from the request
  const userId = req.headers.userid; // Get the userId from the headers
  if (!searchQuery) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  // Function to escape special characters for use in a regular expression
  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  };

  try {
    const escapedSearchQuery = escapeRegExp(searchQuery); // Escape special characters
    const users = await userModel.find({
      $and: [
        { _id: { $ne: userId } }, // Exclude the user with the given userId
        { username: { $regex: new RegExp(escapedSearchQuery, 'i') } }
      ]
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get('/getprofile',async(req,res)=>{
  try{
    const userId=req.headers.userid;
    const user=await userModel.findOne({_id:userId});
    return res.status(200).json(user);
  }catch(error){
    return res.status(411).json(error);
  }
})
router.get("/getposts", authMiddleware, async (req, res) => {
  try {
    const userId = req.headers.userid;
    const friends = await friendsModel.findOne({
      userId: userId,
    });
    if (!friends) {
      return res.status(411).json({
        message: "Add friends to see their posts on your feed",
      });
    }

    const friendsArray = friends.friends;
    const posts = await postsModel.find({ userId: { $in: friendsArray } });
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({
      message: "error getting the posts",
    });
  }
});
router.get("/userposts", authMiddleware, async (req, res) => {
  try {
    const userId = req.query.userId;
    console.log(userId);

    const user = await userModel.findById(userId);
    const posts = await postsModel.find({
      userId: userId,
    });
    const friends = await friendsModel.findOne({
      userId: userId,
    });
    return res.status(200).json({
      user: user,
      posts: posts,
      friends: friends.friends,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get("/sentrequests", async (req, res) => {
  try {
    const userId = req.headers.userid;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const requests = await requestsModel
      .find({ "requests": userId })
      .populate("userId", "username pfp");

    const users = requests.map(request => ({
      username: request.userId.username,
      pfp: request.userId.pfp
    }));

    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error" });
  }
});



router.get("/issent", authMiddleware, async (req, res) => {
  try {
    const userId = req.headers.userid;
    const { to } = req.query;
    const sent = await requestsModel.findOne({
      userId: to,
      requests: userId,
    });
    if (!sent) {
      return res.status(200).json("Add Friend");
    }
    if (sent) {
      return res.status(200).json("Sent");
    }
  } catch (error) {
    return res.status(500).json({
      message: "error",
    });
  }
});

router.post("/sendrequest", authMiddleware, async (req, res) => {
  try {
    const userId = req.headers["userid"];
    const { to } = req.body;
    console.log(to);
    const existingRequest = await requestsModel.findOne({
      userId: to,
      requests: userId,
    });

    const reqalr = await requestsModel.findOne({
      userId: userId,
      requests: to,
    });
    if (reqalr) {
      return res.status(200).json({
        message: "Alreadysent",
      });
    }

    if (existingRequest) {
      return res.status(400).json({
        message: "Request already sent",
      });
    }

    console.log("hello");
    await requestsModel.updateOne(
      { userId: to },
      { $push: { requests: userId } }
    );
    return res.status(200).json({
      message: "request sent successfully",
    });
  } catch (error) {
    return res.json({
      message: error,
    });
  }
});

router.get('/getpfp', async (req, res) => {
  try {
    const { userId } = req.query; 
    console.log("hi");
    console.log(userId);
    
    const user = await userModel.findOne({ _id: userId }); 
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const pfp = user.pfp;
    console.log(pfp);
    
    return res.status(200).json(pfp);
  } catch (error) {
    console.error("Error fetching profile picture:", error);
    return res.status(500).json({ message: "Server error" });
  }
});


router.post('/pfp', async (req, res) => {
  const { pfp } = req.body;
  const userId=req.headers.userid;
  console.log(userId);
  console.log(pfp);
  if (!userId || !pfp) {
      return res.status(400).json({ message: 'User ID and profile picture are required' });
  }

  try {
      const user = await userModel.findByIdAndUpdate(
          userId,
          { pfp: pfp }
      );

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ message: 'Profile picture updated successfully', user });
  } catch (error) {
      res.status(500).json({ message: 'Server error', error });
  }
});
router.get("/getfriends", authMiddleware, async (req, res) => {
  try {
    const userId = req.headers.userid;
    const friends = await friendsModel
      .findOne({
        userId: userId,
      })
      .populate("friends", "username _id pfp");
    if (!friends) {
      return res.status(200).json({
        message: "You have no friends",
      });
    }
    const friendDetails = friends.friends.map((user) => ({
      userId: user._id,
      username: user.username,
      pfp:user.pfp
    }));
    return res.status(200).json(friendDetails);
  } catch (error) {
    return res.status(500).json(error);
  }
});
router.get("/isfriend", authMiddleware, async (req, res) => {
  try {
    const userId = req.headers["userid"];
    const { to } = req.query;

    const isfriend = await friendsModel.findOne({
      userId: userId,
      friends: to,
    });
    if (isfriend) {
      return res.status(200).json("Added");
    }
    if (!isfriend) {
      return res.status(200).json("Add Friend");
    }
  } catch (error) {
    return res.json({ message: error });
  }
});

router.get("/receivedrequests", async (req, res) => {
  try {
    const userId = req.headers.userid;
    const userRequests = await requestsModel
      .findOne({ userId: userId })
      .populate("requests", "username _id pfp");
    const userDetails = userRequests.requests.map((user) => ({
      userId: user._id,
      username: user.username,
      pfp:user.pfp
    }));
    return res.status(200).json(userDetails);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});
router.post("/acceptrequest", authMiddleware, async (req, res) => {
  try {
    const userId = req.headers["userid"];
    const { from } = req.body;

    if (!userId || !from) {
      return res.status(400).json({ message: "userId and from are required" });
    }

    const request = await requestsModel.findOne({
      userId: userId,
      requests: from,
    });

    if (!request) {
      return res.status(400).json({
        message: "No request from this user",
      });
    }

    await requestsModel.updateOne(
      { userId: userId },
      { $pull: { requests: from } }
    );
    await friendsModel.updateOne(
      { userId: userId },
      { $addToSet: { friends: from } },
      { upsert: true }
    );
    await friendsModel.updateOne(
      { userId: from },
      { $addToSet: { friends: userId } },
      { upsert: true }
    );

    return res.status(200).json({
      message: "Request accepted",
    });
  } catch (error) {
    console.error("Error accepting request:", error);
    return res.status(500).json({ message: "Error accepting request" });
  }
});

router.get("/messages", authMiddleware, async (req, res) => {
  try {
    const userId = req.headers.userid;
    const friendId = req.query.friendId;
    const messages = await messageModel.find({
      $or: [
        {
          sender: userId,
          receiver: friendId,
        },
        {
          sender: friendId,
          receiver: userId,
        },
      ],
    });

    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.post("/sendmessage", authMiddleware, async (req, res) => {
  try {
    const userId = req.headers.userid;
    const friendId = req.body.friendId;
    const message = req.body.message;

    const newmessage = await messageModel.create({
      sender: userId,
      receiver: friendId,
      message: message,
      timestamp: Date.now(),
    });
    return res.status(200).json({
      message: "Message sent",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
});

export default router;
