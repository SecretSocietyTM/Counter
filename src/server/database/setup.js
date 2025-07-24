const { connectDB } = require("./connect.js");

async function setup() {
    const db = await connectDB();

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            calorie_goal INTEGER
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

        CREATE TABLE IF NOT EXISTS diary (
            entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            food_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            meal_type INTEGER NOT NULL,
            name TEXT NOT NULL,
            serving_size INTEGER NOT NULL,
            unit TEXT NOT NULL,
            calories INTEGER NOT NULL,
            fat INTEGER NOT NULL,
            carbs INTEGER NOT NULL,
            protein INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS daily_summary (
            user_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            calories INTEGER NOT NULL,
            fat INTEGER NOT NULL,
            carbs INTEGER NOT NULL,
            protein INTEGER NOT NULL,
            PRIMARY KEY (user_id, date)
        );
        `
    );
    await db.close();
}

async function addNewTables(){
    const db = await connectDB();

    await db.exec(`
        CREATE TABLE IF NOT EXISTS categories (
            category_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS recipes (
            recipe_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            category_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            serve_count INTEGER NOT NULL,
            serving_size INTEGER NOT NULL,
            unit TEXT NOT NULL,
            calories INTEGER NOT NULL,
            fat INTEGER NOT NULL,
            carbs INTEGER NOT NULL,
            protein INTEGER NOT NULL,
            source_link TEXT
        );

        CREATE TABLE IF NOT EXISTS recipe_ingredients (
            ingredient_id INTEGER PRIMARY KEY AUTOINCREMENT,
            recipe_id INTEGER NOT NULL,
            food_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            serving_size INTEGER NOT NULL,
            unit TEXT NOT NULL,
            calories INTEGER NOT NULL,
            fat INTEGER NOT NULL,
            carbs INTEGER NOT NULL,
            protein INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS recipe_steps (
            step_id INTEGER PRIMARY KEY AUTOINCREMENT,
            recipe_id INTEGER NOT NULL,
            step_number INTEGER NOT NULL,
            description TEXT
        );
        `
    );
}

async function alter() {
    const db = await connectDB();
    await db.run(`
        ALTER TABLE recipe_ingredients2 RENAME TO recipe_ingredients;`
    )
}

/* setup(); */

/* addNewTables(); */

alter();