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
    main: 0, remaining: 0, over: 0,
}

const macros_obj = {
    fat: 0, carb: 0, prot: 0,
}

const searchlist_array = new FoodManager();

let meal_id = null;
let active_form = null;

const now = new Date();

// buttons
const addfood_btns = document.querySelectorAll(".addfood_btn");

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
const today_date = document.getElementById("today_date");
const week_date = document.getElementById("week_date");


function getActiveMealList() {
    let active_list;
    if (meal_id == 1) active_list = breakfast_list;
    else if (meal_id == 2) active_list = lunch_list;
    else if (meal_id == 3) active_list = dinner_list;
    else if (meal_id == 4) active_list = snacks_list;
    return active_list;
}

function getActiveMealArray() {
    let active_array;
    if (meal_id == 1) active_array = breakfast_array;
    else if (meal_id == 2) active_array = lunch_array;
    else if (meal_id == 3) active_array = dinner_array;
    else if (meal_id == 4) active_array = snacks_array;
    return active_array;
}

function getActiveMealObj() {
    let active_obj;
    if (meal_id == 1) active_obj = breakfast_obj;
    else if (meal_id == 2) active_obj = lunch_obj;
    else if (meal_id == 3) active_obj = dinner_obj;
    else if (meal_id == 4) active_obj = snacks_obj;
    return active_obj;
}

function getActiveMealNumbers() {
    let active_numbers;
    if (meal_id == 1) active_numbers = breakfast_numbers;
    else if (meal_id == 2) active_numbers = lunch_numbers;
    else if (meal_id == 3) active_numbers = dinner_numbers;
    else if (meal_id == 4) active_numbers = snacks_numbers;

    let cal = active_numbers.querySelector(".cal");
    let fat = active_numbers.querySelector(".fat");
    let carb = active_numbers.querySelector(".carb");
    let prot = active_numbers.querySelector(".prot");
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


search_input.addEventListener("input", async (e) => {
    let searchterm = e.target.value;
    searchlist.replaceChildren();

    const res = await fetch(`/api/foodlist/food?last_item=0&query=${searchterm}`);
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

        const res = await fetch("api/foodlist/food/add-to-day", {
            method: "POST",
            headers: { "Content-Type" : "application/json" },
            body: JSON.stringify(form_obj)
        });
        const data = await res.json();
        
        if (data.success) {
            getActiveMealArray().add(data.item);
            getActiveMealList().appendChild(FoodUI.createMealListItem(data.item));

            // TODO: turn this into a fucntion
            let active_obj = getActiveMealObj();
            active_obj.cal += data.item.calories;
            active_obj.fat += data.item.fat;
            active_obj.carb += data.item.carbs;
            active_obj.prot += data.item.protein;

            // TODO: turn this into a function;
            let meal_numbers = getActiveMealNumbers();
            meal_numbers.cal.classList.add("fw-b", "txt-prim-green");
            meal_numbers.fat.classList.add("fw-b", "txt-acnt-yellow");
            meal_numbers.carb.classList.add("fw-b", "txt-acnt-lightblue");
            meal_numbers.prot.classList.add("fw-b", "txt-acnt-purple");

            meal_numbers.cal.textContent = active_obj.cal;
            meal_numbers.fat.textContent = active_obj.fat;
            meal_numbers.carb.textContent = active_obj.carb;
            meal_numbers.prot.textContent = active_obj.prot;

            // TODO: turn this into a function
            calories_obj.main += data.item.calories;
            // TODO: make function that adds calories + 1 until remaining = 0 or calories = goal.
            // then start adding to over
            // calories_obj.remaining -= data.item.calories;
            main_calories.textContent = calories_obj.main;

            // TODO: turn this into a function
            macros_obj.fat += data.item.fat;
            macros_obj.carb += data.item.carbs;
            macros_obj.prot += data.item.protein;

            // TODO: turn this into a function
            main_fat. className = "card__value-on";
            main_carb.className = "card__value-on";
            main_prot.className = "card__value-on";

            // TODO: turn this into a function
            main_fat.textContent = macros_obj.fat;
            main_carb.textContent = macros_obj.carb;
            main_prot.textContent = macros_obj.prot;

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
    active_form = FoodUI.createSearchListItemForm(meal_id, now.toDateString(), item);
    searchlist_whole.appendChild(active_form);
})




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
    today_date.textContent = format_date;
}

function updateWeekDate() {
    let { start, end } = getWeekRange(now);
    let format_start = formatDate(start).split(",")[0];
    let format_end = formatDate(end).split(",")[0];
    week_date.textContent = `${format_start} - ${format_end}`;
}

updateTodayDate();
updateWeekDate();