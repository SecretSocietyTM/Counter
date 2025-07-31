import * as api from "./api/dashboardAPI.js";
import * as util from "./util/dashboardUtil.js"
import * as ui from "./ui/dashboardUI.js";
import * as dateUtil from "./util/shared/date.js";
import { FoodManager } from "./util/shared/foodmanager.js";
import * as searchbar from "../components/searchbar.js";


const SEARCHLIST = new FoodManager();

let daily_summaries = [];

let meal_type = null;
let active_form = null;
let days_logged = 0;
let total_entries = 0;

const NOW = new Date(new Date().setHours(0, 0, 0, 0));
const WEEKRANGE = dateUtil.getWeekRange(NOW);

let now = new Date(new Date().setHours(0, 0, 0, 0));
let week_range = dateUtil.getWeekRange(now);

const diary = document.getElementById("diary");
// buttons
const addfood_btns = document.querySelectorAll(".addfood_btn");
const edit_goal_btn = document.getElementById("edit_goal_btn");

// edit calorie goal elements
const goal_input = document.getElementById("goal_calories_input");

// search dialog elements
const searchbar_target = document.getElementById("searchbar_target");

// dates
const main_date = document.getElementById("main_date");
const sub_date = document.getElementById("sub_date");
const week_date = document.getElementById("week_date");
const date_dropdown = document.getElementById("date_dropdown");
const date_input = document.getElementById("date_input");

const WEEKTOTALS = { 
    cal: 0,
    fat: 0,
    carb: 0,
    prot: 0 
}
const MEALLISTS = {
    1: new FoodManager(),
    2: new FoodManager(),
    3: new FoodManager(),
    4: new FoodManager()
}
const MEALSTATS = {
    1: { cal: 0, fat: 0, carb: 0, prot: 0 },
    2: { cal: 0, fat: 0, carb: 0, prot: 0 },
    3: { cal: 0, fat: 0, carb: 0, prot: 0 },
    4: { cal: 0, fat: 0, carb: 0, prot: 0 }
}
const CALORIESTATS = { 
    total: 0,
    goal: null,
    remaining: 0,
    over: 0 
}
const MACROSTATS = { 
    fat:  0, 
    carb: 0, 
    prot: 0 
}
const MEALLISTS_UI = Object.freeze({
    1: document.getElementById("breakfast_list"),
    2: document.getElementById("lunch_list"),
    3: document.getElementById("dinner_list"),
    4: document.getElementById("snacks_list")
});
const MEALSTATS_UI = Object.freeze({
    1: document.getElementById("breakfast_numbers"),
    2: document.getElementById("lunch_numbers"),
    3: document.getElementById("dinner_numbers"),
    4: document.getElementById("snacks_numbers")
});
const CALORIESTATS_UI = Object.freeze({
    goal:      document.getElementById("goal_calories"),
    remaining: document.getElementById("remaining_calories"),
    over:      document.getElementById("over_calories"),
});
const MACROSTATS_UI = Object.freeze({
    fat:  document.getElementById("main_fat"),
    carb: document.getElementById("main_carb"),
    prot: document.getElementById("main_prot")
});
const AVERAGES_UI = Object.freeze({
    cal:  document.getElementById("average_calories"),
    fat:  document.getElementById("average_fat"),
    carb: document.getElementById("average_carb"),
    prot: document.getElementById("average_prot"),
});
const CALORIEDIAL_UI = Object.freeze({
    bar: document.getElementById("progress_bar"),
    pointer: document.getElementById("indicator_pointer"),
    text: document.getElementById("indicator_text"),
    dashoffset: 189.5,
    rotation: -128,
});
const BARGRAPHS_UI = {
    cal_bargraph: document.getElementById("calorie-bar-graph"),
    macro_bargraph: document.getElementById("macro-bar-graph"),
    dashoffsets: { null: 84, goal: 56, over: 9},
    cal_bars: [],
    macro_bars: []
}
BARGRAPHS_UI.cal_bars = ui.getDayBars(BARGRAPHS_UI.cal_bargraph);
BARGRAPHS_UI.macro_bars = ui.getDayBars(BARGRAPHS_UI.macro_bargraph);

