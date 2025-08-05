import * as dateUtil from "../../util/shared/date.js"

const NOW = new Date(new Date().setHours(0, 0, 0, 0));
let now = new Date(new Date().setHours(0, 0, 0, 0));

export default {
    NOW,
    WEEK_RANGE: dateUtil.getWeekRange(NOW),
    
    now,
    week_range: dateUtil.getWeekRange(now),

    summaries: [],
    total_entries: 0,
    days_logged: 0,

    meal_lists: {
        1: {},  // breakfast
        2: {},  // lunch
        3: {},  // dinner
        4: {},  // snacks
    },

    meal_stats: {
        1: { cal: 0, fat: 0, carb: 0, prot: 0 },  // breakfast
        2: { cal: 0, fat: 0, carb: 0, prot: 0 },  // lunch
        3: { cal: 0, fat: 0, carb: 0, prot: 0 },  // dinner
        4: { cal: 0, fat: 0, carb: 0, prot: 0 }   // snacks
    },

    calorie_stats: {
        total: 0, goal: null, remaining: 0, over: 0
    },

    macro_stats: { fat:  0,  carb: 0,  prot: 0 },

    week_totals: { cal: 0, fat: 0, carb: 0, prot: 0 }
}