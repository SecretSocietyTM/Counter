const { connectDB } = require("./connect.js");

async function setup() {
    const db = await connectDB();

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            calorie_goal INTEGER,
            last_log_date TEXT
        );  

        CREATE TABLE IF NOT EXISTS foods (
            food_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            serving_size INTEGER NOT NULL,
            unit TEXT NOT NULL,
            calories INTEGER NOT NULL,
            fat INTEGER NOT NULL,
            carbs INTEGER NOT NULL,
            protein INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS foods_eaten (
            entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            food_id INTEGER NOT NULL,
            date_eaten TEXT NOT NULL,
            meal_type INTEGER NOT NULL,
            name TEXT NOT NULL,
            serving_size INTEGER NOT NULL,
            unit TEXT NOT NULL,
            calories INTEGER NOT NULL,
            fat INTEGER NOT NULL,
            carbs INTEGER NOT NULL,
            protein INTEGER NOT NULL
        );`
    );
    await db.close();
}

setup();
