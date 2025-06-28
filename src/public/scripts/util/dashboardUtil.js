// updaters
export function updateWeekTotal(obj, summary) {
    for (const key in obj) {
        obj[key] += summary[key];
    }
}

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

function _update(obj, entry, flag="add") {
    const sign = flag === "sub" ? -1 : 1;
    for (const key in obj) {
        obj[key] += sign * entry[key];
    }
    roundMacros(obj);
}

export const updateMealStats = _update;
export const updateMacrosStats = _update;

export function updateWeeklyAverages(obj, entry, days_logged, flag="add") {
    let averages = {};
    const sign = flag === "sub" ? -1 : 1;
    if (days_logged === 0) days_logged = 1;
    for (const key in obj) {
        obj[key] += sign * entry[key];
        averages[key] = Math.round(obj[key] / days_logged);
    }
    return averages;
}



// resetters
export function resetWeekTotals(obj) {
    for (const key in obj) {
        obj[key] = 0;
    }    
}

export function resetAllMealLists(obj) {
    for (const key in obj) {
        obj[key].deleteAll();
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

export function resetAll(meallists, mealstats, calstats, macros) {
    resetAllMealLists(meallists);
    resetAllMealStats(mealstats);
    resetCalorieStats(calstats);
    resetMacros(macros);
}



// misc
export function initWeeklyAverage(obj, days_logged) {
    let averages = {};
    if (days_logged === 0) days_logged = 1;
    for (const key in obj) {
        averages[key] = Math.round(obj[key] / days_logged);
    }
    return averages;
}

export function generateTotalsList(summaries, goal, date, now, weekrange) {
    const daily_totals = []
    for (let i = 0; i < 7; i++) {
        if (!summaries[i]) {
            if (date < weekrange.start || (!(date > weekrange.end) && i < now.getDay())) {
                daily_totals.push(undefined);
            } else daily_totals.push(0);
        } else daily_totals.push(summaries[i].cal / goal * 100);
    }    
}

export function generatePercentagesObj(summary) {
    const macros_sum = summary.fat + summary.carb + summary.prot;
    if (!macros_sum) macros_sum = 1;
    const macro_percentages = {};
    for (const key of ["fat", "carb", "prot"]) {
        macro_percentages[key] = summary[key] / macros_sum;
    }
    
    return macro_percentages;
}

export function roundMacros(obj) {
    for (let key of ["fat", "carb", "prot"]) {
        obj[key] = Math.round(obj[key] * 10) / 10;
    }    
}

export function dayIsEmpty(day) {
    return !day.cal && !day.fat && !day.carb && !day.prot
}