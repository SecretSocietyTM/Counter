const sqlite  = require("sqlite");
const sqlite3 = require("sqlite3");
const path    = require("path");

// open the database (creates a file if it doesn't exist)
async function connectDB() {
    return await sqlite.open({
        filename: path.join(__dirname, "database.db"),  
        driver: sqlite3.Database,   
    });
}

// user table functions
// update/add data functions
async function addUser(username, password) {
    const db = await connectDB();
    const result = await db.get("INSERT INTO users (username, password) VALUES (?, ?) RETURNING *", [username, password]);
    await db.close();
    return result;
}

async function addCalorieGoal(username, calorie_goal) {
    const db = await connectDB();
    await db.run("UPDATE users SET calorie_goal=? WHERE username=?", [calorie_goal, username]);
    await db.close();
}

async function updateUserLogDate(username, date) {
    const db = await connectDB();
    await db.run("UPDATE users SET last_log_date=? WHERE username=?", [date, username]);
    await db.close();
}


// retrieve data functions
async function authUser(username, password) {
    const db = await connectDB();
    const result = await db.get("SELECT * FROM users WHERE username=? AND password=?", [username, password]);
    await db.close();
    return result;
}


// foods table functions
// update/add data functions
async function addNewFood(uid, food_info) {
    const db = await connectDB();
    const result = await db.get(`INSERT INTO foods 
        (user_id, name, serving_size, unit, calories, fats, carbs, protein) VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
        [uid, food_info["food-name"], food_info["serving-size"], food_info["serving-unit"],
        food_info.calories, food_info.fat, food_info.carbs, food_info.protein]);
    await db.close();
    return result;
}

async function addEatenFood(uid, food_info) {
    const db = await connectDB();
    const result = await db.get(`INSERT INTO food_eaten 
        (user_id, food_id, date_eaten, meal_type, name, serving_size, unit, calories, fats, carbs, protein) VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
        [uid, food_info["food-id"], food_info["date-eaten"], food_info["meal-type"], food_info.name, food_info["serving-size"], 
        food_info["serving-unit"], food_info.calories, food_info.fat, food_info.carbs, food_info.protein]);
    await db.close();
    return result;
}

async function deleteFood(uid, fid) {
    const db = await connectDB();
    await db.run("DELETE FROM foods WHERE user_id=? AND food_id=?", [uid, fid]);
    await db.close();
}

async function editFood(uid, food_info) {
    const db = await connectDB();
    const result = await db.get(`UPDATE foods 
        SET name=?, serving_size=?, unit=?, calories=?, fats=?, carbs=?, protein=?
        WHERE user_id=? AND food_id=? 
        RETURNING *`,
        [food_info["food-name"], food_info["serving-size"], food_info["serving-unit"],
        food_info.calories, food_info.fat, food_info.carbs, food_info.protein, uid, food_info.id]);
    await db.close();
    return result;
}


// retrieve data functions
async function getNFoods(uid, last_fid, n = 12) {
    const db = await connectDB();
    let results = [];
    let fid = last_fid;
    for (let i = 0; i < n; i++) {
        let result = await db.get("SELECT * FROM foods WHERE user_id=? AND food_id>?", [uid, fid]);
        if(!result) break;
        fid = result.food_id;
        results.push(result);
    }
    let total_count = await db.get("SELECT COUNT(*) AS count FROM foods WHERE user_id=?", [uid]);
    await db.close();
    return { results, total_count };
}

async function searchFoodsByName(uid, query) {
    const db = await connectDB();
    let result = await db.all("SELECT * FROM foods WHERE user_id=? AND name LIKE ?", [uid, `%${query}%`]);
    await db.close();
    return result;
}

async function searchFoodsById(uid, fid) {
    const db = await connectDB();
    let result = await db.get("SELECT * FROM foods WHERE user_id=? AND food_id=?", [uid, fid]);
    await db.close();
    return result;
}

async function searchFoodsByDate(uid, date) {
    const db = await connectDB();
    let result = await db.all("SELECT * FROM food_eaten WHERE user_id=? AND date_eaten=?", [uid, date]);
    await db.close();
    return result;
}



module.exports = { connectDB, addUser, addCalorieGoal, updateUserLogDate, authUser, 
    addNewFood, addEatenFood, deleteFood, editFood, getNFoods, 
    searchFoodsByName, searchFoodsById, searchFoodsByDate};