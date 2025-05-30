import { FoodManager } from "./foodmanager.js";

// manage food list
const food_list_arr = new FoodManager();

const breakfast_arr = new FoodManager();
const lunch_arr = new FoodManager();
const dinner_arr = new FoodManager();
const snacks_arr = new FoodManager();

// variables
let calories_today_value = 0;
let fats_today_value = 0;
let carbs_today_value = 0;
let protein_today_value = 0;

let calories_breakfast_value = 0;
let fats_breakfast_value = 0;
let carbs_breakfast_value = 0;
let protein_breakfast_value = 0;

let calories_lunch_value = 0;
let fats_lunch_value = 0;
let carbs_lunch_value = 0;
let protein_lunch_value = 0;

let calories_dinner_value = 0;
let fats_dinner_value = 0;
let carbs_dinner_value = 0;
let protein_dinner_value = 0;

let calories_snacks_value = 0;
let fats_snacks_value = 0;
let carbs_snacks_value = 0;
let protein_snacks_value = 0;

// dialogs
const dialog_set_goal = document.getElementById("set-goal-dialog");
const dialog_search_food = document.getElementById("search-food");
const dialog_set_serving = document.getElementById("set-serving");

// forms
const form_add_food = document.getElementById("form-add-food");

// search bar
const searchbar = document.getElementById("searchbar");

// icon buttons
const add_food_buttons = document.querySelectorAll(".add-food");
const cancel_buttons = document.querySelectorAll(".cancel");

// elements to append to
const search_food_list = document.getElementById("search-food-list");

const breakfast = document.querySelector(".breakfast");
const lunch = document.querySelector(".lunch");
const dinner = document.querySelector(".dinner");
const snacks = document.querySelector(".snacks")

const breakfast_food_list = breakfast.querySelector(".food-list__list");
const lunch_food_list = lunch.querySelector(".food-list__list");
const dinner_food_list = dinner.querySelector(".food-list__list");
const snacks_food_list = snacks.querySelector(".food-list__list")


// other
const search_food_items = document.querySelectorAll(".clickable");

// elements to modify
const calories_today = document.getElementById("calories_today");
const fats_today = document.getElementById("fat_today");
const carbs_today = document.getElementById("carbs_today");
const protein_today = document.getElementById("protein_today");

// breakfast elements
const calories_breakfast = document.getElementById("calories_breakfast");
const fat_breakfast = document.getElementById("fat_breakfast");
const carbs_breakfast = document.getElementById("carbs_breakfast");
const protein_breakfast = document.getElementById("protein_breakfast");

// lunch elements
const calories_lunch = document.getElementById("calories_lunch");
const fat_lunch = document.getElementById("fat_lunch");
const carbs_lunch = document.getElementById("carbs_lunch");
const protein_lunch = document.getElementById("protein_lunch");

// dinner elements
const calories_dinner = document.getElementById("calories_dinner");
const fat_dinner = document.getElementById("fat_dinner");
const carbs_dinner = document.getElementById("carbs_dinner");
const protein_dinner = document.getElementById("protein_dinner");

// snacks elements
const calories_snack = document.getElementById("calories_snack");
const fat_snack = document.getElementById("fat_snack");
const carbs_snack = document.getElementById("carbs_snack");
const protein_snack = document.getElementById("protein_snack");

// time
const now = new Date();

// DOM functions
function createSpan(text, class_list = []) {
    const span = document.createElement("span");
    span.innerText = text;
    span.classList.add(...class_list);
    return span;
}

function createServingUnit(value, unit, value_class = [], unit_class = []) {
    const p = document.createElement("p");
    const span1 = createSpan(value, value_class);
    const span2 = createSpan(unit, unit_class);
    p.appendChild(span1);
    p.appendChild(span2);
    return p;
}

function createSearchFoodListItem(form_obj) {
    const li = document.createElement("li");
    li.className = "food-list__item clickable";
    li.dataset.id = form_obj.food_id;

    const name = document.createElement("p");
    name.innerText = form_obj.name;
    li.appendChild(name);

    return li;
}

function createEatenFoodListItem(form_obj) {
    const li = document.createElement("li");
    li.className = "food-list__item";
    li.dataset.id = form_obj.food_id;

    const name = document.createElement("p");
    name.innerText = form_obj.name;
    
    const servingsize_p = createServingUnit(
        form_obj.serving_size,
        form_obj.unit
    );
    li.append(name, servingsize_p);

    return li;
}


