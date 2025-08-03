const express = require("express");
const router  = express.Router();
const db      = require("../../database/index.js");
const mapper  = require("./utils/mapper.js");
const util    = require("./utils/diaryUtil.js");


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

        let entries = mapper.mapEntries(result);
        return res.json( {success: true, entries });
    })
    .post(async (req, res) => {
        const food_info = req.body;
        const uid = req.session.user.id;
        let fid = food_info.food_id;
        let base;
        let result;
        let _result;

        try {
            base = await db.foodDB.getFoodById(uid, fid);
            result = await db.diaryDB.addFood(uid, util.createEntry(base, food_info));
            _result = await db.diaryDB.updateDailySummary(uid, result);
        } catch (err) {
            console.error(err);
            return res.json({ success: false, message: "Something went wrong, please try again" });
        }

        let entry = mapper.mapEntry(result);
        let summary = mapper.mapSummary(_result);
        return res.json({ success: true, entry, summary });
    });

router.delete("/:id", async (req, res) => {
    const entry_id = req.params.id;
    const uid = req.session.user.id;
    let result;
    let _result;

    try {
        result = await db.diaryDB.deleteFood(uid, entry_id);
        _result = await db.diaryDB.updateDailySummary(uid, util.negateEntry(result));
    } catch (err) {
        console.error(err);
        return res.json({ success: false, message: "Something went wrong, please try again" });
    }

    let entry = mapper.mapEntry(result);
    let summary = mapper.mapSummary(_result)
    return res.json({ success: true, entry, summary });
});

router.get("/summary",async (req, res) => {
    const date = req.query.date;
    const uid = req.session.user.id;
    const _date = new Date(date);
    let result;
    
    try {
        result = await db.diaryDB.getWeeklySummary(uid, util.getWeek(_date));
    } catch (err) {
        console.error(err);
        return res.json({ success: false, message: "Something went wrong, please try again" });
    }

    let summaries = mapper.mapSummaries(result);
    return res.json({ success: true, summaries });
});


module.exports = router;