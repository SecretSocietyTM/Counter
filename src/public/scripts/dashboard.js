import { FoodManager } from "./util/foodmanager.js";
import * as dateUtil from "./util/date.js";
import * as ui from "./ui/dashboardUI.js";
import * as api from "./api/dashboardAPI.js";
import * as util from "./util/dashboardUtil.js"


const searchlist_array = new FoodManager();
const breakfast_array = new FoodManager();
const lunch_array = new FoodManager();
const dinner_array = new FoodManager();
const snacks_array = new FoodManager();

const breakfast_obj = { cal: 0, fat: 0, carb: 0, prot: 0 }
const lunch_obj     = { cal: 0, fat: 0, carb: 0, prot: 0 }
const dinner_obj    = { cal: 0, fat: 0, carb: 0, prot: 0 }
const snacks_obj    = { cal: 0, fat: 0, carb: 0, prot: 0 }
const week_totals_obj  = { cal: 0, fat: 0, carb: 0, prot: 0 } // TODO: rename -> totals_obj after no conflicts
const calories_obj  = { main: 0, goal: null, remaining: 0, over: 0 }
const macros_obj    = { fat: 0, carb: 0, prot: 0 }

let week_summary = [];

let meal_type = null;       // TODO: look for instances of meal_type, why is it null?
let active_form = null;
let days_logged = 0; // TODO: rename to days_logged after fetchSummary refactor

const real_now = new Date();
real_now.setHours(0, 0, 0, 0);
let now = new Date();
now.setHours(0, 0, 0, 0);
const real_week_range = dateUtil.getWeekRange(real_now);
let week_range = dateUtil.getWeekRange(now);


const diary = document.getElementById("diary");
// buttons
const addfood_btns = document.querySelectorAll(".addfood_btn");
const edit_goal_btn = document.getElementById("edit_goal_btn");

// edit calorie goal elements
const goal_calories_input = document.getElementById("goal_calories_input");

// search dialog elements
const search_dialog = document.getElementById("search_dialog");
const search_input = document.getElementById("searchbar_input");
const searchlist = document.getElementById("searchlist");

// calorie numbers
const total_calories = document.getElementById("indicator_text");
const goal_calories = document.getElementById("goal_calories");
const remaining_calories = document.getElementById("remaining_calories");
const over_calories = document.getElementById("over_calories");
const average_calories = document.getElementById("average_calories");

// macro numbers
const main_fat = document.getElementById("main_fat");
const main_carb = document.getElementById("main_carb");
const main_prot = document.getElementById("main_prot");
const average_fat =  document.getElementById("average_fat");
const average_carb = document.getElementById("average_carb");
const average_prot = document.getElementById("average_prot");

// meal lists
const breakfast_list = document.getElementById("breakfast_list");
const lunch_list = document.getElementById("lunch_list");
const dinner_list = document.getElementById("dinner_list");
const snacks_list = document.getElementById("snacks_list");

// meal numbers
const breakfast_numbers = document.getElementById("breakfast_numbers");
const lunch_numbers = document.getElementById("lunch_numbers");
const dinner_numbers = document.getElementById("dinner_numbers");
const snacks_numbers = document.getElementById("snacks_numbers");

// dates
const sub_date = document.getElementById("sub_date");
const week_date = document.getElementById("week_date");
const date_input = document.getElementById("date_input");

