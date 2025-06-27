import { FoodManager } from "./util/foodmanager.js";
import * as dateUtil from "./util/date.js";
import * as ui from "./ui/dashboardUI.js";
import * as api from "./api/dashboardAPI.js";
import * as util from "./util/dashboardUtil.js"


const SEARCHLIST = new FoodManager();

let week_summary = [];

let meal_type = null;       // TODO: look for instances of meal_type, why is it null?
let active_form = null;
let days_logged = 0;

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
const search_dialog = document.getElementById("search_dialog");
const search_input = document.getElementById("searchbar_input");
const searchlist = document.getElementById("searchlist");

// dates
const sub_date = document.getElementById("sub_date");
const week_date = document.getElementById("week_date");
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
const AVERAGE_UI = Object.freeze({
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


// open search dialog
addfood_btns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        meal_type = e.target.closest("button").dataset.meal_type;
        search_dialog.style.display = "flex";
        search_dialog.showModal();
    });
});

// closing search dialog with Esc
search_dialog.addEventListener("cancel", (e) => {
    search_dialog.style.display = "none";
    search_input.value = "";
    searchlist.replaceChildren();
    search_dialog.close();
});

// sets up calorie goal input
edit_goal_btn.addEventListener("click", (e) => {
    CALORIESTATS_UI.goal.style.display = "none";
    goal_input.style.display = "inline-block";
    goal_input.value = CALORIESTATS_UI.goal.textContent;
    goal_input.select();
    goal_input.focus();
});

// edit event
goal_input.addEventListener("keydown", async (e) => {
    if (e.key === "Escape") {
        CALORIESTATS_UI.goal.style.display = "inline";
        goal_input.style.display = "none";
        goal_input.value = "";
    } else if (e.key === "Enter") {
        goal_input.blur();
    }
});

goal_input.addEventListener("blur", async (e) => {
    if (goal_input.style.display == "none") {
        return;
    }
    // input check
    if (goal_input.value < 1 || goal_input.value % 1 > 1) {
        CALORIESTATS_UI.goal.style.display = "inline";
        goal_input.style.display = "none";
        goal_input.value = "";
        return;
    }

    const data = await api.updateCalorieGoal(goal_input.value);

    CALORIESTATS.total = data.goal;
    ui.setCalDial(CALORIEDIAL_UI, CALORIESTATS);
    CALORIESTATS.remaining = CALORIESTATS.total - CALORIESTATS.main;
    CALORIESTATS.over = 0;
    if (CALORIESTATS.remaining < 0) {
        CALORIESTATS.over += Math.abs(CALORIESTATS.remaining);
        CALORIESTATS.remaining = 0;
    }
    CALORIESTATS_UI.remaining.textContent = CALORIESTATS.remaining;
    CALORIESTATS_UI.over.textContent = CALORIESTATS.over;
    CALORIESTATS_UI.goal.textContent = data.goal;

    CALORIESTATS_UI.goal.style.display = "inline";
    goal_input.style.display = "none";
    goal_input.value = "";
});

// simplified search event
search_input.addEventListener("input", async (e) => {
    let searchterm = e.target.value;
    searchlist.replaceChildren();

    if (searchterm.length == 0) return;

    const data = await api.getFoods(0, searchterm);

    if (data.success) {
        if (data.count == 0) return;
        for (let i = 0; i < data.foods.length; i++) {
            SEARCHLIST.add(data.foods[i]);
            searchlist.appendChild(ui.createSearchResult(data.foods[i]));
        }
    } else {
        alert(data.errmsg);
    }
});

