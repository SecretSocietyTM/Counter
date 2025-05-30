const express = require("express");
const router  = express.Router();
const path    = require("path");
const db      = require("../database.js");

const rootdir = path.join(__dirname, "../../");


// handles all URLS with localhost:3000/
const views_path = path.join(rootdir, "public/views");

router.get("/", (req, res) => {
    return res.redirect("/accounts");
});

router.get("/accounts", (req, res) => {
    return res.sendFile(path.join(views_path, "auth.html"));
});

router.get("/dashboard", async (req, res) => {
    const now = new Date();
    const username = req.session.user.username;

    try {
        await db.updateUserLogDate(username, now.toDateString());
    } catch (err) {
        return res.json({ success: false, message: "Something went wrong, please try again" });
    }

    return res.sendFile(path.join(views_path, "dashboard.html"));
});


router.get("/foodlist", async (req, res) => {
    return res.sendFile(path.join(views_path, "foodlist.html"));
});
module.exports = router;