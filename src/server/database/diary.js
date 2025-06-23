const { connectDB } = require("./connect.js");

async function addFood(uid, item) {
    const db = await connectDB();
    const result = await db.get(`
        INSERT INTO foods_eaten 
        (user_id, food_id, date_eaten, meal_type, name, 
        serving_size, unit, calories, fat, carbs, protein) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
        RETURNING *`,
        [uid, item.food_id, item.date_eaten, item.meal_type, 
        item.name, item.servsize, item.unit, item.cal, 
        item.fat, item.carb, item.prot]
    );
    await db.close();
    return result;
}

async function getFoodsByDate(uid, date) {
    const db = await connectDB();
    let result = await db.all(`
        SELECT * 
        FROM foods_eaten 
        WHERE user_id=? AND date_eaten=?`,
        [uid, date]
    );
    await db.close();
    return result;
}

async function deleteFood(uid, entry_id) {
    const db = await connectDB();
    const result = await db.get(`
        DELETE FROM foods_eaten 
        WHERE user_id=? AND entry_id=? 
        RETURNING entry_id`,
        [uid, entry_id]
    );
    await db.close();
    return result;
}

module.exports = {
    addFood,
    getFoodsByDate,
    deleteFood
}