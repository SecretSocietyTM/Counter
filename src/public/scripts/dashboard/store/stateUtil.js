export function getMealNameByType(meal_type) {
    switch(+meal_type) {
        case 1: 
            return "Breakfast";
        case 2:
            return "Lunch";
        case 3: 
            return "Dinner";
        case 4:
            return "Snacks";
    };
}

export function dayIsEmpty(day) {
    return !day.cal && !day.fat && !day.carb && !day.prot
}

export function updateWeekTotals(obj, input, flag="add") {
    const sign = flag === "sub" ? -1 : 1;
    for (const key in obj) {
        obj[key] += sign * input[key];
    }
    roundMacros(obj);
}

export function updateStats(obj, entry, flag="add") {
    const sign = flag === "sub" ? -1 : 1;
    for (const key in obj) {
        obj[key] += sign * entry[key];
    }
    roundMacros(obj);
}

export const updateMealStats = updateStats;
export const updateMacros = updateStats;

export function updateCalorieStatsOnEntry(obj, entry, flag="add") {
    const sign = flag === "sub" ? -1 : 1;
    obj.total += sign * entry.cal
    updateCalorieStats(obj);
}

export function updateCalorieStats(obj) {
    if (obj.total <= obj.goal) {
        obj.remaining = obj.goal - obj.total;
        obj.over = 0;
    } else {
        obj.over = obj.total - obj.goal;
        obj.remaining = 0;
    }   
}

export function roundMacros(obj) {
    for (let key of ["fat", "carb", "prot"]) {
        obj[key] = Math.round(obj[key] * 10) / 10;
    }    
}



export function resetAll(meal_lists, meal_stats, calstats, macros) {
    resetAllMealLists(meal_lists);
    resetAllMealStats(meal_stats);
    resetCalorieStats(calstats);
    resetMacros(macros);
}

export function resetAllMealLists(obj) {
    for (const key in obj) {
        obj[key] = {};
    }
}

export function resetAllMealStats(obj) {
    for (const i in obj) {
        for (const j in obj[i]) {
            obj[i][j] = 0;
        }
    }
}

export function resetCalorieStats(obj) {
    for (const key of ["total", "over"]) {
        obj[key] = 0;
    }
    obj.remaining = obj.goal;
}

export function resetMacros(obj) {
    for (const key in obj) {
        obj[key] = 0;
    }
}

export function resetWeekTotals(obj) {
    for (const key in obj) {
        obj[key] = 0;
    }    
}