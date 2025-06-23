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

const searchlist_array = new FoodManager();

let meal_id = null;
let active_form = null;

let now = new Date();


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
const main_calories = document.getElementById("main_calories");
const remaining_calories = document.getElementById("remaining_calories");
const over_calories = document.getElementById("over_calories");

// macro numbers
const main_fat = document.getElementById("main_fat");
const main_carb = document.getElementById("main_carb");
const main_prot = document.getElementById("main_prot");

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
const MAINS = [main_calories, main_fat, main_carb, main_prot,
                goal_calories, remaining_calories, over_calories];
const MEALS = {
    1: { array: breakfast_array, values: breakfast_obj, ui_list: breakfast_list, ui_numbers: breakfast_numbers },
    2: { array: lunch_array, values: lunch_obj, ui_list: lunch_list, ui_numbers: lunch_numbers },
    3: { array: dinner_array, values: dinner_obj, ui_list: dinner_list, ui_numbers: dinner_numbers },
    4: { array: snacks_array, values: snacks_obj, ui_list: snacks_list, ui_numbers: snacks_numbers }
};

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
        values.cal += item.calories;
        values.fat += item.fat;
        values.carb += item.carbs;
        values.prot += item.protein;        
    } else if (flag === "sub") {
        values.cal -= item.calories;
        values.fat -= item.fat;
        values.carb -= item.carbs;
        values.prot -= item.protein;        
    }
    roundMacros(values);
}

function updateMacrosObj(item, flag="add") {
    if (flag === "add") {
        macros_obj.fat += item.fat;
        macros_obj.carb += item.carbs;
        macros_obj.prot += item.protein;    
    } else if (flag === "sub") {
        macros_obj.fat -= item.fat;
        macros_obj.carb -= item.carbs;
        macros_obj.prot -= item.protein;         
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
    const data = await DashboardAPI.deleteFromDiary(li.dataset.id);

    if (data.success) {
        const list = li.closest("ul");
        const meal_type = list.dataset.meal_type;
        const meal = getActiveMeal(meal_type);
        const meal_numbers = getActiveMealNumbers(meal.ui_numbers);
        const entry = meal.array.getFoodById(li.dataset.id, "entry_id");
        
        meal.array.delete(data.id, "entry_id");
        li.remove();

        updateMealValues(meal.values, entry, "sub");
        if (!meal.array.size()) DashboardUI.resetMealNumbers(meal_numbers);
        else {
            meal_numbers.cal.textContent = meal.values.cal;
            meal_numbers.fat.textContent = meal.values.fat;
            meal_numbers.carb.textContent = meal.values.carb;
            meal_numbers.prot.textContent = meal.values.prot;
        }

        calories_obj.main -= entry.calories;
        if (calories_obj.main <= calories_obj.goal) {
            calories_obj.remaining = calories_obj.goal - calories_obj.main;
            calories_obj.over = 0;
        } else {
            calories_obj.over = calories_obj.main - calories_obj.goal;
            calories_obj.remaining = 0;
        }
        main_calories.textContent = calories_obj.main;
        remaining_calories.textContent = calories_obj.remaining;
        over_calories.textContent = calories_obj.over;

        updateMacrosObj(entry, "sub");
        main_fat.textContent = macros_obj.fat;
        main_carb.textContent = macros_obj.carb;
        main_prot.textContent = macros_obj.prot;
        
    } else {
        alert(data.errmsg);
    }
});

// open search dialog events
addfood_btns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        meal_id = e.target.closest("button").dataset.meal_id;
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
        for (let i = 0; i < data.items.length; i++) {
            searchlist_array.add(data.items[i]);
            searchlist.appendChild(DashboardUI.createSearchListItem(data.items[i]));
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
            const meal = getActiveMeal(meal_id);
            const meal_numbers = getActiveMealNumbers(meal.ui_numbers);

            meal.array.add(data.item);
            meal.ui_list.appendChild(DashboardUI.createMealListItem(data.item));

            updateMealValues(meal.values, data.item);
            DashboardUI.updateMealNumbers(meal_numbers, meal.values);

            // TODO: turn this into a function
            calories_obj.main += data.item.calories;
            calories_obj.remaining -= data.item.calories;
            if (calories_obj.remaining < 0) {
                calories_obj.over += Math.abs(calories_obj.remaining);
                calories_obj.remaining = 0;
            }
            main_calories.textContent = calories_obj.main;
            remaining_calories.textContent = calories_obj.remaining;
            over_calories.textContent = calories_obj.over;

            updateMacrosObj(data.item);
            updateMacrosUI();

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
    active_form = DashboardUI.createSearchListItemForm(meal_id, now.toDateString(), item);
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
    /* now = new Date(date_input.value); */

    updateTodayDate();
    updateWeekDate();
    DashboardUI.resetMealLists(MEAL_LISTS);
    let breakfast = getActiveMealNumbers(MEALS[1].ui_numbers);
    let lunch = getActiveMealNumbers(MEALS[2].ui_numbers);
    let dinner = getActiveMealNumbers(MEALS[3].ui_numbers);
    let snacks = getActiveMealNumbers(MEALS[4].ui_numbers);
    let meals = [breakfast, lunch, dinner, snacks];
    DashboardUI.resetUI(meals, MAINS);
    fetchFoodGoal();
    fetchInitFood(now);
});


async function fetchInitFood(date) {
    const data = await DashboardAPI.getDiary(date);

    if (data.success) {
        for (let i = 0; i < data.items.length; i++) {
            let cur_meal_type = data.items[i].meal_type;

            const meal = getActiveMeal(cur_meal_type);
            const meal_numbers = getActiveMealNumbers(meal.ui_numbers);

            meal.array.add(data.items[i]);
            meal.ui_list.appendChild(DashboardUI.createMealListItem(data.items[i]));

            updateMealValues(meal.values, data.items[i]);
            DashboardUI.updateMealNumbers(meal_numbers, meal.values);

            // TODO: turn this into a function
            calories_obj.main += data.items[i].calories;
            calories_obj.remaining -= data.items[i].calories;
            if (calories_obj.remaining < 0) {
                calories_obj.over += Math.abs(calories_obj.remaining);
                calories_obj.remaining = 0;
            }
            main_calories.textContent = calories_obj.main;
            remaining_calories.textContent = calories_obj.remaining;
            over_calories.textContent = calories_obj.over;

            updateMacrosObj(data.items[i]);
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


updateTodayDate();
updateWeekDate();

fetchFoodGoal();
fetchInitFood(now);