const MEAL_LISTS = [breakfast_list, lunch_list, dinner_list, snacks_list];
const MAINS_CALORIES = [goal_calories, remaining_calories, over_calories];
// TODO: TURN MAINS_CALORIES ^^^^ INTO AN OBJECT (JUST DELETE IT BUT UPDATE ALL THINGS THAT USED IT, TO USE THE OBJECT VERSION BELOW);
const CALORIES_UI = Object.freeze({
    total:     document.getElementById("indicator_text"), 
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
const MAIN_MACROS = [main_fat, main_carb, main_prot]
const MEALS = {
    1: { array: breakfast_array, values: breakfast_obj, ui_list: breakfast_list, ui_numbers: breakfast_numbers },
    2: { array: lunch_array, values: lunch_obj, ui_list: lunch_list, ui_numbers: lunch_numbers },
    3: { array: dinner_array, values: dinner_obj, ui_list: dinner_list, ui_numbers: dinner_numbers },
    4: { array: snacks_array, values: snacks_obj, ui_list: snacks_list, ui_numbers: snacks_numbers }
};

// progress bar elements
const progress_bar = document.getElementById("progress_bar");
const indicator_pointer = document.getElementById("indicator_pointer");
const main_calories_dashoffset = 189.5;
const initial_idicator_rotation = -128;

// bar graph elements
const calorie_bargraph = document.getElementById("calorie-bar-graph");
const macro_bargraph = document.getElementById("macro-bar-graph");
const DASHOFFSETS = { total: 189.5, null: 84, goal: 56, over: 9}
const null_dashoffset = 84;
const goal_dashoffset = 56;
const over_dashoffset = 9;
const calorie_graph_bars = 
[
    calorie_bargraph.querySelector(".sun-bar"),
    calorie_bargraph.querySelector(".mon-bar"),
    calorie_bargraph.querySelector(".tue-bar"),
    calorie_bargraph.querySelector(".wed-bar"),
    calorie_bargraph.querySelector(".thu-bar"),
    calorie_bargraph.querySelector(".fri-bar"),
    calorie_bargraph.querySelector(".sat-bar")
]

const macro_graph_bars = 
[
    macro_bargraph.querySelector(".sun-bar"),
    macro_bargraph.querySelector(".mon-bar"),
    macro_bargraph.querySelector(".tue-bar"),
    macro_bargraph.querySelector(".wed-bar"),
    macro_bargraph.querySelector(".thu-bar"),
    macro_bargraph.querySelector(".fri-bar"),
    macro_bargraph.querySelector(".sat-bar")
]

function updateCalorieProgressBar(total, goal) {
    let normalize = total / goal * 100;
    if (normalize > 100) normalize = 100;
    const stroke_dashoffset_value = main_calories_dashoffset * (100 - normalize) / 100;
    const rotate_zvalue = (initial_idicator_rotation) * (50 - normalize) / 50;

    progress_bar.style.strokeDashoffset = stroke_dashoffset_value;
    indicator_pointer.style.transform = `rotateZ(${rotate_zvalue}deg)`;
    total_calories.firstChild.textContent = total;
}

function getActiveMeal(meal) {
    return MEALS[meal];
}

function getActiveMealNumbers(numbers_ui) {
    let cal = numbers_ui.querySelector(".cal");
    let fat = numbers_ui.querySelector(".fat");
    let carb = numbers_ui.querySelector(".carb");
    let prot = numbers_ui.querySelector(".prot");
    return { cal, fat, carb, prot };
}

function updateTodayDate() {
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
        macros_obj.fat += item.fat;
        macros_obj.carb += item.carb;
        macros_obj.prot += item.prot;    
    } else if (flag === "sub") {
        macros_obj.fat -= item.fat;
        macros_obj.carb -= item.carb;
        macros_obj.prot -= item.prot;         
    }
    roundMacros(macros_obj);
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
}


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
    goal_calories.style.display = "none";
    goal_calories_input.style.display = "inline-block";
    goal_calories_input.value = goal_calories.textContent;
    goal_calories_input.select();
    goal_calories_input.focus();
});

// edit event
goal_calories_input.addEventListener("keydown", async (e) => {
    if (e.key === "Escape") {
        goal_calories.style.display = "inline";
        goal_calories_input.style.display = "none";
        goal_calories_input.value = "";
    } else if (e.key === "Enter") {
        goal_calories_input.blur();
    }
});

