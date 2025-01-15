const { Router } = require("express");
const { courseModel } = require("../db");
const { purchaseModel } = require("../db");
const courseRouter = Router();

courseRouter.post("/purchase", async (req, res) => {
  const userId = req.userId;
  const courseId = req.body.courseId;
  await purchaseModel.create({
    userId,
    courseId,
  });

  res.json({
    message: "You have successfully bought the course!",
  });
});

courseRouter.get("/preview", async (req, res) => {
  const courses = await courseModel.find({});

  res.json({
    courses,
  });
});

module.exports = {
  courseRouter: courseRouter,
};
