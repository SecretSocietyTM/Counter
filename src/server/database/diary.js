const { connectDB } = require("./connect.js");

async function addFood(uid, item) {
    const db = await connectDB();
    const result = await db.get(`
        INSERT INTO diary 
        (user_id, food_id, date, meal_type, name, 
        serving_size, unit, calories, fat, carbs, protein) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
        RETURNING 
        entry_id, date, meal_type, 
        food_id, name, serving_size, unit, calories, fat, carbs, protein`,
        [uid, item.food_id, item.date, item.meal_type, 
        item.name, item.servsize, item.unit, item.cal, 
        item.fat, item.carb, item.prot]
    );
    await db.close();
    return result;
}

async function getFoodsByDate(uid, date) {
    const db = await connectDB();
    let result = await db.all(`
        SELECT 
        entry_id, date, meal_type, 
        food_id, name, serving_size, unit, calories, fat, carbs, protein 
        FROM diary 
        WHERE user_id=? AND date=?`,
        [uid, date]
    );
    await db.close();
    return result;
}

async function deleteFood(uid, entry_id) {
    const db = await connectDB();
    const result = await db.get(`
        DELETE FROM diary 
        WHERE user_id=? AND entry_id=? 
        RETURNING 
        entry_id, date, meal_type, 
        food_id, name, serving_size, unit, calories, fat, carbs, protein`,
        [uid, entry_id]
    );
    await db.close();
    return result;
}

async function updateDailySummary(uid, item) {
    let result;
    const db = await connectDB();
    const row = await db.get(`
        SELECT calories, fat, carbs, protein 
        FROM daily_summary
        WHERE user_id=? AND date=?`,
        [uid, item.date]
    );

    if (row) {
        let updated_cal = Math.round((row.calories + item.calories) * 10) / 10;
        let updated_fat = Math.round((row.fat + item.fat) * 10) / 10;
        let updated_carb = Math.round((row.carbs + item.carbs) * 10) / 10;
        let updated_prot = Math.round((row.protein + item.protein) * 10) / 10;

        result = await db.get(`
            UPDATE daily_summary 
            SET calories=?, fat=?, carbs=?, protein=?
            WHERE user_id=? AND date=? 
            RETURNING calories, fat, carbs, protein`,
            [updated_cal, updated_fat, updated_carb, updated_prot,
            uid, item.date]
        );
    } else {
        result = await db.get(`
            INSERT INTO daily_summary 
            (user_id, date, calories, fat, carbs, protein)
            VALUES (?, ?, ?, ?, ?, ?)
            RETURNING calories, fat, carbs, protein`,
            [uid, item.date, item.calories, item.fat, item.carbs, item.protein]
        );        
    }
    await db.close();
    return result;
}

async function getWeeklySummary(uid, dates) {
    let results = [];
    const db = await connectDB();
    for (const date of dates) {
        let result = await db.get(`
            SELECT calories, fat, carbs, protein 
            FROM daily_summary
            WHERE user_id=? AND date=?`,
            [uid, date]
        );
        results.push(result);
    }
    await db.close()
    return results;
}

module.exports = {
    addFood,
    getFoodsByDate,
    deleteFood,
    updateDailySummary,
    getWeeklySummary
};