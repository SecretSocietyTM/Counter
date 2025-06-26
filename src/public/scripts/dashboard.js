import { FoodManager } from "./util/foodmanager.js";
import * as DateUtil from "./util/date.js";
import * as DashboardUI from "./ui/dashboardUI.js";
import * as DashboardAPI from "./api/dashboardAPI.js";



const breakfast_array = new FoodManager();
const lunch_array = new FoodManager();
const dinner_array = new FoodManager();
const snacks_array = new FoodManager();

const breakfast_obj = {
    cal: 0, fat: 0, carb: 0, prot: 0,
}

const lunch_obj = {
    cal: 0, fat: 0, carb: 0, prot: 0,
}

const dinner_obj = {
    cal: 0, fat: 0, carb: 0, prot: 0,
}

const snacks_obj = {
    cal: 0, fat: 0, carb: 0, prot: 0,
}

const calories_obj = {
    main: 0, goal: null, remaining: 0, over: 0,
}

const macros_obj = {
    fat: 0, carb: 0, prot: 0,
}

let week_summary = [];

const searchlist_array = new FoodManager();

let meal_type = null;
let active_form = null;

const real_now = new Date();
real_now.setHours(0, 0, 0, 0);
const real_week_range = DateUtil.getWeekRange(real_now);
let now = new Date();
now.setHours(0, 0, 0, 0);
let week_range = DateUtil.getWeekRange(now);


const diary = document.getElementById("diary");
// buttons
const addfood_btns = document.querySelectorAll(".addfood_btn");
const edit_goal_btn = document.getElementById("edit_goal_btn");

// edit calorie goal elements
const goal_calories = document.getElementById("goal_calories");
const goal_calories_input = document.getElementById("goal_calories_input");

// search dialog elements
const search_dialog = document.getElementById("search_dialog");
const search_input = document.getElementById("searchbar_input");
const searchlist = document.getElementById("searchlist");

// calorie numbers
const remaining_calories = document.getElementById("remaining_calories");
const over_calories = document.getElementById("over_calories");
const average_calories = document.getElementById("average_calories");

// macro numbers
const main_fat = document.getElementById("main_fat");
const main_carb = document.getElementById("main_carb");
const main_prot = document.getElementById("main_prot");
const average_fat = document.getElementById("average_fat");
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
const MAINS = [main_fat, main_carb, main_prot, goal_calories,
               remaining_calories, over_calories];
const MEALS = {
    1: { array: breakfast_array, values: breakfast_obj, ui_list: breakfast_list, ui_numbers: breakfast_numbers },
    2: { array: lunch_array, values: lunch_obj, ui_list: lunch_list, ui_numbers: lunch_numbers },
    3: { array: dinner_array, values: dinner_obj, ui_list: dinner_list, ui_numbers: dinner_numbers },
    4: { array: snacks_array, values: snacks_obj, ui_list: snacks_list, ui_numbers: snacks_numbers }
};

const calorie_bargraph = document.getElementById("calorie-bar-graph");
const macro_bargraph = document.getElementById("macro-bar-graph");
const calorie_graph_bars = 
[
    calorie_bargraph.querySelector(".sun-bar"),
    calorie_bargraph.querySelector(".mon-bar"),
    calorie_bargraph.querySelector(".tue-bar"),
    calorie_bargraph.querySelector(".wed-bar"),
    calorie_bargraph.querySelector(".thu-bar"),
    calorie_bargraph.querySelector(".fri-bar"),
    calorie_bargraph.querySelector(".sat-bar"),
]

const macro_graph_bars = 
[
    macro_bargraph.querySelector(".sun-bar"),
    macro_bargraph.querySelector(".mon-bar"),
    macro_bargraph.querySelector(".tue-bar"),
    macro_bargraph.querySelector(".wed-bar"),
    macro_bargraph.querySelector(".thu-bar"),
    macro_bargraph.querySelector(".fri-bar"),
    macro_bargraph.querySelector(".sat-bar"),
]

const whole_dashoffset = 84;
const goal_dashoffset = 56;
const over_dashoffset = 9;


