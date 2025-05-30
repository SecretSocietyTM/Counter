const express    = require("express");
const session    = require("express-session"); 
const path       = require("path");

// import routes
const pagesRouter   = require("./routes/pages.js");
const authRouter    = require("./routes/api/auth.js");
const usersRouter   = require("./routes/api/users.js");
/* const accounts   = require("./routes/accounts.js");
const dashboard  = require("./routes/dashboard.js"); */

const app = express(); 
const port = 3000;     


app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(session({ 
    secret: "this is a secret", 
    resave: false,
    saveUninitialized: false, 
    cookie: { maxAge: 1000 * 60 * 60 * 24},
}));

// use routes
app.use("/", pagesRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);



app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});