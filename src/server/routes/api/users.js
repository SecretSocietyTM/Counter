const express = require("express");
const router  = express.Router();
const path    = require("path");
const db      = require("../../database.js");

// handles all URLS with localhost:3000/api/users

/* TODO: probably use one path but use get, post, put/patch */
router.get("/get-goal", (req, res) => {
    const calorie_goal = req.session.user.cal_goal;
    return res.json({ success: true, calorie_goal });
});

router.post("/set-goal", async (req, res) => {
    const { calorie_goal } = req.body;
    const username = req.session.user.username;

    try {
        await db.addCalorieGoal(username, calorie_goal);
    } catch (err) {
        return res.json({ success: false, message: "Something went wrong, please try again" });
    }

    req.session.user.cal_goal = calorie_goal;
    return res.json({ success: true, calorie_goal });
});


router.get("/get-foods", async (req, res) => {
    const uid = req.session.user.id;
    const last_fid_queried = parseInt(req.query.last_item);
    console.log(last_fid_queried);
    let result;

    try {
        result = await db.getNFoods(uid, last_fid_queried);
    } catch (err) {
        return res.json({ success: false, message: "Something went wrong, please try again" });
    }

    let query_res = result.results;
    let total_count = result.total_count;
    console.log(total_count);
    return res.json({ success: true, query_res, total_count });
});

router.get("/get-foods-eaten", async (req, res) => {
    const uid = req.session.user.id;
    const date = req.query.date;
    console.log(date);
    let result;

    try {
        result = await db.searchFoodsByDate(uid, date);
    } catch (err) {
        return res.json({ success: false, message: "Something went wrong, please try again" });
    }

    return res.json({ success: true, result });
});

router.get("/search-get-foods", async (req, res) => {
    const uid = req.session.user.id;
    const query = req.query.query;
    console.log(query);
    let result;

    try {
        result = await db.searchFoodsByName(uid, query);
    } catch (err) {
        return res.json({ success: false, message: "Something went wrong, please try again" });
    }

    return res.json({ success: true, result });
});


router.post("/add-new-food", async (req, res) => {
    const food_info = req.body;
    const uid = req.session.user.id;
    let query_res;

    console.log(uid);
    console.log(food_info);

    try {
        query_res = await db.addNewFood(uid, food_info);
    } catch (err) {
        console.log(err);
        return res.json({ success: false, message: "Something went wrong, please try again" });
    }
    
    return res.json({ success: true, query_res });
});

router.post("/add-food-day", async (req, res) => {
    const food_info = req.body;
    const uid = req.session.user.id;
    const fid = req.body.id;
    
    let base_food;
    try {
        base_food = await db.searchFoodsById(uid, fid);
    } catch (err) {
        return res.json({ success: false, message: "Something went wrong, please try again" });
    }

    // TODO: calculations should be done elsewhere, possibly create a new file
    let ratio = parseInt(food_info["serving-size"]) / parseInt(base_food.serving_size);
    let calories = ratio * base_food.calories;
    let fat = ratio * base_food.fats;
    let carbs = ratio * base_food.carbs;
    let protein = ratio * base_food.protein;

    let food_eaten = {
        "food-id": food_info.id,
        "date-eaten": food_info["date-eaten"],
        "meal-type": food_info.meal,
        name: base_food.name,
        "serving-size": food_info["serving-size"],
        "serving-unit": base_food.unit,
        calories: calories,
        fat: fat,
        carbs: carbs,
        protein: protein
    };

    let query_res;
    try {
        query_res = await db.addEatenFood(uid, food_eaten);
    } catch (err) {
        return res.json({ success: false, message: "Something went wrong, please try again" });
    }

    return res.json({ success: true, query_res });
});

router.delete("/delete-food", async (req, res) => {
    const food_id  = req.body.id;
    const user_id = req.session.user.id;

    try {
        await db.deleteFood(user_id, food_id);
    } catch (err) {
        console.log(err);
        return res.json({ success: false, message: "Something went wrong, please try again" });
    }

    return res.json({ success: true });
});

router.patch("/edit-food", async (req, res) => {
    const food_info = req.body;
    const user_id = req.session.user.id;
    let query_res;

    try {
        query_res = await db.editFood(user_id, food_info);
    } catch (err) {
        console.log(err);
        return res.json( { success: false, message: "Something went wrong, please try again" });
    }

    return res.json({ success: true, query_res});
});


module.exports = router;