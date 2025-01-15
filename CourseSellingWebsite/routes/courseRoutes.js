const { Router } = require("express");
const { courseModel } = require("../db");
const { purchaseModel } = require("../db");
const { userMiddleware } = require("../middlewares/user");
const courseRouter = Router();

courseRouter.post("/purchase", userMiddleware, async (req, res) => {
  const userId = req.userId;
  const courseId = req.body.courseId;

  if (!courseId) {
    res.status(401).json({
      message: "please provide the course id first!",
    });
  }
  const existingPurchase = await purchaseModel.findOne({
    courseId: courseId,
    userId: userId,
  });
  if (existingPurchase) {
    res.status(401).json({
      message: "you have already purchased this course!",
    });
  }

  await purchaseModel.create({
    userId: userId,
    courseId: courseId,
  });

  res.json({
    message: "You have successfully bought the course!",
  });
});

courseRouter.get("/preview", async (req, res) => {
  const courses = await courseModel.find({});

  res.json({
    courses: courses,
  });
});

module.exports = {
  courseRouter: courseRouter,
};
