const { Router } = require("express");
const adminRouter = Router();
const { adminModel } = require("../db");
const { z } = require("zod");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_ADMIN_PASSWORD } = require("../config");
const { adminMiddleware } = require("../middlewares/admin");

adminRouter.post("/signup", async (req, res) => {
  const requiredBody = z.object({
    email: z.string().min(5).max(20).email(),
    password: z.string().min(5).max(20),
    firstName: z.string().min(5).max(20),
    lastName: z.string().min(5).max(20),
  });
  const parsedBody = requiredBody.safeParse(req.body);
  
  if (!parsedBody.success) {
    res.json({
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
    console.log(error);
  }
  res.json({
    message: "you are signed up!",
  });
});

adminRouter.post("/signin", async (req, res) => {
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

  const { title, imageUrl, description, price } = req.body;

  const course = await adminModel.create({
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

  const { title, description, imageUrl, courseId, price } = req.body;

  const course = await adminModel.updateOne(
    {
      _id: courseId,
      creatorId: adminId,
    },
    {
      title: title,
      description: description,
      imageUrl: imageUrl,
      price: price,
    }
  );
  res.json({
    message: "course updated!",
    creatorId: course._id,
  });
});
adminRouter.get("/GetCourse", async (req, res) => {
  const adminId = req.userId;
  const courses = await adminModel.findOne({
    creatorId: adminId,
  });
  res.json({
    message: "GetCourse endpoint",
    courses,
  });
});

module.exports = {
  adminRouter: adminRouter,
};