// add to diary event
function setupForm(form) {
    form.addEventListener("click", async (e) => {
        if (!e.target.closest("#searchform_submit_btn")) return;
        const form_data = new FormData(form);
        const form_obj = Object.fromEntries(form_data.entries());

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const data = await api.addToDiary(form_obj);

        if (data.success) {
            if (MEALLISTS[meal_type].size()) days_logged++;
            MEALLISTS[meal_type].add(data.entry);
            MEALLISTS_UI[meal_type].appendChild(ui.createEntry(data.entry));
            week_summary[now.getDay()] = data.summary;
            util.updateMealStats(MEALSTATS[meal_type], data.entry);
            ui.setMealStatsUI(MEALSTATS_UI[meal_type], MEALSTATS[meal_type]);
            util.updateCalorieStats(CALORIESTATS, data.entry);
            ui.setCalorieStatsUI(CALORIESTATS_UI, CALORIESTATS);
            ui.setCalDial(CALORIEDIAL_UI, CALORIESTATS);
            util.updateMacrosStats(MACROSTATS, data.entry);
            ui.setMacroStatsUI(MACROSTATS_UI, MACROSTATS);

            const macros_sum = week_summary[now.getDay()].fat + 
                week_summary[now.getDay()].carb + week_summary[now.getDay()].prot;
            if (!macros_sum) macros_sum = 1;
            const macro_percentages = {};
            for (const key of ["fat", "carb", "prot"]) {
                macro_percentages[key] = week_summary[now.getDay()][key] / macros_sum;
            }

            let value = week_summary[now.getDay()].cal / CALORIESTATS.goal * 100;
            ui.setCalorieGraphBar(BARGRAPHS_UI.cal_bars[now.getDay()], value, BARGRAPHS_UI.dashoffsets);
            ui.setMacroGraphBar(BARGRAPHS_UI.macro_bars[now.getDay()], macro_percentages);

            const avg_obj = util.updateWeeklyAverages(WEEKTOTALS, data.entry, days_logged);
            ui.setWeeklyAveragesUI(AVERAGE_UI, avg_obj);

            search_input.value = "";
            search_input.focus();
            searchlist.replaceChildren();
            active_form.remove();
            active_form = null;
        } else {
            alert(data.errmsg);
        }
        console.log(week_summary);
    });
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
        MEALLISTS[meal_type].delete(data.entry.entry_id, "entry_id");
        if (!MEALLISTS[meal_type].size()) days_logged--;
        li.remove();
        week_summary[now.getDay()] = data.summary;
        util.updateMealStats(MEALSTATS[meal_type], entry, "sub");
        ui.setMealStatsUI(MEALSTATS_UI[meal_type], MEALSTATS[meal_type]);
        util.updateCalorieStats(CALORIESTATS, data.entry, "sub");
        ui.setCalorieStatsUI(CALORIESTATS_UI, CALORIESTATS);
        ui.setCalDial(CALORIEDIAL_UI, CALORIESTATS);
        util.updateMacrosStats(MACROSTATS, entry, "sub");
        ui.setMacroStatsUI(MACROSTATS_UI, MACROSTATS);

        if (!week_summary[now.getDay()]) {
            if (now < WEEKRANGE.start || 
                (!(now > WEEKRANGE.end) && i < NOW.getDay())) {
                ui.setCalorieBarNull(BARGRAPHS_UI.cal_bars[now.getDay()]);
                ui.setMacroBarNull(BARGRAPHS_UI.macro_bars[now.getDay()]);
            }
        } else {
            const macros_sum = week_summary[now.getDay()].fat + 
                week_summary[now.getDay()].carb + week_summary[now.getDay()].prot;
            if (!macros_sum) macros_sum = 1;
            const macro_percentages = {};
            for (const key of ["fat", "carb", "prot"]) {
                macro_percentages[key] = week_summary[now.getDay()][key] / macros_sum;
            }

            let value = week_summary[now.getDay()].cal / CALORIESTATS.goal * 100;
            ui.setCalorieGraphBar(BARGRAPHS_UI.cal_bars[now.getDay()], value, BARGRAPHS_UI.dashoffsets);
            ui.setMacroGraphBar(BARGRAPHS_UI.macro_bars[now.getDay()], macro_percentages); 
        }

        const avg_obj = util.updateWeeklyAverages(WEEKTOTALS, data.entry, days_logged, "sub");        
        ui.setWeeklyAveragesUI(AVERAGE_UI, avg_obj);
        } else {
            alert(data.errmsg);
        }
    console.log(week_summary);
});

search_dialog.addEventListener("click", async (e) => {
    const dialog_dimensions = search_dialog.getBoundingClientRect();
    if (e.clientX < dialog_dimensions.left  ||
        e.clientX > dialog_dimensions.right ||
        e.clientY < dialog_dimensions.top   ||
        e.clientY > dialog_dimensions.bottom
    ) {
        search_dialog.style.display = "none";
        search_input.value = "";
        searchlist.replaceChildren();
        search_dialog.close();
    }

    if (e.target.closest("form")) return;
    const searchlist_whole = e.target.closest(".searchlist__whole-item");
    if (!searchlist_whole) return;
    if (searchlist_whole && active_form) {
        let remove = (searchlist_whole.children.length > 1) ? true : false;
        active_form.remove();
        active_form = null;
        if (remove) return;
    }
    if (!searchlist_whole.querySelector("form")) {
        const food = SEARCHLIST.getFoodById(searchlist_whole.dataset.id, "food_id");
        active_form = ui.createSearchResultForm(meal_type, now.toDateString(), food);
        setupForm(active_form);
        searchlist_whole.appendChild(active_form);
        active_form.querySelector("[name='servsize']").focus();
    }  
});

