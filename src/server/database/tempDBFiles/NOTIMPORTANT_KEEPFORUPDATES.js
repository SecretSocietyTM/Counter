const { connectDB } = require("../connect.js");

async function fixDailySummary() {
    const db = await connectDB();

    const results = await db.all(`
        SELECT 
        user_id, date, calories, fat, carbs, protein
        FROM diary`
    );
    
    const users = {}
    results.forEach(item => {
        let date = item.date;
        if (!(item.user_id in users)) users[item.user_id] = {};
        if (!(date in users[item.user_id])) {
            users[item.user_id][date] = {
                calories: item.calories, 
                fat: item.fat, 
                carbs: item.carbs, 
                protein: item.protein}
        } else {
            for (const key in users[item.user_id][date]) {
                users[item.user_id][date][key] 
                = Math.round((users[item.user_id][date][key] + item[key]) * 10) / 10;
            }
        }
    });

    await db.run(`
        DELETE FROM daily_summary`
    );

    const user_keys = Object.keys(users);
    console.log(user_keys);
    for (const i of user_keys) {
        const date_keys = Object.keys(users[i]);
        console.log(date_keys);
        for (const j of date_keys) {
            console.log(users[i][j]);
            await db.run(`
                INSERT INTO daily_summary
                (user_id, date, calories, fat, carbs, protein)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [i, j, users[i][j].calories, users[i][j].fat, 
                users[i][j].carbs, users[i][j].protein]
            );
        }
    }
    await db.close();
}

async function addDefaultCategories() {
    const db = await connectDB();

    let users = await db.all(`SELECT user_id FROM users`);

    for (const user of users) {
        await db.run(`
            INSERT INTO categories
            (user_id, name)
            VALUES
            (?, ?),
            (?, ?)`,
            [user.user_id, "Mains", user.user_id, "Sides"]
        );
    }
    await db.close();
}

async function updateCategory() {
    const db = await connectDB();

    for (let i = 0; i < 8; i++) {
        if (i % 2 == 0) {
            await db.run(`
                    UPDATE categories
                    SET blurb=?, color=?, emoji=?
                    WHERE category_id=?`,
                    ["The main attraction of a meal!", 4, 1, i+1]
            );
        } else {
            await db.run(`
                    UPDATE categories
                    SET blurb=?, color=?, emoji=?
                    WHERE category_id=?`,
                    ["Add a single side or multiple sides to your main course!", 2, 2, i+1]
            );
        }
    }
    await db.close();
}

/* fixDailySummary(); */

/* addDefaultCategories(); */

updateCategory();