const { connectDB } = require("./connect.js");
const mapper  = require("../routes/api/utils/mapper.js");

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
    let results = [];
    const db = await connectDB();

    for (let i = 0; i < steps.length; i++) {
        const result = await db.get(`
            INSERT INTO recipe_steps
            (recipe_id, step_number, description)
            VALUES (?, ?, ?) 
            RETURNING *`,
            [recipe_id, i+1, steps[i].description]
        );
        results.push(result);        
    }
    await db.close();
    return results;
}

async function editRecipeInfo(uid, recipe) {
    const db = await connectDB();
    const result = await db.get(`
        UPDATE recipes 
        SET category_id=?, name=?, serve_count=?, serving_size=?, 
        unit=?, calories=?, fat=?, carbs=?, protein=?, source_link=?
        WHERE user_id=? AND recipe_id=? 
        RETURNING 
        recipe_id, category_id, name, serve_count,
        serving_size, unit, calories, fat, carbs, protein, source_link`,
        [recipe.category, recipe.name, recipe.serves, 
        recipe.servsize, recipe.unit, recipe.cal, recipe.fat,
        recipe.carb, recipe.prot, recipe.link, uid, recipe.recipe_id]
    );
    await db.close();
    return result;
}

async function editRecipeIngredients(recipe_id, ingredients) {
    let results = [];
    const db = await connectDB();

    let existing_ingredients = await db.all(`
        SELECT ingredient_id
        FROM recipe_ingredients
        WHERE recipe_id=?`,
        [recipe_id]
    );

    const existing = existing_ingredients.map(i => i.ingredient_id);
    const incoming = ingredients.filter(i => i.ingredient_id).map(i => i.ingredient_id);
    const to_delete = existing.filter(id => !incoming.includes(id));

    for (const id of to_delete) {
        await db.run(`
            DELETE FROM recipe_ingredients 
            WHERE ingredient_id=?`,
            [id]
        );
    }

    // update existing ingredients
    for (const ingr of ingredients.filter(i => i.ingredient_id)) {
        const result = await db.get(`
            UPDATE recipe_ingredients
            SET serving_size=?, unit=?, 
            calories=?, fat=?, carbs=?, protein=?
            WHERE ingredient_id=?
            RETURNING *`,
            [ingr.servsize, ingr.unit, ingr.cal, 
            ingr.fat, ingr.carb, ingr.prot, ingr.ingredient_id]
        );
        results.push(result);
    }

    // add new ingredients
    for (const ingr of ingredients.filter(i => !i.ingredient_id)) {
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

async function editRecipeSteps(recipe_id, steps) {
    let results = [];
    const db = await connectDB();

    let existing_steps = await db.all(`
        SELECT step_id
        FROM recipe_steps
        WHERE recipe_id=?`,
        [recipe_id]
    );

    const existing = existing_steps.map(i => i.step_id);
    const incoming = steps.filter(i => i.step_id).map(i => i.step_id);
    const to_delete = existing.filter(id => !incoming.includes(id));

    for (const id of to_delete) {
        await db.run(`
            DELETE FROM recipe_steps 
            WHERE step_id=?`,
            [id]
        );
    }

    // TODO: really have no use for step_number in the database
    // update existing steps
    for (const step of steps.filter(i => i.step_id)) {
        const result = await db.get(`
            UPDATE recipe_steps
            SET description=?
            WHERE step_id=?
            RETURNING *`,
            [step.description, step.step_id]
        );
        results.push(result);
    }

    // add new steps
    for (const step of steps.filter(i => !i.step_id)) {
        const result = await db.get(`
            INSERT INTO recipe_steps
            (recipe_id, step_number, description)
            VALUES (?, ?, ?) 
            RETURNING *`,
            [recipe_id, 0, step.description]
        );
        results.push(result);
    }
    await db.close();
    return results;
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

async function getRecipesInfo(uid) {
    const db = await connectDB();
    let recipes = [];

    let results = await db.all(`
        SELECT 
        recipe_id, category_id, name, serve_count,
        serving_size, unit, calories, fat, carbs, protein, source_link
        FROM recipes
        WHERE user_id=?`,
        [uid]
    );
    for (const item of results) {
        let _results = await db.all(`
            SELECT 
            ingredient_id, recipe_id, food_id, name,
            serving_size, unit, calories, fat, carbs, protein
            FROM recipe_ingredients
            WHERE recipe_id=?`,
            [item.recipe_id]
        );

        let __results = await db.all(`
            SELECT *
            FROM recipe_steps
            WHERE recipe_id=?`,
            [item.recipe_id]
        );

        let info = mapper.mapRecipe(item);
        let ingredients = mapper.mapRecipeIngredients(_results);
        let steps = mapper.mapRecipeSteps(__results);
        let recipe = {info, ingredients, steps}
        recipes.push(recipe);
    }
    await db.close();
    return recipes;
}

module.exports = {
    addRecipe,
    addRecipeIngredients,
    addRecipeSteps,
    editRecipeInfo,
    editRecipeIngredients,
    editRecipeSteps,
    getCategories,
    getRecipesInfo,
}