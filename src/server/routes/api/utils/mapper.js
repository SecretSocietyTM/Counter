function mapFood(food) {
    if (!food) return undefined;
    return {
        food_id: food.food_id,
        name: food.name,
        servsize: food.serving_size,
        unit: food.unit,
        cal: food.calories,
        fat: food.fat,
        carb: food.carbs,
        prot: food.protein,
    };
}

function mapFoods(foods) {
    let mapped_foods = [];
    foods.forEach(food => {
        mapped_foods.push(mapFood(food));
    });
    return mapped_foods;
}

// TODO: don't need food_id or date on frontend.
function mapEntry(entry) {
    if (!entry) return undefined;
    return {
        entry_id: entry.entry_id,
        date: entry.date,
        meal_type: entry.meal_type,
        food_id: entry.food_id,
        name: entry.name,
        servsize: entry.serving_size,
        unit: entry.unit,
        cal: entry.calories,
        fat: entry.fat,
        carb: entry.carbs,
        prot: entry.protein,
    };   
}

function mapEntries(entries) {
    let mapped_entries = [];
    entries.forEach(entry => {
        mapped_entries.push(mapEntry(entry));
    });
    return mapped_entries;
}

function mapSummary(summary) {
    if (!summary) return undefined;
    if (!summary.calories && !summary.fat && 
        !summary.carbs && !summary.protein) return undefined;
    return {
        cal: summary.calories,
        fat: summary.fat,
        carb: summary.carbs,
        prot: summary.protein
    }
}

function mapSummaries(summaries) {
    let mapped_summaries = [];
    summaries.forEach(summary => {
        mapped_summaries.push(mapSummary(summary));
    });
    return mapped_summaries;
}

function mapRecipe(recipe) {
    if (!recipe) return undefined;
    return {
        recipe_id: recipe.recipe_id,
        category_id: recipe.category_id,
        name: recipe.name,
        serves: recipe.serve_count,
        servsize: recipe.serving_size,
        unit: recipe.unit,
        cal: recipe.calories,
        fat: recipe.fat,
        carb: recipe.carbs,
        prot: recipe.protein,  
        link: recipe.source_link
    }
}

function mapRecipes(recipes) {
    let mapped_recipes = [];
    recipes.forEach(recipe => {
        mapped_recipes.push(mapRecipe(recipe));
    });
    return mapped_recipes;
}


function mapRecipeIngredient(ingredient) {
    if (!ingredient) return undefined;
    return {
        ingredient_id: ingredient.ingredient_id,
        recipe_id: ingredient.recipe_id,
        food_id: ingredient.food_id,
        name: ingredient.name,
        servsize: ingredient.serving_size,
        unit: ingredient.unit,
        cal: ingredient.calories,
        fat: ingredient.fat,
        carb: ingredient.carbs,
        prot: ingredient.protein
    }
}

function mapRecipeIngredients(ingredients) {
    let mapped_ingredients = [];
    ingredients.forEach(ingredient => {
        mapped_ingredients.push(mapRecipeIngredient(ingredient));
    });
    return mapped_ingredients;
}

function mapRecipeStep(step) {
    if (!step) return undefined;
    return {
        step_id: step.step_id,
        recipe_id: step.recipe_id,
        number: step.step_number,
        description: step.description
    }    
}

function mapRecipeSteps(steps) {
    let mapped_steps = [];
    steps.forEach(step => {
        mapped_steps.push(mapRecipeStep(step));
    });
    return mapped_steps;
}

module.exports = { 
    mapFood, mapFoods,
    mapEntry, mapEntries,
    mapSummary, mapSummaries,
    mapRecipe, mapRecipes,
    mapRecipeIngredient, mapRecipeIngredients,
    mapRecipeStep, mapRecipeSteps
};