// helpers
function updateStateUI(entry, meal_type, flag, li) {
    if (!flag) { // init
        MEALLISTS[meal_type].add(entry);
        MEALLISTS_UI[meal_type].appendChild(ui.createEntry(entry));
    } else if (flag == "add") { // add
        total_entries++
        if (total_entries === 1) days_logged++;
        MEALLISTS[meal_type].add(entry);
        MEALLISTS_UI[meal_type].appendChild(ui.createEntry(entry));
    } else if (flag == "sub") { // delete
        total_entries--
        if (total_entries === 0) days_logged--;
        MEALLISTS[meal_type].delete(entry.entry_id, "entry_id");
        li.remove();
    }

    util.updateMealStats(MEALSTATS[meal_type], entry, flag);
    util.updateCalorieStatsOnEntry(CALORIESTATS, entry, flag);
    util.updateMacrosStats(MACROSTATS, entry, flag);

    ui.setMealStatsUI(MEALSTATS_UI[meal_type], MEALSTATS[meal_type]);
    ui.setCalorieStatsUI(CALORIESTATS_UI, CALORIESTATS);
    ui.setCalDialUI(CALORIEDIAL_UI, CALORIESTATS);
    ui.setMacroStatsUI(MACROSTATS_UI, MACROSTATS);

    if(flag) {
        const averages = util.updateWeeklyAverages(WEEKTOTALS, entry, days_logged, flag);
        ui.setWeeklyAveragesUI(AVERAGES_UI, averages);
    }
}



// open search dialog
addfood_btns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        meal_type = e.target.closest("button").dataset.meal_type;
        searchbar.showSearch();
    });
});

// sets up calorie goal input
edit_goal_btn.addEventListener("click", (e) => {
    ui.activateGoalInput(CALORIESTATS_UI.goal, goal_input);    
});

// edit calorie goal event
goal_input.addEventListener("keydown", async (e) => {
    if (e.key === "Escape") {
        ui.deactivateGoalInput(CALORIESTATS_UI, goal_input);
    } else if (e.key === "Enter") {
        goal_input.blur();
    }
});

// actually updates the calorie goal when the input is blurred
goal_input.addEventListener("blur", async (e) => {
    if (goal_input.style.display == "none") {
        return;
    }
    if (goal_input.value < 1 || goal_input.value % 1 > 1) {
        ui.deactivateGoalInput(CALORIESTATS_UI, goal_input);
        return;
    }

    const data = await api.updateCalorieGoal(goal_input.value);

    if (data.success) {
        CALORIESTATS.goal = data.goal;
        util.updateCalorieStats(CALORIESTATS);
        ui.setCalorieStatsUI(CALORIESTATS_UI, CALORIESTATS);
        ui.setCalDialUI(CALORIEDIAL_UI, CALORIESTATS);
        
        const totals = util.generateTotalsList(daily_summaries, CALORIESTATS.goal, now, NOW, WEEKRANGE)
        ui.setAllCalorieGraphBars(BARGRAPHS_UI, totals);
        ui.deactivateGoalInput(CALORIESTATS_UI, goal_input);
    } else {
        alert(data.errmsg);
    }
});

date_input.addEventListener("change", (e) => {
    total_entries = 0;
    util.resetAll(MEALLISTS, MEALSTATS, CALORIESTATS, MACROSTATS);
    ui.resetAllUI(MEALLISTS_UI, MEALSTATS_UI, CALORIEDIAL_UI, CALORIESTATS_UI, MACROSTATS_UI);
    ui.resetCalDialUI(CALORIEDIAL_UI);

    now = dateUtil.getNewNowDate(date_input.value);
    let label = dateUtil.getLabel(now, NOW);
    if (label) {
        ui.setMainDate(main_date, label);
        ui.setSubDate(sub_date, dateUtil.formatDate(now));
    } else {
        ui.setMainDate(main_date, undefined, dateUtil.dowToString(now));
        ui.setSubDate(sub_date, dateUtil.formatDateNoDow(now));
    }

    if (!(week_range.start <= now && now <= week_range.end)) {
        days_logged = 0;
        util.resetWeekTotals(WEEKTOTALS);
        week_range = dateUtil.getWeekRange(now);
        ui.setWeekDate(week_date, dateUtil.formatWeekRange(now));
        ui.resetGraphs(BARGRAPHS_UI);
        daily_summaries.length = 0;
        initWeeklySummary(now);
    }
    initDiary(now);
});

// add to diary event
async function addToDiary(entry_data) {
    const data = await api.addToDiary(entry_data);

    if (data.success) {
        daily_summaries[now.getDay()] = data.summary;
        updateStateUI(data.entry, meal_type, "add", undefined);

        let macro_percentages = util.generatePercentagesObj(daily_summaries[now.getDay()]);
        let value = daily_summaries[now.getDay()].cal / CALORIESTATS.goal * 100;
        ui.setCalorieGraphBar(BARGRAPHS_UI.cal_bars[now.getDay()], value, BARGRAPHS_UI.dashoffsets);
        ui.setMacroGraphBar(BARGRAPHS_UI.macro_bars[now.getDay()], macro_percentages);
    } else {
        alert(data.errmsg);
    }    
}

