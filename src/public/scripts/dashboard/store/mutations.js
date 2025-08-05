import * as dateUtil from "../../util/shared/date.js";
import * as stateUtil from "../store/stateUtil.js";

export default {
    loadCalorieGoal(state, goal) {
        const events = [
            "goalChange", // TODO: might separate loadingGoal and changingGoal to prevent rerender of graphs (graphs render twice, once for goalChange and another for totalsChange)
        ];

        state.calorie_stats.goal = goal;  
        stateUtil.updateCalorieStats(state.calorie_stats);

        return { events, data: null };
    },

    loadSummaries(state, summaries) {
        const events = [
            "totalsChange",
        ];

        summaries.forEach(summary => {
            state.summaries.push(summary);
            if (!summary) return;
            if (!stateUtil.dayIsEmpty(summary)) state.days_logged++;
            stateUtil.updateWeekTotals(state.week_totals, summary);
        });

        return { events, data: null };
    },

    dateChange(state, date) {
        const events = [
            "dayChange"
        ];

        state.now = date;
        state.total_entries = 0;
        stateUtil.resetAll(state.meal_lists, state.meal_stats, 
            state.calorie_stats, state.macro_stats);
        
        if (!(state.week_range.start <= state.now && 
              state.now <= state.week_range.end)) {
            state.days_logged = 0
            state.summaries.length = 0;
            stateUtil.resetWeekTotals(state.week_totals);
            state.week_range = dateUtil.getWeekRange(state.now);
            events.push("weekChange");
        }

        return { events, data: null };
    },

    loadEntry(state, entry) {
        const meal_type = entry.meal_type;
        let meal_name = stateUtil.getMealNameByType(meal_type);
        const events = [
            `add${meal_name}Entry`,
            "loadEntry"
        ];

        let meal_list = state.meal_lists[meal_type];
        let meal_stats = state.meal_stats[meal_type];

        state.total_entries++;
        meal_list[entry.entry_id] = entry;
        stateUtil.updateMealStats(meal_stats, entry);
        stateUtil.updateCalorieStatsOnEntry(state.calorie_stats, entry);
        stateUtil.updateMacros(state.macro_stats, entry);

        return { events, data: entry };
    },

    addEntry(state, payload) {
        const entry = payload.entry;
        const summary = payload.summary;

        const meal_type = entry.meal_type;
        let meal_name = stateUtil.getMealNameByType(meal_type);
        const events = [
            `add${meal_name}Entry`,
            "addEntry",
        ];

        let meal_list = state.meal_lists[meal_type];
        let meal_stats = state.meal_stats[meal_type];

        state.total_entries++;
        if (state.total_entries === 1) state.days_logged++;
        meal_list[entry.entry_id] = entry;
        state.summaries[state.now.getDay()] = summary;
        stateUtil.updateMealStats(meal_stats, entry);
        stateUtil.updateCalorieStatsOnEntry(state.calorie_stats, entry);
        stateUtil.updateMacros(state.macro_stats, entry);
        stateUtil.updateWeekTotals(state.week_totals, entry);

        return { events, data: entry };
    }, 

    deleteEntry(state, payload) {
        const entry = payload.entry;
        const summary = payload.summary;

        const meal_type = entry.meal_type;
        let meal_name = stateUtil.getMealNameByType(meal_type);
        const events = [
            `delete${meal_name}Entry`,
            "deleteEntry",
        ];

        let meal_list = state.meal_lists[meal_type];
        let meal_stats = state.meal_stats[meal_type];

        state.total_entries--;
        if (state.total_entries === 0) state.days_logged--;
        delete meal_list[entry.entry_id];
        state.summaries[state.now.getDay()] = summary;
        stateUtil.updateMealStats(meal_stats, entry, "sub");
        stateUtil.updateCalorieStatsOnEntry(state.calorie_stats, entry, "sub");
        stateUtil.updateMacros(state.macro_stats, entry, "sub");
        stateUtil.updateWeekTotals(state.week_totals, entry, "sub");

        return { events, data: entry };
    }
}

// commit moved functions to another file.