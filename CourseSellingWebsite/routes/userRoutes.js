const { Router } = require("express");
const { UserModel, purchaseModel } = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const UserRouter = Router();
const { JWT_USER_PASSWORD } = require("../config");

UserRouter.post("/signup", async (req, res) => {
  const requiredBody = z.object({
    email: z.string().min(5).max(20).email(),
    password: z.string().min(5).max(20),
    firstName: z.string().min(5).max(20),
    lastName: z.string().min(5).max(20),
  });
  const parsedBody = requiredBody.safeParse(req.body);
  if (!parsedBody) {
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
    console.log(error);
  }
  res.json({
    message: "you are signed up!",
  });
});

UserRouter.post("/signin", async (req, res) => {
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
  res.json({
    purchases,
  });
});

module.exports = {
  UserRouter: UserRouter,
};
