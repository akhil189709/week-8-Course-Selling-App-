const { Router } = require("express");
const courseRouter = Router();

courseRouter.post("/purchase", (req, res) => {
  res.json({
    message: "this is the course purchase endpoint",
  });
});

courseRouter.get("/preview", (req, res) => {
  res.json({
    message: "all courses endpoint",
  });
});

module.exports = {
  courseRouter: courseRouter,
};
