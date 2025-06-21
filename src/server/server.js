const express  = require("express");
const session  = require("express-session");
const path     = require("path");

// import routes
const pagesRouter = require("./routes/pages.js");
const userRouter = require("./routes/api/user.js");
const foodRouter = require("./routes/api/food.js");
const diaryRouter = require("./routes/api/diary.js");

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: "this is a secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
}));


// use routes
app.use("/", pagesRouter);
app.use("/api/user", userRouter);
app.use("/api/food", foodRouter);
app.use("/api/diary", diaryRouter);


// run server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});