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

let now = new Date(new Date()).setHours(0, 0, 0, 0);
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
const MEALLISTS_UI = {
    1: document.getElementById("breakfast_list"),
    2: document.getElementById("lunch_list"),
    3: document.getElementById("dinner_list"),
    4: document.getElementById("snacks_list")
}
const MEALSTATS = {
    1: { cal: 0, fat: 0, carb: 0, prot: 0 },
    2: { cal: 0, fat: 0, carb: 0, prot: 0 },
    3: { cal: 0, fat: 0, carb: 0, prot: 0 },
    4: { cal: 0, fat: 0, carb: 0, prot: 0 }
}
const MEALSTATS_UI = {
    1: document.getElementById("breakfast_numbers"),
    2: document.getElementById("lunch_numbers"),
    3: document.getElementById("dinner_numbers"),
    4: document.getElementById("snacks_numbers")
}
const CALORIES = { 
    total: 0,
    goal: null,
    remaining: 0,
    over: 0 
}
const CALORIES_UI = Object.freeze({
    goal:      document.getElementById("goal_calories"),
    remaining: document.getElementById("remaining_calories"),
    over:      document.getElementById("over_calories"),
});
const AVERAGE_UI = Object.freeze({
    cal:  document.getElementById("average_calories"),
    fat:  document.getElementById("average_fat"),
    carb: document.getElementById("average_carb"),
    prot: document.getElementById("average_prot"),
});
const MACROS = { 
    fat:  0, 
    carb: 0, 
    prot: 0 
}
const MACROS_UI = {
    fat:  document.getElementById("main_fat"),
    carb: document.getElementById("main_carb"),
    prot: document.getElementById("main_prot")
} 
const CALORIEDIAL = {
    bar: document.getElementById("progress_bar"),
    pointer: document.getElementById("indicator_pointer"),
    text: document.getElementById("indicator_text"),
    dashoffset: 189.5,
    rotation: -128,
}
const BARGRAPH = {
    cal_bargraph: document.getElementById("calorie-bar-graph"),
    macro_bargraph: document.getElementById("macro-bar-graph"),
    dashoffsets: { null: 84, goal: 56, over: 9},
    cal_bars: [],
    macro_bars: []
}
BARGRAPH.cal_bars = getDayBars(BARGRAPH.cal_bargraph);
BARGRAPH.macro_bars = getDayBars(BARGRAPH.macro_bargraph);


/* function updateTodayDate() {
    let format_date = dateUtil.formatDate(now);
    sub_date.textContent = format_date;
}

function updateWeekDate() {
    let { start, end } = dateUtil.getWeekRange(now);
    let format_start = dateUtil.formatDate(start).split(",")[0];
    let format_end = dateUtil.formatDate(end).split(",")[0];
    week_date.textContent = `${format_start} - ${format_end}`;
}

function updateMealValues(values, item, flag="add") {
    if (flag === "add") {
        values.cal += item.cal;
        values.fat += item.fat;
        values.carb += item.carb;
        values.prot += item.prot;        
    } else if (flag === "sub") {
        values.cal -= item.cal;
        values.fat -= item.fat;
        values.carb -= item.carb;
        values.prot -= item.prot;        
    }
    roundMacros(values);
}

function updateMacrosObj(item, flag="add") {
    if (flag === "add") {
        MACROS.fat += item.fat;
        MACROS.carb += item.carb;
        MACROS.prot += item.prot;    
    } else if (flag === "sub") {
        MACROS.fat -= item.fat;
        MACROS.carb -= item.carb;
        MACROS.prot -= item.prot;         
    }
    roundMacros(MACROS);
}

function roundMacros(obj) {
    for (let key of ["fat", "carb", "prot"]) {
        obj[key] = Math.round(obj[key] * 10) / 10;
    }
}

function resetObj(meal_obj) {
    for (let key in meal_obj) {
        meal_obj[key] = 0;
    }
} */
// TODO: MOVE THIS ELSEWHERE AND REFACTOR

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
    CALORIES_UI.goal.style.display = "none";
    goal_input.style.display = "inline-block";
    goal_input.value = CALORIES_UI.goal.textContent;
    goal_input.select();
    goal_input.focus();
});

