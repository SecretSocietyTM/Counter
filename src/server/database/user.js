const { connectDB } = require("./connect.js");

async function addUser(username, password) {
    const db = await connectDB();
    const result = await db.get(`
        INSERT INTO users (username, password, calorie_goal) 
        VALUES (?, ?, ?) 
        RETURNING user_id`,
        [username, password, 0]
    );
    await db.close();
    return result;
}

async function authUser(username, password) {
    const db = await connectDB();
    const result = await db.get(`
        SELECT user_id 
        FROM users 
        WHERE username=? AND password=?`,
        [username, password]
    );
    await db.close();
    return result;
}

async function getCalorieGoal(uid) {
    const db = await connectDB();
    let result = await db.get(`
        SELECT calorie_goal 
        FROM users 
        WHERE user_id=?`, 
        [uid]
    );
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
        [goal, uid]
    );
    await db.close();
    return result;
}

module.exports = {
    addUser,
    authUser,
    getCalorieGoal,
    editCalorieGoal
};