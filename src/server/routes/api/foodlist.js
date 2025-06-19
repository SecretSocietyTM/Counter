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
            console.error(err);
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
            console.error(err);
            return res.json({ success: false, errmsg: "Something went wrong, please try again" });
        }

        return res.json({ success: true, item: result });
    });


router.route("/food/:id")
    .patch(async (req, res) => {
        const fid = req.params.id;
        const item = req.body;
        const uid = req.session.user.id;
        let result;

        try {
            result = await db.editFood(uid, fid, item);
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
            result = await db.deleteFood(uid, fid);
        } catch (err) {
            console.error(err);
            return res.json({ success: false, errmsg: "Something went wrong, please try again "});
        }

        return res.json({ success: true, id: result.food_id })
    });



// TODO: consider combining get and post for these

router.get("/food/day", async (req, res) => {
    let date = req.query.date;
    const uid = req.session.user.id;
    let result;

    try {
        result = await db.getFoodsByDate(uid, date);
    } catch (err) {
        console.error(err);
        return res.json({ success: false, errmsg: "Something went wrong, please try again" });
    }

    return res.json( {success: true, items: result });
});

router.post("/food/add-to-day", async (req, res) => {
    const food_info = req.body;
    const uid = req.session.user.id;
    let fid = food_info.food_id;

    let base;
    try {
        base = await db.searchFoodById(uid, fid);
    } catch (err) {
        console.error(err);
        return res.json({ success: false, message: "Something went wrong, please try again" });
    }

    // TODO: calculations should be done elsewhere, possibly create a new file
    let ratio = parseInt(food_info.servsize) / parseInt(base.serving_size);
    let cal = Math.round(ratio * base.calories);
    let fat = Math.round(ratio * base.fat * 10) / 10;
    let carb = Math.round(ratio * base.carbs * 10) / 10;
    let prot = Math.round(ratio * base.protein * 10) / 10;

    let food_eaten = {
        food_id:    food_info.food_id,
        date_eaten: food_info.date,
        meal_type:  food_info.meal_id,
        name:       base.name,
        servsize:   food_info.servsize,
        unit:       food_info.unit,
        cal, fat, carb, prot       
    };

    let result;
    try {
        result = await db.addEatenFood(uid, food_eaten);
    } catch (err) {
        console.error(err);
        return res.json({ success: false, message: "Something went wrong, please try again" });
    }

    return res.json({ success: true, item: result });
});

module.exports = router;