const progress_bar = document.getElementById("progress_bar");
const indicator_pointer = document.getElementById("indicator_pointer");
const indicator_text = document.getElementById("indicator_text");

const main_calories_dashoffset = 189.5;
const initial_rotation_indication = -128;

function updateCalorieProgressBar(value, goal) {
    let normalize = value / goal * 100;
    if (normalize > 100) normalize = 100;
    const stroke_dashoffset_value = main_calories_dashoffset * (100 - normalize) / 100;
    const rotate_zvalue = (initial_rotation_indication) * (50 - normalize) / 50;

    progress_bar.style.strokeDashoffset = stroke_dashoffset_value;
    indicator_pointer.style.transform = `rotateZ(${rotate_zvalue}deg)`;
    indicator_text.firstChild.textContent = value;
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
    let format_date = DateUtil.formatDate(now);
    sub_date.textContent = format_date;
}

function updateWeekDate() {
    let { start, end } = DateUtil.getWeekRange(now);
    let format_start = DateUtil.formatDate(start).split(",")[0];
    let format_end = DateUtil.formatDate(end).split(",")[0];
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

function updateMacrosUI() {
    main_fat.className = "card__value-on";
    main_carb.className = "card__value-on";
    main_prot.className = "card__value-on";

    main_fat.textContent = macros_obj.fat;
    main_carb.textContent = macros_obj.carb;
    main_prot.textContent = macros_obj.prot;
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

diary.addEventListener("click", async (e) => {
    const delete_btn = e.target.closest(".delete_btn");
    if (!delete_btn) return;
    const li = e.target.closest("li");
    const list = li.closest("ul");
    const meal_type = list.dataset.meal_type;
    const meal = getActiveMeal(meal_type);
    const meal_numbers = getActiveMealNumbers(meal.ui_numbers);
    const entry = meal.array.getFoodById(li.dataset.id, "entry_id");


    const data = await DashboardAPI.deleteFromDiary(li.dataset.id);

    if (data.success) {
        meal.array.delete(data.entry.entry_id, "entry_id");
        li.remove();

        week_summary[now.getDay()] = data.summary;
        console.log(week_summary);

        updateMealValues(meal.values, entry, "sub");
        if (!meal.array.size()) DashboardUI.resetMealNumbers(meal_numbers);
        else {
            meal_numbers.cal.textContent = meal.values.cal;
            meal_numbers.fat.textContent = meal.values.fat;
            meal_numbers.carb.textContent = meal.values.carb;
            meal_numbers.prot.textContent = meal.values.prot;
        }

        calories_obj.main -= entry.cal;
        updateCalorieProgressBar(calories_obj.main, calories_obj.goal);
        if (calories_obj.main <= calories_obj.goal) {
            calories_obj.remaining = calories_obj.goal - calories_obj.main;
            calories_obj.over = 0;
        } else {
            calories_obj.over = calories_obj.main - calories_obj.goal;
            calories_obj.remaining = 0;
        }
        remaining_calories.textContent = calories_obj.remaining;
        over_calories.textContent = calories_obj.over;

        updateMacrosObj(entry, "sub");
        main_fat.textContent = macros_obj.fat;
        main_carb.textContent = macros_obj.carb;
        main_prot.textContent = macros_obj.prot;

        const goal_progress = calorie_graph_bars[now.getDay()].querySelector(".goal-progress-bar");
        const over_progress = calorie_graph_bars[now.getDay()].querySelector(".over-progress-bar");
        let value = week_summary[now.getDay()].cal / calories_obj.goal * 100;
        if (value > 100) {
            value -= 100;
            goal_progress.style.strokeDashoffset = 0;
            over_progress.style.strokeDashoffset = over_dashoffset * (100 - value) / 100;
        } else {
            over_progress.style.strokeDashoffset = over_dashoffset;
            goal_progress.style.strokeDashoffset = goal_dashoffset * (100 - value) / 100;
        }

        let avg_calories = 0;
        let avg_fat = 0;
        let avg_carb = 0;
        let avg_prot = 0;
        let days_logged = 0;
        week_summary.forEach(day => {
            if (day) { 
                days_logged++;
                avg_calories += day.cal;
                avg_fat += day.fat;
                avg_carb += day.carb;
                avg_prot += day.prot;
            }
        });
        if (days_logged === 0) days_logged = 1;
        avg_calories = Math.round(avg_calories / days_logged);
        avg_fat = Math.round(avg_fat / days_logged);
        avg_carb = Math.round(avg_carb / days_logged);
        avg_prot = Math.round(avg_prot / days_logged);
        average_calories.textContent = avg_calories;
        average_fat.textContent = avg_fat;
        average_carb.textContent = avg_carb;
        average_prot.textContent = avg_prot;
        
    } else {
        alert(data.errmsg);
    }
});

// open search dialog events
addfood_btns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        meal_type = e.target.closest("button").dataset.meal_type;
        search_dialog.style.display = "flex";
        search_dialog.showModal();
    });
});

