const express = require("express");
const router  = express.Router();
const db      = require("../../database/database.js");

router.route("/food")
    .get(async (req, res) => {
        const last_fid = parseInt(req.query.last_item);
        let food_query = req.query.query;
        if (food_query === "undefined") food_query = undefined;
        const uid = req.session.user.id;
        let result;

        try {
            result = await db.getNFoods(uid, last_fid, undefined, food_query);
        } catch (err) {
            console.err(err);
            return res.json({ success: false, errmsg: "Something went wrong, please try again" });
        }

        return res.json( {success: true, items: result.results, count: result.count });
    })
    .post(async (req, res) => {
        const item = req.body;
        const uid = req.session.user.id;
        let result;

        try {
            result = await db.addNewFood(uid, item);
        } catch (err) {
            console.err(err);
            return res.json({ success: false, errmsg: "Something went wrong, please try again" });
        }

        return res.json({ success: true, item: result });
    });

/* 
router.get("/food/search", async (req, res) => {
    const last_fid = parseInt(req.query.last_item);
    const food_query = req.query.query;
    console.log("Value of food_query: ", food_query)
    const uid = req.session.user.id;
    let result;

    try {
        result = await db.getNFoods(uid, last_fid, undefined, food_query);
    } catch (err) {
        console.err(err);
        return res.json({ success: false, errmsg: "Something went wrong, please try again" });
    }

    return res.json( {success: true, items: result.results, count: result.count });
});
 */

router.route("/food/:id")
    .patch(async (req, res) => {
        const fid = req.params.id;
        const item = req.body;
        const uid = req.session.user.id;
        let result;

        try {
            result = await db.editFood(uid, fid, item);
        } catch (err) {
            console.err(err);
            return res.json({ success: false, errmsg: "Something went wrong, please try again" });
        }

        return res.json({ success: true, item: result });      
    })
    .delete(async (req, res) => {
        const fid = req.params.id;
        const uid = req.session.user.id;
        let result;

        try {
            result = await db.deleteFood(uid, fid);
        } catch (err) {
            console.err(err);
            return res.json({ success: false, errmsg: "Something went wrong, please try again "});
        }

        return res.json({ success: true, id: result.food_id })
    });

module.exports = router;