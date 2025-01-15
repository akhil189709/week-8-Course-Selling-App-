require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const { UserRouter } = require("./routes/userRoutes");
const { courseRouter } = require("./routes/courseRoutes");
const { adminRouter } = require("./routes/adminRoutes");

const app = express();
app.use(express.json());

app.use("/user", UserRouter);
app.use("/admin", adminRouter);
app.use("/course", courseRouter);

async function main() {
  await mongoose.connect(process.env.MONGO_URL);
  app.listen(3000, () => {
    console.log("listening on port 3000");
  });
}
main();
