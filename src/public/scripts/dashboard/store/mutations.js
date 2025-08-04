import * as dateUtil from "../../util/shared/date.js";

export default {
    loadCalorieGoal(state, goal) {
        const events = [
            "goalChange", // TODO: might separate loadingGoal and changingGoal to prevent rerender of graphs (graphs render twice, once for goalChange and another for totalsChange)
        ];

        let cal_stats = state.caloriestats;
        cal_stats.goal = goal;
        updateCalorieStats(cal_stats);

        return { events, data: null };
    },

    loadSummaries(state, summaries) {
        const events = [
            "totalsChange",
        ];

        summaries.forEach(summary => {
            state.daily_summaries.push(summary);
            if (!summary) return;
            if (!dayIsEmpty(summary)) state.days_logged++;
            updateWeekTotals(state.week_totals, summary);
        });

        return { events, data: null };
    },

    dateChange(state, date) {
        const events = [
            "dayChange"
        ];

        state.now = date;
        state.total_entries = 0;

        let meal_lists = state.meallists;
        let meal_stats = state.mealstats;
        let cal_stats = state.caloriestats;
        let macros = state.macrostats;
        resetAll(meal_lists, meal_stats, cal_stats, macros);
        
        let week_range = state.week_range;
        let now = state.now;
        if (!(week_range.start <= now && now <= week_range.end)) {
            state.days_logged = 0
            state.daily_summaries.length = 0;
            resetWeekTotals(state.week_totals);
            state.week_range = dateUtil.getWeekRange(now);
            events.push("weekChange");
        }

        return { events, data: null };
    },

    loadEntry(state, entry) {
        const meal_type = entry.meal_type;
        let meal_name = getMealNameByType(meal_type);
        const events = [
            `add${meal_name}Entry`,
            "loadEntry"
        ];

        let meal_list = state.meallists[meal_type];
        let meal_stats = state.mealstats[meal_type];
        let cal_stats = state.caloriestats;
        let macros = state.macrostats;

        state.total_entries++;
        meal_list[entry.entry_id] = entry;
        updateMealStats(meal_stats, entry);
        updateCalorieStatsOnEntry(cal_stats, entry);
        updateMacros(macros, entry);

        return { events, data: entry };
    },

    addEntry(state, payload) {
        const entry = payload.entry;
        const summary = payload.summary;

        const meal_type = entry.meal_type;
        let meal_name = getMealNameByType(meal_type);
        const events = [
            `add${meal_name}Entry`,
            "addEntry",
        ];

        let meal_list = state.meallists[meal_type];
        let meal_stats = state.mealstats[meal_type];
        let cal_stats = state.caloriestats;
        let macros = state.macrostats;
        let week_totals = state.week_totals;


        state.total_entries++;
        if (state.total_entries === 1) state.days_logged++;
        meal_list[entry.entry_id] = entry;
        state.daily_summaries[state.now.getDay()] = summary;
        updateMealStats(meal_stats, entry);
        updateCalorieStatsOnEntry(cal_stats, entry);
        updateMacros(macros, entry);
        updateWeekTotals(week_totals, entry);

        return { events, data: entry };
    }, 

    deleteEntry(state, payload) {
        const entry = payload.entry;
        const summary = payload.summary;

        const meal_type = entry.meal_type;
        let meal_name = getMealNameByType(meal_type);
        const events = [
            `delete${meal_name}Entry`,
            "deleteEntry",
        ];

        let meal_list = state.meallists[meal_type];
        let meal_stats = state.mealstats[meal_type];
        let cal_stats = state.caloriestats;
        let macros = state.macrostats;
        let week_totals = state.week_totals;

        state.total_entries--;
        if (state.total_entries === 0) state.days_logged--;
        delete meal_list[entry.entry_id];
        state.daily_summaries[state.now.getDay()] = summary;
        updateMealStats(meal_stats, entry, "sub");
        updateCalorieStatsOnEntry(cal_stats, entry, "sub");
        updateMacros(macros, entry, "sub");
        updateWeekTotals(week_totals, entry, "sub");

        return { events, data: entry };
    }
}




function getMealNameByType(meal_type) {
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

function dayIsEmpty(day) {
    return !day.cal && !day.fat && !day.carb && !day.prot
}

function updateWeekTotals(obj, input, flag="add") {
    const sign = flag === "sub" ? -1 : 1;
    for (const key in obj) {
        obj[key] += sign * input[key];
    }
    roundMacros(obj);
}

function updateStats(obj, entry, flag="add") {
    const sign = flag === "sub" ? -1 : 1;
    for (const key in obj) {
        obj[key] += sign * entry[key];
    }
    roundMacros(obj);
}

const updateMealStats = updateStats;
const updateMacros = updateStats;

function updateCalorieStatsOnEntry(obj, entry, flag="add") {
    const sign = flag === "sub" ? -1 : 1;
    obj.total += sign * entry.cal
    updateCalorieStats(obj);
}

function updateCalorieStats(obj) {
    if (obj.total <= obj.goal) {
        obj.remaining = obj.goal - obj.total;
        obj.over = 0;
    } else {
        obj.over = obj.total - obj.goal;
        obj.remaining = 0;
    }   
}

function roundMacros(obj) {
    for (let key of ["fat", "carb", "prot"]) {
        obj[key] = Math.round(obj[key] * 10) / 10;
    }    
}



function resetAll(meallists, mealstats, calstats, macros) {
    resetAllMealLists(meallists);
    resetAllMealStats(mealstats);
    resetCalorieStats(calstats);
    resetMacros(macros);
}

function resetAllMealLists(obj) {
    for (const key in obj) {
        obj[key] = {};
    }
}

function resetAllMealStats(obj) {
    for (const i in obj) {
        for (const j in obj[i]) {
            obj[i][j] = 0;
        }
    }
}

function resetCalorieStats(obj) {
    for (const key of ["total", "over"]) {
        obj[key] = 0;
    }
    obj.remaining = obj.goal;
}

function resetMacros(obj) {
    for (const key in obj) {
        obj[key] = 0;
    }
}

function resetWeekTotals(obj) {
    for (const key in obj) {
        obj[key] = 0;
    }    
}