search_dialog.addEventListener("cancel", (e) => {
    search_dialog.style.display = "none";
    search_input.value = "";
    searchlist.replaceChildren();
    search_dialog.close();
});

// close search dialog event (click outside of dialog)
search_dialog.addEventListener("click", (e) => {
    const dialog_dimensions = search_dialog.getBoundingClientRect();
    if (
        e.clientX < dialog_dimensions.left  ||
        e.clientX > dialog_dimensions.right ||
        e.clientY < dialog_dimensions.top   ||
        e.clientY > dialog_dimensions.bottom
    ) {
        search_dialog.style.display = "none";
        search_input.value = "";
        searchlist.replaceChildren();
        search_dialog.close();
    }
});

// edit calorie goal events
edit_goal_btn.addEventListener("click", (e) => {
    goal_calories.style.display = "none";
    goal_calories_input.style.display = "inline-block";
    goal_calories_input.value = goal_calories.textContent;
    goal_calories_input.select();
    goal_calories_input.focus();
});

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

    const data = await DashboardAPI.updateCalorieGoal(goal_calories_input.value);

    calories_obj.goal = data.goal;
    updateCalorieProgressBar(calories_obj.main, calories_obj.goal);
    calories_obj.remaining = calories_obj.goal - calories_obj.main;
    calories_obj.over = 0;
    if (calories_obj.remaining < 0) {
        calories_obj.over += Math.abs(calories_obj.remaining);
        calories_obj.remaining = 0;
    }
    goal_calories.textContent = data.goal;
    remaining_calories.textContent = calories_obj.remaining;
    over_calories.textContent = calories_obj.over;

    goal_calories.style.display = "inline";
    goal_calories_input.style.display = "none";
    goal_calories_input.value = "";
});

search_input.addEventListener("input", async (e) => {
    let searchterm = e.target.value;
    searchlist.replaceChildren();

    if (searchterm.length == 0) return;

    const data = await DashboardAPI.getFoods(searchterm);

    if (data.success) {
        if (data.count == 0) return;
        for (let i = 0; i < data.foods.length; i++) {
            searchlist_array.add(data.foods[i]);
            searchlist.appendChild(DashboardUI.createSearchListItem(data.foods[i]));
        }
    } else {
        alert(data.errmsg);
    }
});

