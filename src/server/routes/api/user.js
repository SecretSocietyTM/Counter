const express = require("express");
const router  = express.Router();
const db      = require("../../database/index.js");


router.post("/signup", async (req, res) => {
    const { username, password } = req.body;
    let user;

    try {
        user = await db.userDB.addUser(username, password);
    } catch (err) {
        console.error(err);
        const errmsg = err.message.includes("UNIQUE constraint failed")
            ? "Username already taken"
            : "Something went wrong, please try again";
            return res.json({ success: false, errmsg });
    }
    req.session.user = { id: user.user_id };
    return res.json({ success: true, redirect: "/dashboard" });
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    let user;

    try {
        user = await db.userDB.authUser(username, password);
    } catch (err) {
        console.error(err);
        return res.json({success: false, errmsg: "Something went wrong, please try again" });
    }

    if (user) {
        req.session.user = { id: user.user_id };
        return res.json({ success: true, redirect: "/dashboard" });
    } else {
        return res.json({ success: false, errmsg: "Username or password invalid, try again" });
    }
});

router.route("/calorie-goal")
    .get(async (req, res) => { 
        const uid = req.session.user.id;
        let result;

        try {
            result = await db.userDB.getCalorieGoal(uid);
        } catch (err) {
            console.error(err);
            return res.json({ success: false, errmsg: "Something went wrong, please try again" });
        }

        return res.json({ success: true, goal: result.calorie_goal }); 
    })
    .patch(async (req, res) => { 
        const goal = req.body;
        const uid = req.session.user.id;
        let result;

        try {
            result = await db.userDB.editCalorieGoal(uid, goal.goal);
        } catch (err) {
            console.error(err);
            return res.json({ success: false, errmsg: "Something went wrong, please try again" });
        }

        return res.json({ success: true, goal: result.calorie_goal });  
    });

module.exports = router;