date_input.addEventListener("change", (e) => {

    util.resetAll(MEALLISTS, MEALSTATS, CALORIESTATS, MACROSTATS);
    ui.resetAllUI(MEALLISTS_UI, MEALSTATS_UI, CALORIEDIAL_UI, CALORIESTATS_UI, MACROSTATS_UI);
    ui.resetCalDial(CALORIEDIAL_UI);

    now = dateUtil.getNewNowDate(date_input.value);
    ui.setActiveDate(sub_date, dateUtil.formatDate(now));

    if (!(week_range.start <= now && now <= week_range.end)) {
        util.resetWeekTotals(WEEKTOTALS);
        week_range = dateUtil.getWeekRange(now);
        ui.setWeekDate(week_date, dateUtil.formatWeekRange(now));
        ui.resetGraphs(BARGRAPHS_UI);
        week_summary.length = 0;
        fetchWeeklySummary(now);
    }
    fetchFoodGoal();
    fetchDiary(now);
});

async function fetchFoodGoal() {
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

async function fetchDiary(date) {
    const data = await api.getDiary(date);

    if (data.success) {
        for (let i = 0; i < data.entries.length; i++) {
            let meal_type = data.entries[i].meal_type;

            MEALLISTS[meal_type].add(data.entries[i]);
            MEALLISTS_UI[meal_type].appendChild(ui.createEntry(data.entries[i]));
            util.updateMealStats(MEALSTATS[meal_type], data.entries[i]);
            ui.setMealStatsUI(MEALSTATS_UI[meal_type], MEALSTATS[meal_type]);            
            util.updateCalorieStats(CALORIESTATS, data.entries[i]);
            ui.setCalorieStatsUI(CALORIESTATS_UI, CALORIESTATS);
            ui.setCalDial(CALORIEDIAL_UI, CALORIESTATS);
            util.updateMacrosStats(MACROSTATS, data.entries[i]);
            ui.setMacroStatsUI(MACROSTATS_UI, MACROSTATS);
        }
    } else {
        alert(data.errmsg);
    }
}

async function fetchWeeklySummary(date) {
    const data = await api.getWeeklySummary(date);

    if (data.success) {
        data.summaries.forEach(item => { week_summary.push(item); });

        for (let i = 0; i < week_summary.length; i++) {
            if (!week_summary[i]) {
                if (now < WEEKRANGE.start || 
                    (!(now > WEEKRANGE.end) && i < NOW.getDay())) {
                    ui.setCalorieBarNull(BARGRAPHS_UI.cal_bars[i]);
                    ui.setMacroBarNull(BARGRAPHS_UI.macro_bars[i]);
                }
            } else {
                if (!util.dayIsEmpty(week_summary[i])) days_logged++;

                for (const key in WEEKTOTALS) {
                    WEEKTOTALS[key] += week_summary[i][key];
                }

                const macros_sum = week_summary[i].fat + week_summary[i].carb + week_summary[i].prot;
                if (!macros_sum) continue;
                const macro_percentages = {};
                for (const key of ["fat", "carb", "prot"]) {
                    macro_percentages[key] = week_summary[i][key] / macros_sum;
                }

                let value = week_summary[i].cal / CALORIESTATS.goal * 100;
                ui.setCalorieGraphBar(BARGRAPHS_UI.cal_bars[i], value, BARGRAPHS_UI.dashoffsets)
                ui.setMacroGraphBar(BARGRAPHS_UI.macro_bars[i], macro_percentages);
            }
        }
        const avg_obj = util.initWeeklyAverage(WEEKTOTALS, days_logged);
        ui.setWeeklyAveragesUI(AVERAGE_UI, avg_obj);
    }
    console.log(week_summary);
}

// add function that boldens P element of graphs
ui.setActiveDate(sub_date, dateUtil.formatDate(now));
ui.setWeekDate(week_date, dateUtil.formatWeekRange(now));
fetchFoodGoal();
fetchDiary(now);
fetchWeeklySummary(now);