const express = require("express");
const { UserRouter } = require("./routes/userRoutes");
const { courseRouter } = require("./routes/courseRoutes");
const app = express();

app.use('/user', UserRouter);
app.use('/course', courseRouter);




app.listen(3000);