searchlist.addEventListener("click", async (e) => {
    if (e.target.closest("#searchform_submit_btn")) {

        const form_data = new FormData(active_form);
        const form_obj = Object.fromEntries(form_data.entries());

        if (!active_form.checkValidity()) {
            active_form.reportValidity();
            return;
        }

        const data = await DashboardAPI.addToDiary(form_obj);

        if (data.success) {
            const meal = getActiveMeal(meal_type);
            const meal_numbers = getActiveMealNumbers(meal.ui_numbers);

            week_summary[now.getDay()] = data.summary;
            console.log(week_summary);

            meal.array.add(data.entry);
            meal.ui_list.appendChild(DashboardUI.createEntry(data.entry));

            updateMealValues(meal.values, data.entry);
            DashboardUI.updateMealNumbers(meal_numbers, meal.values);

            // TODO: turn this into a function
            calories_obj.main += data.entry.cal;
            updateCalorieProgressBar(calories_obj.main, calories_obj.goal);
            calories_obj.remaining -= data.entry.cal;
            if (calories_obj.remaining < 0) {
                calories_obj.over += Math.abs(calories_obj.remaining);
                calories_obj.remaining = 0;
            }
            remaining_calories.textContent = calories_obj.remaining;
            over_calories.textContent = calories_obj.over;

            updateMacrosObj(data.entry);
            updateMacrosUI();

            const goal_progress = calorie_graph_bars[now.getDay()].querySelector(".goal-progress-bar");
            const over_progress = calorie_graph_bars[now.getDay()].querySelector(".over-progress-bar");
            let value = week_summary[now.getDay()].cal / calories_obj.goal * 100;
            if (value > 100) {
                value -= 100;
                goal_progress.style.strokeDashoffset = 0;
                over_progress.style.strokeDashoffset = over_dashoffset * (100 - value) / 100;
            } else {
                over_progress.style.strokeDashoffset = over_dashoffset;
                goal_progress.style.strokeDashoffset = goal_dashoffset * (100 - value) / 100;
            }
            
            let avg_calories = 0;
            let avg_fat = 0;
            let avg_carb = 0;
            let avg_prot = 0;
            let days_logged = 0;
            week_summary.forEach(day => {
                if (day) { 
                    days_logged++;
                    avg_calories += day.cal;
                    avg_fat += day.fat;
                    avg_carb += day.carb;
                    avg_prot += day.prot;
                }
            });
            if (days_logged === 0) days_logged = 1;
            avg_calories = Math.round(avg_calories / days_logged);
            avg_fat = Math.round(avg_fat / days_logged);
            avg_carb = Math.round(avg_carb / days_logged);
            avg_prot = Math.round(avg_prot / days_logged);
            average_calories.textContent = avg_calories;
            average_fat.textContent = avg_fat;
            average_carb.textContent = avg_carb;
            average_prot.textContent = avg_prot;

            search_input.value = "";
            searchlist.replaceChildren();
            active_form.remove();
            active_form = null;
        } else {
            alert(data.errmsg);
        }
    }

    if (e.target.closest(".item__form")) return;
    if (active_form) {
        active_form.remove();
        active_form = null;
    }
    const searchlist_whole = e.target.closest(".searchlist__whole-item")
    if (!searchlist_whole) return;
    if (searchlist_whole.children.length == 2) return;
    let item = searchlist_array.getFoodById(searchlist_whole.dataset.id, "food_id");
    active_form = DashboardUI.createSearchListItemForm(meal_type, now.toDateString(), item);
    searchlist_whole.appendChild(active_form);
    active_form.querySelector("[name='servsize']").focus();
});