// icon button events
add_food_buttons.forEach(button => {
    button.addEventListener("click", (e) => {
        form_add_food.querySelector("[name='date-eaten']").value = now.toDateString();
        form_add_food.querySelector("[name='meal']").value = button.dataset.meal;
        dialog_search_food.show();
    });
});

cancel_buttons.forEach(button => {
    button.addEventListener("click", (e) => {
        const dialog = button.closest("dialog");
        if (dialog) {
            dialog.close();
        }
    });
});


// searchbar function
searchbar.addEventListener("keyup", async (e) => {
    let searchterm = e.target.value
    if (searchterm.length < 2) {
        search_food_list.replaceChildren();
        return
    } 
    search_food_list.replaceChildren();
    const res = await fetch(`/api/users/search-get-foods?query=${searchterm}`);
    const data = await res.json();
    for (let i = 0; i < data.result.length; i++) {
        search_food_list.appendChild(createSearchFoodListItem(data.result[i]));
    }
})


// dialog events
dialog_set_goal.addEventListener("click", async (e) => {
    let action = e.target.dataset.action;
    if (!action) {
        return;
    }

    const form = document.getElementById("set-goal-form");
    const calorie_goal = document.getElementById("calorie-goal").value;
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const res = await fetch(action, {
        method: "POST",
        headers: { "Content-Type" : "application/json" },
        body: JSON.stringify( { calorie_goal } )
    })

    const data = await res.json();
    if (data.success) {
        document.getElementById("user-cal-goal").innerText = data.calorie_goal;
        dialog_set_goal.close();
    }
});

dialog_search_food.addEventListener("click", (e) => {
    let target = e.target
    if (!(target.classList.contains("clickable") || target.parentElement.classList.contains("clickable"))) return;
    if (target.tagName === "P") target = target.parentElement;
    form_add_food.querySelector("[name='id']").value = target.dataset.id;
    dialog_set_serving.show();
});


// form events
form_add_food.addEventListener("click", async (e) => {
    let action = e.target.dataset.action;

    if (!action) {
        return;
    }

    const form = form_add_food;
    const form_data = new FormData(form);
    const form_obj = Object.fromEntries(form_data.entries());

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const res = await fetch(action, {
        method: "POST",
        headers: { "Content-Type" : "application/json" },
        body: JSON.stringify(form_obj)
    });

    const data = await res.json();
    console.log(data);
    console.log(data.query_res);
    if (data.success) {
        dialog_set_serving.close();

        if (data.query_res.meal_type === "breakfast") {
            breakfast_arr.addFood(data.query_res);
            breakfast_food_list.appendChild(createEatenFoodListItem(data.query_res));

            calories_breakfast_value += data.query_res.calories;
            fats_breakfast_value += data.query_res.fats;
            carbs_breakfast_value += data.query_res.carbs
            protein_breakfast_value += data.query_res.protein;

            calories_breakfast.innerText = Math.trunc(calories_breakfast_value * 100) / 100;
            fat_breakfast.innerText = Math.trunc(fats_breakfast_value * 100) / 100;
            carbs_breakfast.innerText = Math.trunc(carbs_breakfast_value * 100) / 100;
            protein_breakfast.innerText = Math.trunc(protein_breakfast_value * 100) / 100;
        } 
        else if (data.query_res.meal_type === "lunch") {
            lunch_arr.addFood(data.query_res);
            lunch_food_list.appendChild(createEatenFoodListItem(data.query_res));

            calories_lunch_value += data.query_res.calories;
            fats_lunch_value += data.query_res.fats;
            carbs_lunch_value += data.query_res.carbs
            protein_lunch_value += data.query_res.protein;

            calories_lunch.innerText = Math.trunc(calories_lunch_value * 100) / 100;
            fat_lunch.innerText = Math.trunc(fats_lunch_value * 100) / 100;
            carbs_lunch.innerText = Math.trunc(carbs_lunch_value * 100) / 100;
            protein_lunch.innerText = Math.trunc(protein_lunch_value * 100) / 100;
        }
        else if (data.query_res.meal_type === "dinner") {
            dinner_arr.addFood(data.query_res);
            dinner_food_list.appendChild(createEatenFoodListItem(data.query_res));

            calories_dinner_value += data.query_res.calories;
            fats_dinner_value += data.query_res.fats;
            carbs_dinner_value += data.query_res.carbs
            protein_dinner_value += data.query_res.protein;

            calories_dinner.innerText = Math.trunc(calories_dinner_value * 100) / 100;
            fat_dinner.innerText = Math.trunc(fats_dinner_value * 100) / 100;
            carbs_dinner.innerText = Math.trunc(carbs_dinner_value * 100) / 100;
            protein_dinner.innerText = Math.trunc(protein_dinner_value * 100) / 100;
        }
        else {
            snacks_arr.addFood(data.query_res);
            snacks_food_list.appendChild(createEatenFoodListItem(data.query_res));

            calories_snacks_value += data.query_res.calories;
            fats_snacks_value += data.query_res.fats;
            carbs_snacks_value += data.query_res.carbs
            protein_snacks_value += data.query_res.protein;

            calories_snack.innerText = Math.trunc(calories_snacks_value * 100) / 100;
            fat_snack.innerText = Math.trunc(fats_snacks_value * 100) / 100;
            carbs_snack.innerText = Math.trunc(carbs_snacks_value * 100) / 100;
            protein_snack.innerText = Math.trunc(protein_snacks_value * 100) / 100;
        }

        calories_today_value += data.query_res.calories;
        fats_today_value += data.query_res.fats;
        carbs_today_value += data.query_res.carbs
        protein_today_value += data.query_res.protein;

        calories_today.innerText = Math.trunc(calories_today_value * 100) / 100;
        fats_today.innerText = Math.trunc(fats_today_value * 100) / 100;
        carbs_today.innerText = Math.trunc(carbs_today_value * 100) / 100;
        protein_today.innerText = Math.trunc(protein_today_value * 100) / 100;
    }
});


