const { connectDB } = require("./connect.js");

async function addFood(uid, item) {
    const db = await connectDB();
    const result = await db.get(`
        INSERT INTO foods 
        (user_id, name, serving_size, unit, calories, fat, carbs, protein) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
        RETURNING *`,
        [uid, item.name, item.servsize, item.unit,
        item.cal, item.fat, item.carb, item.prot]
    );
    await db.close();
    return result;
}

async function editFood(uid, fid, item) {
    const db = await connectDB();
    const result = await db.get(`
        UPDATE foods 
        SET name=?, serving_size=?, unit=?, calories=?, fat=?, carbs=?, protein=?
        WHERE user_id=? AND food_id=? 
        RETURNING *`,
        [item.name, item.servsize, item.unit, item.cal,
        item.fat, item.carb, item.prot, uid, fid]
    );
    await db.close();
    return result;
}

async function deleteFood(uid, fid) {
    const db = await connectDB();
    const result = await db.get(`
        DELETE FROM foods 
        WHERE user_id=? AND food_id=? 
        RETURNING food_id`,
        [uid, fid]
    );
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
            result = await db.get(`
                SELECT * 
                FROM foods 
                WHERE user_id=? AND food_id>?`,
                [uid, fid]
            );
        } else {
            result = await db.get(`SELECT * 
                FROM foods 
                WHERE user_id=? AND food_id>? AND name LIKE ?`,
                [uid, fid, `%${str}%`]
            );
        }
        if(!result) break;
        fid = result.food_id;
        results.push(result);
    }
    await db.close();
    return results;
}

async function getFoodById(uid, fid) {
    const db = await connectDB();
    let result = await db.get(`
        SELECT * 
        FROM foods 
        WHERE user_id=? AND food_id=?`,
        [uid, fid]
    );
    await db.close();
    return result;
}

async function getFoodCount(uid, str=undefined) {
    const db = await connectDB();
    let count;
    if (!str) {
        count = await db.get(`
            SELECT COUNT(*) 
            AS x 
            FROM foods 
            WHERE user_id=?`,
            [uid]
        );
    } else {
        count = await db.get(`
            SELECT COUNT(*) 
            AS x 
            FROM foods 
            WHERE user_id=? AND name LIKE ?`,
            [uid, `%${str}%`]
        );
    }
    await db.close();
    return count;
}

module.exports = {
    addFood,
    editFood,
    deleteFood,
    getNFoods,
    getFoodById,
    getFoodCount
}