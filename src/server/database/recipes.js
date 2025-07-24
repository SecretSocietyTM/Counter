const { connectDB } = require("./connect.js");

async function addRecipe(uid, recipe) {
    const db = await connectDB();
    const result = await db.get(`
        INSERT INTO recipes 
        (user_id, category_id, name, serve_count,
        serving_size, unit, calories, fat, carbs, protein, source_link) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
        RETURNING 
        recipe_id, category_id, name, serve_count,
        serving_size, unit, calories, fat, carbs, protein, source_link`,
        [uid, recipe.category, recipe.name, recipe.serves, recipe.servsize, 
        recipe.unit, recipe.cal, recipe.fat, recipe.carb, recipe.prot, recipe.link]
    );
    await db.close();
    return result;
}

async function addRecipeIngredients(recipe_id, ingredients) {
    let results = [];
    const db = await connectDB();

    for (const ingr of ingredients) {
        const result = await db.get(`
            INSERT INTO recipe_ingredients
            (recipe_id, food_id, name, serving_size, 
            unit, calories, fat, carbs, protein) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) 
            RETURNING 
            ingredient_id, recipe_id, food_id, name, 
            serving_size, unit, calories, fat, carbs, protein`,
            [recipe_id, ingr.food_id, ingr.name, ingr.servsize, 
            ingr.unit, ingr.cal, ingr.fat, ingr.carb, ingr.prot]
        );
        results.push(result);
    }
    await db.close();
    return results;
}

async function addRecipeSteps(recipe_id, steps) {
    // TODO: complete;
}

async function getCategories(uid) {
    let db = await connectDB();;
    let result = await db.all(`
        SELECT category_id, name, blurb, color, emoji
        FROM categories
        WHERE user_id=?`,
        [uid]
    );
    await db.close();
    return result;
}

module.exports = {
    addRecipe,
    addRecipeIngredients,
    addRecipeSteps,
    getCategories
}