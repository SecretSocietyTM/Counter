const express = require("express");
const router  = express.Router();
const path    = require("path");
const db      = require("../../database.js");


// handles all URLS with localhost:3000/api/auth
router.post("/signup", async (req, res) => {
    const { username, password } = req.body;
    let query_res;

    try {
        query_res = await db.addUser(username, password);
    } catch (err) {
        const message = err.message.includes("UNIQUE constraint failed")
            ? "Username already taken"
            : "Something went wrong, please try again";
            return res.json({ success: false, message });
    }

    req.session.user = { id: query_res.user_id, username: query_res.username, cal_goal: query_res.calorie_goal };

    return res.json({ success: true, redirectURL: "/dashboard"})
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    let query_res;

    try {
        query_res = await db.authUser(username, password);
    } catch (err) {
        console.log(err);
        return res.json({ success: false, message: "Something went wrong, please try again" });
    }

    if (query_res) {
        req.session.user = { id: query_res.user_id, username: query_res.username, cal_goal: query_res.calorie_goal };
        return res.json({ success: true, redirectURL: "/dashboard" });
    } else {
        return res.json({ succces: false, message: "Username or password invalid, try agian" });
    }
});


module.exports = router;