// page init functions
async function fetchUserGoal() {
    const res = await fetch("/api/users/get-goal");
    const data = await res.json();
    if (data.success) {
        if (data.calorie_goal) document.getElementById("user-cal-goal").innerText = data.calorie_goal;
        else dialog_set_goal.show();
    }
}

async function fetchFoodsEaten() {
    const res = await fetch(`/api/users/get-foods-eaten?date=${now.toDateString()}`);
    const data = await res.json();
    if (!data.success) {
        alert("fail");
    }
    for (let i = 0; i < data.result.length; i++) {
        if (data.result[i].meal_type === "breakfast") {
            breakfast_arr.addFood(data.result[i]);
            breakfast_food_list.appendChild(createEatenFoodListItem(data.result[i]));

            calories_breakfast_value += data.result[i].calories;
            fats_breakfast_value += data.result[i].fats;
            carbs_breakfast_value += data.result[i].carbs
            protein_breakfast_value += data.result[i].protein;

            calories_breakfast.innerText = Math.trunc(calories_breakfast_value * 100) / 100;
            fat_breakfast.innerText = Math.trunc(fats_breakfast_value * 100) / 100;
            carbs_breakfast.innerText = Math.trunc(carbs_breakfast_value * 100) / 100;
            protein_breakfast.innerText = Math.trunc(protein_breakfast_value * 100) / 100;

            calories_breakfast.classList.add("text-prim-green");
            fat_breakfast.classList.add("text-acnt-yellow");
            carbs_breakfast.classList.add("text-acnt-lightblue");
            protein_breakfast.classList.add("text-acnt-purple");
        } 
        else if (data.result[i].meal_type === "lunch") {
            lunch_arr.addFood(data.result[i]);
            lunch_food_list.appendChild(createEatenFoodListItem(data.result[i]));

            calories_lunch_value += data.result[i].calories;
            fats_lunch_value += data.result[i].fats;
            carbs_lunch_value += data.result[i].carbs;
            protein_lunch_value += data.result[i].protein;

            calories_lunch.innerText = Math.trunc(calories_lunch_value * 100) / 100;
            fat_lunch.innerText = Math.trunc(fats_lunch_value * 100) / 100;
            carbs_lunch.innerText = Math.trunc(carbs_lunch_value * 100) / 100;
            protein_lunch.innerText = Math.trunc(protein_lunch_value * 100) / 100;

            calories_lunch.classList.add("text-prim-green");
            fat_lunch.classList.add("text-acnt-yellow");
            carbs_lunch.classList.add("text-acnt-lightblue");
            protein_lunch.classList.add("text-acnt-purple");
        }
        else if (data.result[i].meal_type === "dinner") {
            dinner_arr.addFood(data.result[i]);
            dinner_food_list.appendChild(createEatenFoodListItem(data.result[i]));

            calories_dinner_value += data.result[i].calories;
            fats_dinner_value += data.result[i].fats;
            carbs_dinner_value += data.result[i].carbs
            protein_dinner_value += data.result[i].protein;

            calories_dinner.innerText = Math.trunc(calories_dinner_value * 100) / 100;
            fat_dinner.innerText = Math.trunc(fats_dinner_value * 100) / 100;
            carbs_dinner.innerText = Math.trunc(carbs_dinner_value * 100) / 100;
            protein_dinner.innerText = Math.trunc(protein_dinner_value * 100) / 100;

            calories_dinner.classList.add("text-prim-green");
            fat_dinner.classList.add("text-acnt-yellow");
            carbs_dinner.classList.add("text-acnt-lightblue");
            protein_dinner.classList.add("text-acnt-purple");
        }
        else {
            snacks_arr.addFood(data.result[i]);
            snacks_food_list.appendChild(createEatenFoodListItem(data.result[i]));

            calories_snacks_value += data.result[i].calories;
            fats_snacks_value += data.result[i].fats;
            carbs_snacks_value += data.result[i].carbs
            protein_snacks_value += data.result[i].protein;

            calories_snack.innerText = Math.trunc(calories_snacks_value * 100) / 100;
            fat_snack.innerText = Math.trunc(fats_snacks_value * 100) / 100;
            carbs_snack.innerText = Math.trunc(carbs_snacks_value * 100) / 100;
            protein_snack.innerText = Math.trunc(protein_snacks_value * 100) / 100;

            calories_snack.classList.add("text-prim-green");
            fat_snack.classList.add("text-acnt-yellow");
            carbs_snack.classList.add("text-acnt-lightblue");
            protein_snack.classList.add("text-acnt-purple");
        }
    }

    for (let i = 0; i < breakfast_arr.foodItems.length; i++) {
        calories_today_value += breakfast_arr.foodItems[i].calories;
        fats_today_value += breakfast_arr.foodItems[i].fats;
        carbs_today_value += breakfast_arr.foodItems[i].carbs
        protein_today_value += breakfast_arr.foodItems[i].protein;

    }
    for (let i = 0; i < lunch_arr.foodItems.length; i++) {
        calories_today_value += lunch_arr.foodItems[i].calories;
        fats_today_value += lunch_arr.foodItems[i].fats;
        carbs_today_value += lunch_arr.foodItems[i].carbs
        protein_today_value += lunch_arr.foodItems[i].protein;

    }
    for (let i = 0; i < dinner_arr.foodItems.length; i++) {
        calories_today_value += dinner_arr.foodItems[i].calories;
        fats_today_value += dinner_arr.foodItems[i].fats;
        carbs_today_value += dinner_arr.foodItems[i].carbs
        protein_today_value += dinner_arr.foodItems[i].protein;

    }
    for (let i = 0; i < snacks_arr.foodItems.length; i++) {
        calories_today_value += snacks_arr.foodItems[i].calories;
        fats_today_value += snacks_arr.foodItems[i].fats;
        carbs_today_value += snacks_arr.foodItems[i].carbs
        protein_today_value += snacks_arr.foodItems[i].protein;

    }
    calories_today.innerText = Math.trunc(calories_today_value * 100) / 100;
    fats_today.innerText = Math.trunc(fats_today_value * 100) / 100;
    carbs_today.innerText = Math.trunc(carbs_today_value * 100) / 100;
    protein_today.innerText = Math.trunc(protein_today_value * 100) / 100;

    fats_today.classList.remove("text-ntrl-70");
    carbs_today.classList.remove("text-ntrl-70");
    protein_today.classList.remove("text-ntrl-70");

    calories_today.classList.add("fw-b", "fs-28", "text-prim-green");
    fats_today.classList.add("text-acnt-yellow");
    carbs_today.classList.add("text-acnt-lightblue");
    protein_today.classList.add("text-acnt-purple");
}

fetchUserGoal();
fetchFoodsEaten();