goal_calories_input.addEventListener("blur", async (e) => {
    if (goal_calories_input.style.display == "none") {
        return;
    }
    // input check
    if (goal_calories_input.value < 1 || goal_calories_input.value % 1 > 1) {
        goal_calories.style.display = "inline";
        goal_calories_input.style.display = "none";
        goal_calories_input.value = "";
        return;
    }

    const data = await api.updateCalorieGoal(goal_calories_input.value);

    calories_obj.goal = data.goal;
    updateCalorieProgressBar(calories_obj.main, calories_obj.goal);
    calories_obj.remaining = calories_obj.goal - calories_obj.main;
    calories_obj.over = 0;
    if (calories_obj.remaining < 0) {
        calories_obj.over += Math.abs(calories_obj.remaining);
        calories_obj.remaining = 0;
    }
    remaining_calories.textContent = calories_obj.remaining;
    over_calories.textContent = calories_obj.over;
    goal_calories.textContent = data.goal;

    goal_calories.style.display = "inline";
    goal_calories_input.style.display = "none";
    goal_calories_input.value = "";
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
            searchlist_array.add(data.foods[i]);
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
            const meal = getActiveMeal(meal_type);
            const meal_numbers = getActiveMealNumbers(meal.ui_numbers);

            if (!meal.array.size()) days_logged++;
            meal.array.add(data.entry);
            meal.ui_list.appendChild(ui.createEntry(data.entry));

            week_summary[now.getDay()] = data.summary;

            updateMealValues(meal.values, data.entry);
            ui.setMealUI(meal_numbers, meal.values);
            util.updateCalorieInfo(calories_obj, data.entry);
            ui.setCalorieInfoUI(CALORIES_UI, calories_obj);
            updateCalorieProgressBar(calories_obj.main, calories_obj.goal);

            updateMacrosObj(data.entry);
            ui.setMacrosUI(MAIN_MACROS, macros_obj);

            const macros_sum = week_summary[now.getDay()].fat + 
                week_summary[now.getDay()].carb + week_summary[now.getDay()].prot;
            if (!macros_sum) macros_sum = 1;
            const macro_percentages = {};
            for (const key of ["fat", "carb", "prot"]) {
                macro_percentages[key] = week_summary[now.getDay()][key] / macros_sum;
            }

            let value = week_summary[now.getDay()].cal / calories_obj.goal * 100;
            ui.setCalorieGraphBar(calorie_graph_bars[now.getDay()], value, DASHOFFSETS);
            ui.setMacroGraphBar(macro_graph_bars[now.getDay()], macro_percentages);

            const avg_obj = util.updateWeeklyAverages(week_totals_obj, data.entry, days_logged);
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
    const meal = getActiveMeal(meal_type);
    const meal_numbers = getActiveMealNumbers(meal.ui_numbers);
    const entry = meal.array.getFoodById(li.dataset.id, "entry_id");


    const data = await api.deleteFromDiary(li.dataset.id);

    if (data.success) {
        meal.array.delete(data.entry.entry_id, "entry_id");
        if (!meal.array.size()) days_logged--;
        li.remove();

        week_summary[now.getDay()] = data.summary;

        updateMealValues(meal.values, entry, "sub");
        ui.setMealUI(meal_numbers, meal.values);
        util.updateCalorieInfo(calories_obj, data.entry, "sub");
        ui.setCalorieInfoUI(CALORIES_UI, calories_obj);
        updateCalorieProgressBar(calories_obj.main, calories_obj.goal);

        updateMacrosObj(entry, "sub");
        ui.setMacrosUI(MAIN_MACROS, macros_obj);

        if (!week_summary[now.getDay()]) {
            if (now < real_week_range.start || 
                (!(now > real_week_range.end) && i < real_now.getDay())) {
                ui.setCalorieBarNull(calorie_graph_bars[now.getDay()]);
                ui.setMacroBarNull(macro_graph_bars[now.getDay()]);
            }
        } else {
            const macros_sum = week_summary[now.getDay()].fat + 
                week_summary[now.getDay()].carb + week_summary[now.getDay()].prot;
            if (!macros_sum) macros_sum = 1;
            const macro_percentages = {};
            for (const key of ["fat", "carb", "prot"]) {
                macro_percentages[key] = week_summary[now.getDay()][key] / macros_sum;
            }

            let value = week_summary[now.getDay()].cal / calories_obj.goal * 100;
            ui.setCalorieGraphBar(calorie_graph_bars[now.getDay()], value, DASHOFFSETS);
            ui.setMacroGraphBar(macro_graph_bars[now.getDay()], macro_percentages); 
        }

        const avg_obj = util.updateWeeklyAverages(week_totals_obj, data.entry, days_logged, "sub");        
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
        const food = searchlist_array.getFoodById(searchlist_whole.dataset.id, "food_id");
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
    // TODO: resetObj(calories_obj) is setting goal = 0!
    resetObj(breakfast_obj);
    resetObj(lunch_obj);
    resetObj(dinner_obj);
    resetObj(snacks_obj);
    resetObj(calories_obj);
    resetObj(macros_obj);

    let [year, month, day] = date_input.value.split("-").map(Number);
    // Note: month is 0-indexed in JS Date
    now = new Date(year, month - 1, day); // Local time, 00:00:00
    now.setHours(0, 0, 0, 0);
    /* now = new Date(date_input.value); */

    updateTodayDate();
    updateWeekDate(); // TODO: can probably move this into the week range checker below


    ui.resetDiaryUI(MEAL_LISTS);

    // TODO: figure out why i did it this way
    let breakfast = getActiveMealNumbers(MEALS[1].ui_numbers);
    let lunch = getActiveMealNumbers(MEALS[2].ui_numbers);
    let dinner = getActiveMealNumbers(MEALS[3].ui_numbers);
    let snacks = getActiveMealNumbers(MEALS[4].ui_numbers);
    let meals = [breakfast, lunch, dinner, snacks];
    ui.resetUI(meals, MAINS_CALORIES, MAIN_MACROS);

    // reset progress bar
    // TODO: turn this into a function
    progress_bar.style.strokeDashoffset = main_calories_dashoffset;
    indicator_pointer.style.transform = `rotateZ(${initial_idicator_rotation}deg)`;
    total_calories.firstChild.textContent = 0;

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
        calories_obj.goal = data.goal;
        calories_obj.remaining = calories_obj.goal;
        goal_calories.textContent = calories_obj.goal;
        remaining_calories.textContent = calories_obj.goal;
    } else {
        alert(data.errmsg);
    }
}

async function fetchDiary(date) {
    const data = await api.getDiary(date);

    if (data.success) {
        for (let i = 0; i < data.entries.length; i++) {
            let cur_meal_type = data.entries[i].meal_type;

            const meal = getActiveMeal(cur_meal_type);
            const meal_numbers = getActiveMealNumbers(meal.ui_numbers);

            meal.array.add(data.entries[i]);
            meal.ui_list.appendChild(ui.createEntry(data.entries[i]));

            updateMealValues(meal.values, data.entries[i]);
            ui.setMealUI(meal_numbers, meal.values);
            util.updateCalorieInfo(calories_obj, data.entries[i]);
            ui.setCalorieInfoUI(CALORIES_UI, calories_obj);
            updateCalorieProgressBar(calories_obj.main, calories_obj.goal);
            updateMacrosObj(data.entries[i]);
            ui.setMacrosUI(MAIN_MACROS, macros_obj);
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
                if (now < real_week_range.start || 
                    (!(now > real_week_range.end) && i < real_now.getDay())) {
                    ui.setCalorieBarNull(calorie_graph_bars[i]);
                    ui.setMacroBarNull(macro_graph_bars[i]);
                }
            } else {
                if (!util.dayIsEmpty(week_summary[i])) days_logged++;

                for (const key in week_totals_obj) {
                    week_totals_obj[key] += week_summary[i][key];
                }

                const macros_sum = week_summary[i].fat + week_summary[i].carb + week_summary[i].prot;
                if (!macros_sum) continue;
                const macro_percentages = {};
                for (const key of ["fat", "carb", "prot"]) {
                    macro_percentages[key] = week_summary[i][key] / macros_sum;
                }

                let value = week_summary[i].cal / calories_obj.goal * 100;
                ui.setCalorieGraphBar(calorie_graph_bars[i], value, DASHOFFSETS)
                ui.setMacroGraphBar(macro_graph_bars[i], macro_percentages);
            }
        }
        const avg_obj = util.initWeeklyAverage(week_totals_obj, days_logged);
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