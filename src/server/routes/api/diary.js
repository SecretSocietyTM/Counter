const express = require("express");
const router  = express.Router();
const db      = require("../../database/index.js");


router.route("/")
    .get(async (req, res) => {
        let date = req.query.date;
        const uid = req.session.user.id;
        let result;

        try {
            result = await db.diaryDB.getFoodsByDate(uid, date);
        } catch (err) {
            console.error(err);
            return res.json({ success: false, errmsg: "Something went wrong, please try again" });
        }

        return res.json( {success: true, items: result });
    })
    .post(async (req, res) => {
        const food_info = req.body;
        const uid = req.session.user.id;
        let fid = food_info.food_id;

        let base;
        try {
            base = await db.foodDB.getFoodById(uid, fid);
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
            result = await db.diaryDB.addFood(uid, food_eaten);
        } catch (err) {
            console.error(err);
            return res.json({ success: false, message: "Something went wrong, please try again" });
        }

        return res.json({ success: true, item: result });
    });

router.delete("/:id", async (req, res) => {
    const entry_id = req.params.id;
    const uid = req.session.user.id;
    let result;
    try {
        result = await db.diaryDB.deleteFood(uid, entry_id);
    } catch (err) {
        console.error(err);
        return res.json({ success: false, message: "Something went wrong, please try again" });
    }

    return res.json({ success: true, id: result.entry_id });
});

module.exports = router;