import { FoodManager } from "./foodmanager.js";
import * as FoodUI from "./ui/foodUI.js";



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

// dates?
const sub_date = document.getElementById("sub_date");
const week_date = document.getElementById("week_date");

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


// open search dialog events
addfood_btns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        meal_id = e.target.closest("button").dataset.meal_id;
        search_dialog.style.display = "flex";
        search_dialog.showModal();
    });
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
        goal_calories_input.blur();
        goal_calories.style.display = "inline";
        goal_calories_input.style.display = "none";
        goal_calories_input.value = "";
    } else if (e.key === "Enter") {
        const res = await fetch("api/user/calorie-goal", {
            method: "PATCH",
            headers: { "Content-Type" : "application/json" },
            body: JSON.stringify({ goal: goal_calories_input.value })
        });
        const data = await res.json();
        calories_obj.goal = data.goal;
        goal_calories.textContent = data.goal;

        goal_calories_input.blur();
        goal_calories.style.display = "inline";
        goal_calories_input.style.display = "none";
        goal_calories_input.value = "";
    }
});

goal_calories_input.addEventListener("blur", async (e) => {
    const res = await fetch("api/user/calorie-goal", {
        method: "PATCH",
        headers: { "Content-Type" : "application/json" },
        body: JSON.stringify({ goal: goal_calories_input.value })
    });
    const data = await res.json();
    calories_obj.goal = data.goal;
    goal_calories.textContent = data.goal;

    goal_calories.style.display = "inline";
    goal_calories_input.style.display = "none";
    goal_calories_input.value = "";
});


