const express = require("express");
const router  = express.Router();
const db      = require("../../database/index.js");

router.route("/")
    .get(async (req, res) => {
        const last_fid = parseInt(req.query.last_item);
        let food_query = req.query.query;
        if (food_query === "undefined") food_query = undefined;
        const uid = req.session.user.id;
        let result;
        let count;

        try {
            result = await db.foodDB.getNFoods(uid, last_fid, undefined, food_query);
            count = await db.foodDB.getFoodCount(uid, food_query);
        } catch (err) {
            console.error(err);
            return res.json({ success: false, errmsg: "Something went wrong, please try again" });
        }

        return res.json( {success: true, items: result, count: count.x });
    })
    .post(async (req, res) => {
        const item = req.body;
        const uid = req.session.user.id;
        let result;

        try {
            result = await db.foodDB.addFood(uid, item);
        } catch (err) {
            console.error(err);
            return res.json({ success: false, errmsg: "Something went wrong, please try again" });
        }

        return res.json({ success: true, item: result });
    });


router.route("/:id")
    .patch(async (req, res) => {
        const fid = req.params.id;
        const item = req.body;
        const uid = req.session.user.id;
        let result;

        try {
            result = await db.foodDB.editFood(uid, fid, item);
        } catch (err) {
            console.error(err);
            return res.json({ success: false, errmsg: "Something went wrong, please try again" });
        }

        return res.json({ success: true, item: result });      
    })
    .delete(async (req, res) => {
        const fid = req.params.id;
        const uid = req.session.user.id;
        let result;

        try {
            result = await db.foodDB.deleteFood(uid, fid);
        } catch (err) {
            console.error(err);
            return res.json({ success: false, errmsg: "Something went wrong, please try again "});
        }

        return res.json({ success: true, id: result.food_id })
    });

module.exports = router;