date_input.addEventListener("change", (e) => {
    breakfast_array.deleteAll();
    lunch_array.deleteAll();
    dinner_array.deleteAll();
    snacks_array.deleteAll();

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
    DashboardUI.resetMealLists(MEAL_LISTS);
    let breakfast = getActiveMealNumbers(MEALS[1].ui_numbers);
    let lunch = getActiveMealNumbers(MEALS[2].ui_numbers);
    let dinner = getActiveMealNumbers(MEALS[3].ui_numbers);
    let snacks = getActiveMealNumbers(MEALS[4].ui_numbers);
    let meals = [breakfast, lunch, dinner, snacks];
    DashboardUI.resetUI(meals, MAINS);

    // reset progress bar
    progress_bar.style.strokeDashoffset = main_calories_dashoffset;
    indicator_pointer.style.transform = `rotateZ(${initial_rotation_indication}deg)`;
    indicator_text.firstChild.textContent = 0;

    if (!(week_range.start <= now && now <= week_range.end)) {
        week_range = DateUtil.getWeekRange(now);

        // TODO: turn this into a function
        // TODO: rename goal-progress-track and over-progress-track to just progress-track
        const goal_progress_bars = document.querySelectorAll(".goal-progress-bar");
        const over_progress_bars = document.querySelectorAll(".over-progress-bar");
        const whole_progress_bar = document.querySelectorAll(".whole-progress-bar");
        const fat_progress = document.querySelectorAll(".fat-progress-bar");
        const carb_progress = document.querySelectorAll(".carb-progress-bar");
        const prot_progress = document.querySelectorAll(".prot-progress-bar");
        for (let i = 0; i < goal_progress_bars.length; i++) {
            goal_progress_bars[i].style.strokeDashoffset = goal_dashoffset;
            over_progress_bars[i].style.strokeDashoffset = over_dashoffset;
            goal_progress_bars[i].style.stroke = "var(--clr-primary-green)";
            over_progress_bars[i].style.stroke = "var(--clr-primary-red)";

            whole_progress_bar[i].style.strokeDashoffset = whole_dashoffset;

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


async function fetchDiary(date) {
    const data = await DashboardAPI.getDiary(date);

    if (data.success) {
        for (let i = 0; i < data.entries.length; i++) {
            let cur_meal_type = data.entries[i].meal_type;

            const meal = getActiveMeal(cur_meal_type);
            const meal_numbers = getActiveMealNumbers(meal.ui_numbers);

            meal.array.add(data.entries[i]);
            meal.ui_list.appendChild(DashboardUI.createEntry(data.entries[i]));

            updateMealValues(meal.values, data.entries[i]);
            DashboardUI.updateMealNumbers(meal_numbers, meal.values);

            // TODO: turn this into a function
            calories_obj.main += data.entries[i].cal;
            updateCalorieProgressBar(calories_obj.main, calories_obj.goal);
            calories_obj.remaining -= data.entries[i].cal;
            if (calories_obj.remaining < 0) {
                calories_obj.over += Math.abs(calories_obj.remaining);
                calories_obj.remaining = 0;
            }
            remaining_calories.textContent = calories_obj.remaining;
            over_calories.textContent = calories_obj.over;

            updateMacrosObj(data.entries[i]);
            updateMacrosUI();
        }
    } else {
        alert(data.errmsg);
    }
}

async function fetchFoodGoal() {
    const data = await DashboardAPI.getCalorieGoal();

    if (data.success) {
        calories_obj.goal = data.goal;
        calories_obj.remaining = calories_obj.goal;
        goal_calories.textContent = calories_obj.goal;
        remaining_calories.textContent = calories_obj.goal;
    } else {
        alert(data.errmsg);
    }
}

async function fetchWeeklySummary(date) {
    const data = await DashboardAPI.getWeeklySummary(date);

    if (data.success) {
        data.summaries.forEach(item => {
            week_summary.push(item);
        });

        let avg_calories = 0;
        let avg_fat = 0;
        let avg_carb = 0;
        let avg_prot = 0;
        let days_logged = 0;
        let usable_space = 84;
        usable_space -= (2 * 16);
        for (let i = 0; i < week_summary.length; i++) {
            if (!week_summary[i]) {
                if (now < real_week_range.start) {
                    
                    // TODO: refactor into a function
                    const goal_progress = calorie_graph_bars[i].querySelector(".goal-progress-bar");
                    const over_progress = calorie_graph_bars[i].querySelector(".over-progress-bar");
                    const whole_progress = macro_graph_bars[i].querySelector(".whole-progress-bar");

                    // TODO: consider applying these values directly to the html so that changing
                    // between dates within the same week doesn't cause flashing. (Talking about var(--clr-neutral-40))
                    goal_progress.style.stroke = "var(--clr-neutral-40)";
                    goal_progress.style.strokeDashoffset = 0;
                    over_progress.style.stroke = "var(--clr-neutral-40)";
                    over_progress.style.strokeDashoffset = 0;
                    whole_progress.style.strokeDashoffset = 0;                    
                } else {
                    if (i < real_now.getDay()) {
                        // TODO: refactor into a function
                        const goal_progress = calorie_graph_bars[i].querySelector(".goal-progress-bar");
                        const over_progress = calorie_graph_bars[i].querySelector(".over-progress-bar");
                        const whole_progress = macro_graph_bars[i].querySelector(".whole-progress-bar");

                        // TODO: consider applying these values directly to the html so that changing
                        // between dates within the same week doesn't cause flashing. (Talking about var(--clr-neutral-40))
                        goal_progress.style.stroke = "var(--clr-neutral-40)";
                        goal_progress.style.strokeDashoffset = 0;
                        over_progress.style.stroke = "var(--clr-neutral-40)";
                        over_progress.style.strokeDashoffset = 0;
                        whole_progress.style.strokeDashoffset = 0;                    
                    }
                }
            } else {
                days_logged++;
                avg_calories += week_summary[i].cal;
                avg_fat += week_summary[i].fat;
                avg_carb += week_summary[i].carb;
                avg_prot += week_summary[i].prot;
                const goal_progress = calorie_graph_bars[i].querySelector(".goal-progress-bar");
                const over_progress = calorie_graph_bars[i].querySelector(".over-progress-bar");
                let value = week_summary[i].cal / calories_obj.goal * 100;
                if (value > 100) {
                    value -= 100;
                    goal_progress.style.strokeDashoffset = 0
                    over_progress.style.strokeDashoffset = over_dashoffset * (100 - value) / 100;
                } else {
                    over_progress.style.strokeDashoffset = over_dashoffset;
                    goal_progress.style.strokeDashoffset = goal_dashoffset * (100 - value) / 100;
                }

                // TODO: implementing this for adding/deleting might be harder/more work, just leave as is.
                // user can refresh page if they really want it.
                // prefer refactoring first.
                const fat_progress = macro_graph_bars[i].querySelector(".fat-progress-bar");
                const carb_progress = macro_graph_bars[i].querySelector(".carb-progress-bar");
                const prot_progress = macro_graph_bars[i].querySelector(".prot-progress-bar");
                let total = week_summary[i].fat + week_summary[i].carb + week_summary[i].prot;
                if (!total) {
                    continue;
                }
                let fat_perc = week_summary[i].fat / total;
                let carb_perc = week_summary[i].carb / total;
                let prot_perc = week_summary[i].prot / total;

                let cur_start = 92;
                let cur_end = cur_start - (usable_space * fat_perc);

                fat_progress.setAttribute("y1", cur_start);
                fat_progress.setAttribute("y2", cur_end);
                fat_progress.style.opacity = "1";
                fat_progress.style.strokeDasharray = Math.ceil(cur_start - cur_end);
                fat_progress.style.strokeDashoffset = 0;

                cur_start = cur_end - 16;
                cur_end = cur_start - (usable_space * carb_perc);

                carb_progress.setAttribute("y1", cur_start);
                carb_progress.setAttribute("y2", cur_end);
                carb_progress.style.opacity = "1";
                carb_progress.style.strokeDasharray = Math.ceil(cur_start - cur_end);
                carb_progress.style.strokeDashoffset = 0;

                cur_start = cur_end - 16;
                cur_end = cur_start - (usable_space * prot_perc);

                prot_progress.setAttribute("y1", cur_start);
                prot_progress.setAttribute("y2", cur_end);
                prot_progress.style.opacity = "1";                
                prot_progress.style.strokeDasharray = Math.ceil(cur_start - cur_end);
                prot_progress.style.strokeDashoffset = 0;
            }
        }
        if (days_logged === 0) days_logged = 1;
        avg_calories = Math.round(avg_calories / days_logged);
        avg_fat = Math.round(avg_fat / days_logged);
        avg_carb = Math.round(avg_carb / days_logged);
        avg_prot = Math.round(avg_prot / days_logged);
        average_calories.textContent = avg_calories;
        average_fat.textContent = avg_fat;
        average_carb.textContent = avg_carb;
        average_prot.textContent = avg_prot;
        // update macro bars

        // update macro averages
    }
    console.log(week_summary);
}

// add function that boldens P element of graphs
updateTodayDate();
updateWeekDate();
fetchFoodGoal();
fetchDiary(now);
fetchWeeklySummary(now);