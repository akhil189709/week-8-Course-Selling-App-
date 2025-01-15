const { Router } = require("express");
const adminRouter = Router();
const { adminModel, courseModel } = require("../db");
const zod = require("zod");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_ADMIN_PASSWORD } = require("../config");
const { adminMiddleware } = require("../middlewares/admin");

adminRouter.post("/signup", async (req, res) => {
  const requiredBody = zod.object({
    email: zod.string().min(5).max(20).email(),
    password: zod.string().min(5).max(20),
    firstName: zod.string().min(5).max(20),
    lastName: zod.string().min(5).max(20),
  });
  const parsedBody = requiredBody.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(401).json({
      message: "invalid inputs!",
      error: parsedBody.error,
    });
    return;
  }

  const { email, password, firstName, lastName } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await adminModel.create({
      email: email,
      password: hashedPassword,
      firstName: firstName,
      lastName: lastName,
    });
  } catch (error) {
    res.status(401).json({
      message: "you are already signed up!",
    });
  }
  res.status(200).json({
    message: "you are signed up!",
  });
});

adminRouter.post("/signin", async (req, res) => {
  const requiredBody = zod.object({
    email: zod.string().min(5).max(20).email(),
    password: zod.string().min(5).max(20),
  });
  const parsedBody = requiredBody.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(401).json({
      message: "invalid inputs!",
      error: parsedBody.error,
    });
    return;
  }
  const { email, password } = req.body;
  const admin = await adminModel.findOne({
    email: email,
  });

  if (!admin) {
    res.status(401).json({
      message: "admin not found!",
    });
    return;
  }
  const matchedPassword = await bcrypt.compare(password, admin.password);

  if (matchedPassword) {
    const token = jwt.sign(
      {
        id: admin._id,
      },
      JWT_ADMIN_PASSWORD
    );
    res.json({
      token: token,
    });
  } else {
    res.status(401).json({
      message: "incorrect credentials!",
    });
  }
});

adminRouter.post("/createCourse", adminMiddleware, async (req, res) => {
  const adminId = req.userId;

  const requireBody = zod.object({
    title: zod.string().min(3),
    description: zod.string().min(10),
    imageUrl: zod.string().url(),
    price: zod.number().positive(),
  });

  const parseDataWithSuccess = requireBody.safeParse(req.body);

  if (!parseDataWithSuccess.success) {
    return res.json({
      message: "Incorrect data format",
      error: parseDataWithSuccess.error,
    });
  }
  const { title, description, imageUrl, price } = req.body;

  const course = await courseModel.create({
    title: title,
    description: description,
    imageUrl: imageUrl,
    price: price,
    creatorId: adminId,
  });
  res.json({
    message: "course created!",
    creatorId: course._id,
  });
});

adminRouter.put("/UpdateCourse", adminMiddleware, async (req, res) => {
  const adminId = req.userId;

  const requireBody = zod.object({
    title: zod.string().min(3),
    description: zod.string().min(10),
    imageUrl: zod.string().url(),
    price: zod.number().positive(),
  });

  const parseDataWithSuccess = requireBody.safeParse(req.body);

  if (!parseDataWithSuccess.success) {
    return res.json({
      message: "Incorrect data format",
      error: parseDataWithSuccess.error,
    });
  }

  const { title, description, imageUrl, courseId, price } = req.body;

  const course = await courseModel.findOne({
    _id: courseId,
    creatorId: adminId,
  });
  if (!course) {
    res.status(401).json({
      message: "course not found!",
    });
  }

  await courseModel.updateOne(
    {
      _id: courseId,
      creatorId: adminId,
    },
    {
      title: title || course.title,
      description: description || course.description,
      imageUrl: imageUrl || course.imageUrl,
      price: price || course.price,
    }
  );
  res.status(200).json({
    message: "course updated!",
    creatorId: course._id,
  });
});
adminRouter.get("/GetCourse", adminMiddleware, async (req, res) => {
  const adminId = req.userId;

  const courses = await courseModel.find({
    creatorId: adminId,
  });
  res.json({
    message: "GetCourse endpoint",
    courses,
  });
});

adminRouter.delete("/deletecourse", adminMiddleware, async (req, res) => {
  const adminId = req.userId;

  const requireBody = zod.object({
    courseId: zod.string().min(5),
  });
  const parseDataWithSuccess = requireBody.safeParse(req.body);
  if (!parseDataWithSuccess.success) {
    res.status(401).json({
      message: "Incorrect data format!",
      error: parseDataWithSuccess.error,
    });
  }
  const { courseId } = req.body;
  const course = await courseModel.findOne({
    _id: courseId,
    creatorId: userId,
  });
  if (!course) {
    res.status(401).json({
      message: "course not found!",
    });
  }
  await courseModel.deleteOne({
    _id: courseId,
    creatorId: adminId,
  });
  res.status(200).json({
    message: "course deleted!",
  });
});

module.exports = {
  adminRouter: adminRouter,
};