// edit event
goal_input.addEventListener("keydown", async (e) => {
    if (e.key === "Escape") {
        CALORIES_UI.goal.style.display = "inline";
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
        CALORIES_UI.goal.style.display = "inline";
        goal_input.style.display = "none";
        goal_input.value = "";
        return;
    }

    const data = await api.updateCalorieGoal(goal_input.value);

    CALORIES.total = data.goal;
    ui.setCalDial(CALORIEDIAL, CALORIES);
    CALORIES.remaining = CALORIES.total - CALORIES.main;
    CALORIES.over = 0;
    if (CALORIES.remaining < 0) {
        CALORIES.over += Math.abs(CALORIES.remaining);
        CALORIES.remaining = 0;
    }
    CALORIES_UI.remaining.textContent = CALORIES.remaining;
    CALORIES_UI.over.textContent = CALORIES.over;
    CALORIES_UI.goal.textContent = data.goal;

    CALORIES_UI.goal.style.display = "inline";
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

            updateMealValues(MEALSTATS[meal_type], data.entry);
            ui.setMealNutritionUI(MEALSTATS_UI[meal_type], MEALLISTS[meal_type]);

            util.updateCalorieInfo(CALORIES, data.entry);
            ui.setCalorieInfoUI(CALORIES_UI, CALORIES);
            ui.setCalDial(CALORIEDIAL, CALORIES);

            updateMacrosObj(data.entry);
            ui.setMacrosUI(MACROS_UI, MACROS);

            const macros_sum = week_summary[now.getDay()].fat + 
                week_summary[now.getDay()].carb + week_summary[now.getDay()].prot;
            if (!macros_sum) macros_sum = 1;
            const macro_percentages = {};
            for (const key of ["fat", "carb", "prot"]) {
                macro_percentages[key] = week_summary[now.getDay()][key] / macros_sum;
            }

            let value = week_summary[now.getDay()].cal / CALORIES.total * 100;
            ui.setCalorieGraphBar(BARGRAPH.cal_bars[now.getDay()], value, BARGRAPH.dashoffsets);
            ui.setMacroGraphBar(BARGRAPH.macro_bars[now.getDay()], macro_percentages);

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
        updateMealValues(MEALSTATS[meal_type], entry, "sub");
        ui.setMealNutritionUI(MEALSTATS_UI[meal_type], MEALSTATS[meal_type]);
        util.updateCalorieInfo(CALORIES, data.entry, "sub");
        ui.setCalorieInfoUI(CALORIES_UI, CALORIES);
        ui.setCalDial(CALORIEDIAL, CALORIES);
        updateMacrosObj(entry, "sub");
        ui.setMacrosUI(MACROS_UI, MACROS);

        if (!week_summary[now.getDay()]) {
            if (now < WEEKRANGE.start || 
                (!(now > WEEKRANGE.end) && i < NOW.getDay())) {
                ui.setCalorieBarNull(BARGRAPH.cal_bars[now.getDay()]);
                ui.setMacroBarNull(BARGRAPH.macro_bars[now.getDay()]);
            }
        } else {
            const macros_sum = week_summary[now.getDay()].fat + 
                week_summary[now.getDay()].carb + week_summary[now.getDay()].prot;
            if (!macros_sum) macros_sum = 1;
            const macro_percentages = {};
            for (const key of ["fat", "carb", "prot"]) {
                macro_percentages[key] = week_summary[now.getDay()][key] / macros_sum;
            }

            let value = week_summary[now.getDay()].cal / CALORIES.total * 100;
            ui.setCalorieGraphBar(BARGRAPH.cal_bars[now.getDay()], value, BARGRAPH.dashoffsets);
            ui.setMacroGraphBar(BARGRAPH.macro_bars[now.getDay()], macro_percentages); 
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
    // TODO: turn this into a function
    breakfast_array.deleteAll();
    lunch_array.deleteAll();
    dinner_array.deleteAll();
    snacks_array.deleteAll();

    // TODO: turn this into a function
    // TODO: resetObj(CALORIES) is setting goal = 0!
    resetObj(breakfast_obj);
    resetObj(lunch_obj);
    resetObj(dinner_obj);
    resetObj(snacks_obj);
    resetObj(CALORIES);
    resetObj(MACROS);

    let [year, month, day] = date_input.value.split("-").map(Number);
    // Note: month is 0-indexed in JS Date
    now = new Date(year, month - 1, day); // Local time, 00:00:00
    now.setHours(0, 0, 0, 0);
    /* now = new Date(date_input.value); */

    updateTodayDate();
    updateWeekDate(); // TODO: can probably move this into the week range checker below


    ui.resetDiaryUI(MEALLISTS_UI);

    // TODO: figure out why i did it this way
    let breakfast = getActiveMealNumbers(MEALS[1].ui_numbers);
    let lunch = getActiveMealNumbers(MEALS[2].ui_numbers);
    let dinner = getActiveMealNumbers(MEALS[3].ui_numbers);
    let snacks = getActiveMealNumbers(MEALS[4].ui_numbers);
    let meals = [breakfast, lunch, dinner, snacks];
    ui.resetUI(meals, MAINS_CALORIES, MACROS_UI);

    ui.resetCalDial(CALORIEDIAL);

    if (!(week_range.start <= now && now <= week_range.end)) {
        week_range = dateUtil.getWeekRange(now);

        // TODO: turn this into a function
        // TODO: rename goal-progress-track and over-progress-track to just progress-track
        const goal_progress_bars = document.querySelectorAll(".goal-progress-bar");
        const over_progress_bars = document.querySelectorAll(".over-progress-bar");
        const whole_progress_bar = document.querySelectorAll(".null-progress-bar");
        const fat_progress = document.querySelectorAll(".fat-progress-bar");
        const carb_progress = document.querySelectorAll(".carb-progress-bar");
        const prot_progress = document.querySelectorAll(".prot-progress-bar");
        for (let i = 0; i < goal_progress_bars.length; i++) {
            goal_progress_bars[i].style.strokeDashoffset = goal_dashoffset;
            over_progress_bars[i].style.strokeDashoffset = over_dashoffset;
            goal_progress_bars[i].style.stroke = "var(--clr-primary-green)";
            over_progress_bars[i].style.stroke = "var(--clr-primary-red)";

            whole_progress_bar[i].style.strokeDashoffset = null_dashoffset;

            fat_progress[i].setAttribute("y1", 0);
            fat_progress[i].setAttribute("y2", 0);
            fat_progress[i].style.opacity = "0";
            fat_progress[i].style.strokeDasharray = 0;
            fat_progress[i].style.strokeDashoffset = 0;

            carb_progress[i].setAttribute("y1", 0);
            carb_progress[i].setAttribute("y2", 0);
            carb_progress[i].style.opacity = "0";
            carb_progress[i].style.strokeDasharray = 0;
            carb_progress[i].style.strokeDashoffset = 0;

            prot_progress[i].setAttribute("y1", 0);
            prot_progress[i].setAttribute("y2", 0);
            prot_progress[i].style.opacity = "0";
            prot_progress[i].style.strokeDasharray = 0;
            prot_progress[i].style.strokeDashoffset = 0;
        }
        week_summary.length = 0;
        fetchWeeklySummary(now);
    }

    fetchFoodGoal();
    fetchDiary(now);
});

async function fetchFoodGoal() {
    const data = await api.getCalorieGoal();

    if (data.success) {
        CALORIES.total = data.goal;
        CALORIES.remaining = CALORIES.total;
        CALORIES_UI.goal.textContent = CALORIES.total;
        CALORIES_UI.remaining.textContent = CALORIES.total;
    } else {
        alert(data.errmsg);
    }
}

async function fetchDiary(date) {
    const data = await api.getDiary(date);

    if (data.success) {
        for (let i = 0; i < data.entries.length; i++) {
            let cur_meal_type = data.entries[i].meal_type;

            MEALLISTS[cur_meal_type].add(data.entries[i]);
            MEALLISTS_UI[cur_meal_type].appendChild(ui.createEntry(data.entries[i]));
            updateMealValues(MEALSTATS[cur_meal_type], data.entries[i]);
            ui.setMealNutritionUI(MEALSTATS_UI[cur_meal_type], MEALSTATS[cur_meal_type]);            
            util.updateCalorieInfo(CALORIES, data.entries[i]);
            ui.setCalorieInfoUI(CALORIES_UI, CALORIES);
            ui.setCalDial(CALORIEDIAL, CALORIES);
            updateMacrosObj(data.entries[i]);
            ui.setMacrosUI(MACROS_UI, MACROS);
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
                    ui.setCalorieBarNull(BARGRAPH.cal_bars[i]);
                    ui.setMacroBarNull(BARGRAPH.macro_bars[i]);
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

                let value = week_summary[i].cal / CALORIES.total * 100;
                ui.setCalorieGraphBar(BARGRAPH.cal_bars[i], value, BARGRAPH.dashoffsets)
                ui.setMacroGraphBar(BARGRAPH.macro_bars[i], macro_percentages);
            }
        }
        const avg_obj = util.initWeeklyAverage(WEEKTOTALS, days_logged);
        ui.setWeeklyAveragesUI(AVERAGE_UI, avg_obj);
    }
    console.log(week_summary);
}

// add function that boldens P element of graphs
updateTodayDate();
updateWeekDate();
fetchFoodGoal();
fetchDiary(now);
fetchWeeklySummary(now);