// delete from diary event
diary.addEventListener("click", async (e) => {
    const delete_btn = e.target.closest(".delete_btn");
    if (!delete_btn) return;
    const li = e.target.closest("li");
    const list = li.closest("ul");
    const meal_type = list.dataset.meal_type;

    const entry = MEALLISTS[meal_type].getFoodById(li.dataset.id, "entry_id");

    const data = await api.deleteFromDiary(li.dataset.id);

    if (data.success) {
        daily_summaries[now.getDay()] = data.summary;
        updateStateUI(data.entry, meal_type, "sub", li);

        if (!daily_summaries[now.getDay()]) {
            if (now < WEEKRANGE.start || 
                (!(now > WEEKRANGE.end) && now < NOW.getDay())) {
                ui.setCalorieBarNull(BARGRAPHS_UI.cal_bars[now.getDay()]);
                ui.setMacroBarNull(BARGRAPHS_UI.macro_bars[now.getDay()]);
            }
        } else {
            let macro_percentages = util.generatePercentagesObj(daily_summaries[now.getDay()]);
            let value = daily_summaries[now.getDay()].cal / CALORIESTATS.goal * 100;
            ui.setCalorieGraphBar(BARGRAPHS_UI.cal_bars[now.getDay()], value, BARGRAPHS_UI.dashoffsets);
            ui.setMacroGraphBar(BARGRAPHS_UI.macro_bars[now.getDay()], macro_percentages); 
        }
    } else {
        alert(data.errmsg);
    }
    console.log(daily_summaries);
});



// page init functions
async function initCalorieGoal() {
    const data = await api.getCalorieGoal();

    if (data.success) {
        CALORIESTATS.goal = data.goal;
        CALORIESTATS.remaining = CALORIESTATS.goal;
        CALORIESTATS_UI.goal.textContent = CALORIESTATS.goal;
        CALORIESTATS_UI.remaining.textContent = CALORIESTATS.goal;
    } else {
        alert(data.errmsg);
    }
}

async function initDiary(date) {
    const data = await api.getDiary(date);

    if (data.success) {
        total_entries = data.entries.length;
        for (let i = 0; i < data.entries.length; i++) {
            let meal_type = data.entries[i].meal_type;
            updateStateUI(data.entries[i], meal_type, undefined, undefined);
        }
    } else {
        alert(data.errmsg);
    }
}

async function initWeeklySummary(date) {
    const data = await api.getWeeklySummary(date);

    if (data.success) {
        data.summaries.forEach(summary => { daily_summaries.push(summary); });

        for (let i = 0; i < daily_summaries.length; i++) {
            if (!daily_summaries[i]) {
                if (now < WEEKRANGE.start || 
                    (!(now > WEEKRANGE.end) && i < NOW.getDay())) {
                    ui.setCalorieBarNull(BARGRAPHS_UI.cal_bars[i]);
                    ui.setMacroBarNull(BARGRAPHS_UI.macro_bars[i]);
                }
            } else {
                if (!util.dayIsEmpty(daily_summaries[i])) days_logged++;
                util.updateWeekTotal(WEEKTOTALS, daily_summaries[i]);
                let macro_percentages = util.generatePercentagesObj(daily_summaries[i]);
                let value = daily_summaries[i].cal / CALORIESTATS.goal * 100;
                ui.setCalorieGraphBar(BARGRAPHS_UI.cal_bars[i], value, BARGRAPHS_UI.dashoffsets)
                ui.setMacroGraphBar(BARGRAPHS_UI.macro_bars[i], macro_percentages);
            }
        }
        const avg_obj = util.initWeeklyAverage(WEEKTOTALS, days_logged);
        ui.setWeeklyAveragesUI(AVERAGES_UI, avg_obj);
    }
    console.log(daily_summaries);
}

await searchbar.loadSearchbar(searchbar_target);

searchbar_target.querySelector("#search_dialog").
    addEventListener("searchbar:submit", (e) => {
    const form_data = e.detail.form_data;
    form_data.meal_type = meal_type;
    form_data.date = now.toDateString();
    addToDiary(form_data)
});

ui.setSubDate(sub_date, dateUtil.formatDate(now));
ui.setWeekDate(week_date, dateUtil.formatWeekRange(now));
initCalorieGoal();
initDiary(now);
initWeeklySummary(now);