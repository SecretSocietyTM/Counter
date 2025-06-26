const express = require("express");
const router  = express.Router();
const db      = require("../../database/index.js");
const mapper  = require("./utils/mapper.js");


router.route("/")
    .get(async (req, res) => {
        const last_fid = parseInt(req.query.last_item);
        let food_query = req.query.query;
        if (food_query === "undefined") food_query = undefined;
        const uid = req.session.user.id;
        let result;
        let _result;

        try {
            result = await db.foodDB.getNFoods(uid, last_fid, undefined, food_query);
            _result = await db.foodDB.getFoodCount(uid, food_query);
        } catch (err) {
            console.error(err);
            return res.json({ success: false, errmsg: "Something went wrong, please try again" });
        }

        let foods = mapper.mapFoods(result);
        let count = _result.x;
        return res.json( {success: true, items: foods, count });
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

        let food = mapper.mapFood(result);
        return res.json({ success: true, item: food });
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

        let food = mapper.mapFood(result);
        return res.json({ success: true, item: food });      
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

        let food = mapper.mapFood(result);
        return res.json({ success: true, item: food })
    });

module.exports = router;