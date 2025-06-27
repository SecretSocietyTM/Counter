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

module.exports = { 
    mapFood, mapFoods,
    mapEntry, mapEntries,
    mapSummary, mapSummaries
};