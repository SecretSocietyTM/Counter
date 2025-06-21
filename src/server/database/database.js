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
async function addUser(username, password) {
    const db = await connectDB();
    const result = await db.get("INSERT INTO users (username, password, calorie_goal) VALUES (?, ?, ?) RETURNING *", [username, password, 0]);
    await db.close();
    return result;
}

async function authUser(username, password) {
    const db = await connectDB();
    const result = await db.get("SELECT * FROM users WHERE username=? AND password=?", [username, password]);
    await db.close();
    return result;
}

async function addNewFood(uid, item) {
    const db = await connectDB();
    const result = await db.get(`INSERT INTO foods 
        (user_id, name, serving_size, unit, calories, fat, carbs, protein) VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
        [uid, item.name, item.servsize, item.unit,
        item.cal, item.fat, item.carb, item.prot]);
    await db.close();
    return result;
}

async function addEatenFood(uid, item) {
    const db = await connectDB();
    const result = await db.get(`INSERT INTO foods_eaten 
        (user_id, food_id, date_eaten, meal_type, name, serving_size, unit, calories, fat, carbs, protein) VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
        [uid, item.food_id, item.date_eaten, item.meal_type, 
        item.name, item.servsize, item.unit,
        item.cal, item.fat, item.carb, item.prot]);
    await db.close();
    return result;
}

async function getNFoods(uid, last_fid, n = 15, str=undefined) {
    const db = await connectDB();
    let results = [];
    let fid = last_fid;
    for (let i = 0; i < n; i++) {
        let result;
        if (!str) {
            result = await db.get("SELECT * FROM foods WHERE user_id=? AND food_id>?", [uid, fid]);
        } else {
            result = await db.get("SELECT * FROM foods WHERE user_id=? AND food_id>? AND name LIKE ?", [uid, fid, `%${str}%`]);
        }
        if(!result) break;
        fid = result.food_id;
        results.push(result);
    }
    let count;
    if (!str) {
        count = await db.get("SELECT COUNT(*) AS x FROM foods WHERE user_id=?", [uid]);
    } else {
        count = await db.get("SELECT COUNT(*) AS x FROM foods WHERE user_id=? AND name LIKE ?", [uid, `%${str}%`]);
    }
    
    await db.close();
    return { results, count: count.x };
}

async function getFoodsByDate(uid, date) {
    const db = await connectDB();
    let result = await db.all("SELECT * FROM foods_eaten WHERE user_id=? AND date_eaten=?", [uid, date]);
    await db.close();
    return result;
}

async function getCalorieGoal(uid) {
    const db = await connectDB();
    let result = await db.get("SELECT calorie_goal FROM users WHERE user_id=?", [uid]);
    await db.close();
    return result;
}

async function searchFoodById(uid, fid) {
    const db = await connectDB();
    let result = await db.get("SELECT * FROM foods WHERE user_id=? AND food_id=?", [uid, fid]);
    await db.close();
    return result;
}

async function editFood(uid, fid, item) {
    const db = await connectDB();
    const result = await db.get(`UPDATE foods 
        SET name=?, serving_size=?, unit=?, calories=?, fat=?, carbs=?, protein=?
        WHERE user_id=? AND food_id=? 
        RETURNING *`,
        [item.name, item.servsize, item.unit, item.cal,
        item.fat, item.carb, item.prot, uid, fid]);
    await db.close();
    return result;
}

async function editCalorieGoal(uid, goal) {
    const db = await connectDB();
    const result = await db.get(`
        UPDATE users
        SET calorie_goal=? 
        WHERE user_id=?
        RETURNING calorie_goal`,
        [goal, uid]);
    await db.close();
    return result;
}

async function deleteFood(uid, fid) {
    const db = await connectDB();
    const result = await db.get(`DELETE FROM foods WHERE user_id=? AND food_id=? RETURNING food_id`, [uid, fid]);
    await db.close();
    return result;
}

module.exports = { 
    connectDB,
    addUser,
    authUser,
    addNewFood,
    addEatenFood,
    getNFoods,
    getFoodsByDate,
    getCalorieGoal,
    searchFoodById,
    editFood,
    editCalorieGoal,
    deleteFood
};