search_input.addEventListener("input", async (e) => {
    let searchterm = e.target.value;
    searchlist.replaceChildren();

    if (searchterm.length == 0) return;

    const res = await fetch(`api/food?last_item=0&query=${searchterm}`);
    const data = await res.json();

    if (data.success) {
        if (data.count == 0) return;
        for (let i = 0; i < data.items.length; i++) {
            searchlist_array.add(data.items[i]);
            searchlist.appendChild(FoodUI.createSearchListItem(data.items[i]));
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

        const res = await fetch("api/diary", {
            method: "POST",
            headers: { "Content-Type" : "application/json" },
            body: JSON.stringify(form_obj)
        });
        const data = await res.json();
        
        if (data.success) {
            // TEST: testing something
            const meal = getActiveMeal(meal_id);
            const meal_numbers = getActiveMealNumbers(meal.ui_numbers);

            meal.array.add(data.item);
            meal.ui_list.appendChild(FoodUI.createMealListItem(data.item));

            updateMealValues(meal.values, data.item);
            updateMealNumbersUI(meal_numbers, meal.values);

            // TODO: turn this into a function
            calories_obj.main += data.item.calories;
            main_calories.textContent = calories_obj.main;
            // more logic for remaining and over

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
    const searchlist_item = e.target.closest(".searchlist__item");
    /* if (!searchlist_item) return; */
    const searchlist_whole = e.target.closest(".searchlist__whole-item")
    if (searchlist_whole.children.length == 2) return;
    let item = searchlist_array.getFoodById(searchlist_whole.dataset.id)
    // TODO: after done testing replace now.toDateString() with now.toLocaleDateString()
    active_form = FoodUI.createSearchListItemForm(meal_id, now.toDateString(), item);
    searchlist_whole.appendChild(active_form);
})




async function fetchInitFood(date) {
    // TODO: after done testing replace now.toDateString() with now.toLocaleDateString()
    const res = await fetch(`api/diary?date=${date.toDateString()}`);
    const data = await res.json();

    if (data.success) {
        for (let i = 0; i < data.items.length; i++) {
            let cur_meal_type = data.items[i].meal_type;

            const meal = getActiveMeal(cur_meal_type);
            const meal_numbers = getActiveMealNumbers(meal.ui_numbers);

            meal.array.add(data.items[i]);
            meal.ui_list.appendChild(FoodUI.createMealListItem(data.items[i]));

            updateMealValues(meal.values, data.items[i]);
            updateMealNumbersUI(meal_numbers, meal.values);

            // TODO: turn this into a function
            calories_obj.main += data.items[i].calories;
            main_calories.textContent = calories_obj.main;
            // more logic for remaining and over

            updateMacrosObj(data.items[i]);
            updateMacrosUI();
        }
    } else {
        alert(data.errmsg);
    }
}


async function fetchFoodGoal() {
    const res = await fetch("api/user/calorie-goal");
    const data = await res.json();

    if (data.success) {
        goal_calories.textContent = data.goal;
    } else {
        alert(data.errmsg);
    }
}





// dates
function formatDate(date) {
    let str = date.toDateString();
    str = str.split(" ");
    return `${str[1]} ${str[2]}, ${str[3]}`;
}


function getWeekRange(date) {
    const dayOfWeek = date.getDay();
    const start = new Date(date);
    start.setDate(date.getDate() - dayOfWeek);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
}

function updateTodayDate() {
    let format_date = formatDate(now);
    sub_date.textContent = format_date;
}

function updateWeekDate() {
    let { start, end } = getWeekRange(now);
    let format_start = formatDate(start).split(",")[0];
    let format_end = formatDate(end).split(",")[0];
    week_date.textContent = `${format_start} - ${format_end}`;
}

updateTodayDate();
updateWeekDate();

fetchFoodGoal();
fetchInitFood(now);



// TODO: change
const date_input = document.getElementById("date_input");

date_input.addEventListener("change", (e) => {

    // reset all values to 0 or none.

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

    resetUI();

    fetchInitFood(now);
});


function updateMealValues(values, item) {
    values.cal += item.calories;
    values.fat += item.fat;
    values.carb += item.carbs;
    values.prot += item.protein;
    roundMacros(values);
}

function updateMacrosObj(item) {
    macros_obj.fat += item.fat;
    macros_obj.carb += item.carbs;
    macros_obj.prot += item.protein;    
    roundMacros(macros_obj);
} 
 
function updateMealNumbersUI(ui_numbers, values) {
    ui_numbers.cal.classList.add("fw-b", "txt-prim-green");
    ui_numbers.fat.classList.add("fw-b", "txt-acnt-yellow");
    ui_numbers.carb.classList.add("fw-b", "txt-acnt-lightblue");
    ui_numbers.prot.classList.add("fw-b", "txt-acnt-purple"); 

    ui_numbers.cal.textContent = values.cal;
    ui_numbers.fat.textContent = values.fat;
    ui_numbers.carb.textContent = values.carb;
    ui_numbers.prot.textContent = values.prot;
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

function resetUI() {
    breakfast_list.replaceChildren();
    lunch_list.replaceChildren();
    dinner_list.replaceChildren();
    snacks_list.replaceChildren();

    let breakfast = getActiveMealNumbers(MEALS[1].ui_numbers);
    let lunch = getActiveMealNumbers(MEALS[2].ui_numbers);
    let dinner = getActiveMealNumbers(MEALS[3].ui_numbers);
    let snacks = getActiveMealNumbers(MEALS[4].ui_numbers);

    breakfast.cal.textContent = 0
    breakfast.fat.textContent = 0
    breakfast.carb.textContent = 0
    breakfast.prot.textContent = 0

    lunch.cal.textContent = 0
    lunch.fat.textContent = 0
    lunch.carb.textContent = 0
    lunch.prot.textContent = 0

    dinner.cal.textContent = 0
    dinner.fat.textContent = 0
    dinner.carb.textContent = 0
    dinner.prot.textContent = 0

    snacks.cal.textContent = 0
    snacks.fat.textContent = 0
    snacks.carb.textContent = 0
    snacks.prot.textContent = 0

    main_calories.textContent = 0;
    main_fat.textContent = 0
    main_carb.textContent = 0
    main_prot.textContent = 0   
}