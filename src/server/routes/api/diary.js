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
        let ratio = +food_info.servsize / +base.serving_size;
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
        let result2;
        try {
            result = await db.diaryDB.addFood(uid, food_eaten);
            // TODO: come up with better names
            result2 = await db.diaryDB.updateDailySummary(uid, result);
        } catch (err) {
            console.error(err);
            return res.json({ success: false, message: "Something went wrong, please try again" });
        }

        return res.json({ success: true, item: result, summary: result2 });
    });

router.delete("/:id", async (req, res) => {
    const entry_id = req.params.id;
    const uid = req.session.user.id;
    let result;
    let result2;
    try {
        result = await db.diaryDB.deleteFood(uid, entry_id);
        ['calories', 'fat', 'carbs', 'protein'].forEach(key => {
            result[key] = -result[key];
        });
        result2 = await db.diaryDB.updateDailySummary(uid, result);
    } catch (err) {
        console.error(err);
        return res.json({ success: false, message: "Something went wrong, please try again" });
    }

    // TODO: consider returing the whole item and not just the id
    return res.json({ success: true, id: result.entry_id, summary: result2 });
});

router.get("/summary",async (req, res) => {
    const date = req.query.date;
    const uid = req.session.user.id;
    const _date = new Date(date);
    let dates = [];

    const start = new Date(_date);
    start.setDate(_date.getDate() - _date.getDay());
    start.setHours(0, 0, 0, 0);
    dates.push(start.toDateString());

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(0, 0, 0, 0);

    for (let i = 1; i < 6; i++) {
        const mid = new Date(start);
        mid.setDate(start.getDate() + i);
        mid.setHours(0, 0, 0, 0);
        dates.push(mid.toDateString());
    }
    dates.push(end.toDateString());

    let result;
    try {
        result = await db.diaryDB.getWeeklySummary(uid, dates);
    } catch (err) {
        console.error(err);
        return res.json({ success: false, message: "Something went wrong, please try again" });
    }

    return res.json({ success: true, weekly_summary: result });
});


module.exports = router;