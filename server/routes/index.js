import express from "express";
import userRouter from "./userRoutes.js";
import commentsRouter from "./commentsRouter.js";
import postsRouter from "./postsRouter.js";

const router = express.Router();

router.use("/user", userRouter);
router.use("/comments", commentsRouter);
router.use("/posts", postsRouter);

export default router;

