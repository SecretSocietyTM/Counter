const express = require("express");
const router  = express.Router();
const path    = require("path");

const rootdir = path.join(__dirname, "../../");
const viewsdir = path.join(rootdir, "public/views");

router.get("/", (req, res) => {
    return res.redirect("/accounts");
});

router.get("/accounts", (req, res) => {
    return res.sendFile(path.join(viewsdir, "auth.html"));
});

router.get("/dashboard", (req, res) => {
    if (!req.session.user) return res.redirect("/accounts");
    return res.sendFile(path.join(viewsdir, "dashboard.html")); 
});

router.get("/foodlist", (req, res) => {
    if (!req.session.user) return res.redirect("/accounts");
    return res.sendFile(path.join(viewsdir, "foodlist.html"));
});

router.get("/recipes", (req, res) => {
    if (!req.session.user) return res.redirect("/accounts");
    return res.sendFile(path.join(viewsdir, "recipes.html"));
})


module.exports = router;