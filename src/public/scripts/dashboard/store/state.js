import * as dateUtil from "../../util/shared/date.js"

const NOW = new Date(new Date().setHours(0, 0, 0, 0));
let now = new Date(new Date().setHours(0, 0, 0, 0));

export default {
    NOW, 
    now,
    WEEK_RANGE: dateUtil.getWeekRange(NOW),
    week_range: dateUtil.getWeekRange(now),

    daily_summaries: [],
    total_entries: 0,
    days_logged: 0,

    meallists: {
        1: {},  // breakfast
        2: {},  // lunch
        3: {},  // dinner
        4: {},  // snacks
    },

    mealstats: {
        1: { cal: 0, fat: 0, carb: 0, prot: 0 },  // breakfast
        2: { cal: 0, fat: 0, carb: 0, prot: 0 },  // lunch
        3: { cal: 0, fat: 0, carb: 0, prot: 0 },  // dinner
        4: { cal: 0, fat: 0, carb: 0, prot: 0 }   // snacks
    },

    caloriestats: {
        total: 0,
        goal: null,
        remaining: 0,
        over: 0
    },

    macrostats: {
        fat:  0, 
        carb: 0, 
        prot: 0
    },

    week_totals: {
        cal: 0,
        fat: 0,
        carb: 0,
        prot: 0
    }
}