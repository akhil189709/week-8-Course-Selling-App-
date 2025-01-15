const { Router } = require("express");
const { UserModel, purchaseModel, courseModel } = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { zod } = require("zod");
const UserRouter = Router();
const { JWT_USER_PASSWORD } = require("../config");

UserRouter.post("/signup", async (req, res) => {
  const requiredBody = zod.object({
    email: zod.string().min(5).max(20).email(),
    password: zod.string().min(5).max(20),
    firstName: zod.string().min(5).max(20),
    lastName: zod.string().min(5).max(20),
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
    await UserModel.create({
      email: email,
      password: hashedPassword,
      firstName: firstName,
      lastName: lastName,
    });
  } catch (error) {
    res.status(4001).json({
      message: "you are already signed in!",
    });
  }
  res.status(200).json({
    message: "you are signed up!",
  });
});

UserRouter.post("/signin", async (req, res) => {
  const requiredBody = zod.object({
    email: zod.string().min(5).max(20).email(),
    password: zod.string().min(5).max(20),
  });
  const parsedBody = requiredBody.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(401).json({
      message: "your credentials are not correct!",
      error: parsedBody.error,
    });
  }
  const { email, password } = req.body;

  const user = await UserModel.findOne({
    email: email,
  });

  if (!user) {
    res.status(401).json({
      message: "user not found!",
    });
    return;
  }
  const matchedPassword = await bcrypt.compare(password, user.password);

  if (matchedPassword) {
    const token = jwt.sign(
      {
        id: user._id,
      },
      JWT_USER_PASSWORD
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

UserRouter.get("/purchases", async (req, res) => {
  const userId = req.userId;
  const purchases = await purchaseModel.find({
    userId,
  });

  const courseData = await courseModel.find({
    _id: { $in: purchases.map((purchase) => purchase.courseId) },
  });

  res.json({
    purchases,
    courseData,
  });
});

module.exports = {
  UserRouter: UserRouter,
};
