const express = require("express");
const router  = express.Router();
const db      = require("../../database/database.js");


router.post("/signup", async (req, res) => {
    const { username, password } = req.body;
    let user;

    try {
        user = await db.addUser(username, password);
    } catch (err) {
        const errmsg = err.message.includes("UNIQUE constraint failed")
            ? "Username already taken"
            : "Something went wrong, please try again";
            return res.json({ success: false, errmsg });
    }
    req.session.user = { id: user.user_id }
    return res.json({ success: true, redirect: "/dashboard" })
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    let user;

    try {
        user = await db.authUser(username, password);
    } catch (err) {
        return res.json({success: false, errmsg: "Something went wrong, please try again" });
    }

    if (user) {
        req.session.user = { id: user.user_id };
        return res.json({ success: true, redirect: "/dashboard" });
    } else {
        return res.json({ success: false, errmsg: "Username or password invalid, try again" });
    }
});

module.exports = router;