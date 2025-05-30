import { FoodManager } from "./foodmanager.js";

// manage food list
const food_list_arr = new FoodManager();
let total_food_count;
let prev_index = 0;

// dialogs 
const dialog_add_food = document.getElementById("dialog-add-food");
const dialog_edit_food = document.getElementById("dialog-edit-food");

// forms
const form_add_food = document.getElementById("form-add-food");
const form_edit_food = document.getElementById("form-edit-food");

// icon buttons
const add_food_button = document.getElementById("add-new-food");
const cancel_buttons = document.querySelectorAll(".cancel");

// elements to append to
const food_list = document.querySelector(".food-list");

// TODO: remove
/* const test_item = {
        food_id: -1,
        user_id: 1,
        name: "Dot’s Homestyle Snacks Baked Cheese Curls",
        serving_size: 28,
        unit: "g",
        calories: 100,
        fats: 8,
        carbs: 15,
        protein: 2
    }
food_list_arr.addFood(test_item); */

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

function createMetricP(value, unit = "g", span_classes = []) {
    const p = document.createElement("p");
    const span = createSpan(value, span_classes);
    p.appendChild(span);
    p.append(unit);
    return p;
}

function createDotP() {
    const p = document.createElement("p");
    p.className = "text-ntrl-80";
    p.innerHTML = "&#9679;";
    return p;
}

function createFoodListItem(form_obj) {
    const li = document.createElement("li");
    li.className = "food-list__item";
    li.dataset.id = form_obj.food_id;

    const name = document.createElement("p");
    name.className = "name";
    name.innerText = form_obj.name;

    const div = document.createElement("div");
    div.className = "flex jc-btwn gap-5";

    const text_section = document.createElement("div");
    text_section.className = "text-section";

    const servingsize_p = createServingUnit(
        form_obj.serving_size,
        form_obj.unit,
        ["fw-b", "text-ntrl-80", "serving-size"],
        ["unit"]
    );

    const cal_p = createMetricP(
        form_obj.calories,
        "cal",
        ["fw-b", "text-prim-green", "calories"]
    );
    
    const fat_p = createMetricP(
        form_obj.fats,
        undefined,
        ["fw-b", "text-acnt-yellow", "fat"]
    );

    const carbs_p = createMetricP(
        form_obj.carbs,
        undefined,
        ["fw-b", "text-acnt-lightblue", "carb"]
    );

    const prot_p = createMetricP(
        form_obj.protein,
        undefined,
        ["fw-b", "text-acnt-purple", "prot"]
    );

    const dot_p = createDotP();

    const edit_btn = document.createElement("button");
    edit_btn.type = "button";
    edit_btn.className = "edit-food icon-button";

    const edit_img = document.createElement("img");
    edit_img.src = "../assets/foodlist/edit_icon.svg";
    edit_btn.appendChild(edit_img);

    text_section.append(servingsize_p, dot_p, cal_p, fat_p, carbs_p, prot_p);
    div.append(text_section, edit_btn);
    li.append(name, div);

    return li;
}

function deleteFoodListItem(id) {
    const food_items_arr = document.querySelectorAll(".food-list__item");
    console.log(food_items_arr);
    for (let i = 0; i < food_items_arr.length; i++) {
        if (food_items_arr[i].dataset.id == id) {
            food_items_arr[i].remove();
            return;
        }
    }
}

function updateFoodListItem(form_obj) {
    const food_items_arr = document.querySelectorAll(".food-list__item");
    console.log(food_items_arr);
    for (let i = 0; i < food_items_arr.length; i++) {
        let cur_li = food_items_arr[i]
        if (cur_li.dataset.id == form_obj.food_id) {
            cur_li.querySelector(".name").innerText = form_obj.name;
            cur_li.querySelector(".serving-size").innerText = form_obj.serving_size;
            cur_li.querySelector(".unit").innerText = form_obj.unit;
            cur_li.querySelector(".calories").innerText = form_obj.calories;
            cur_li.querySelector(".fat").innerText = form_obj.fats;
            cur_li.querySelector(".carb").innerText = form_obj.carbs;
            cur_li.querySelector(".prot").innerText = form_obj.protein;
            return;
        }
    }
}

/* function loadFoodListItems() {

}
 */

// load on scroll
const observer = new IntersectionObserver(entries => {
    const last_fooditem = entries[0];
    if(!last_fooditem.isIntersecting) return;
    fetchMoreFood();
    console.log("THE EVENT HAS BEEN TRIGGERED");
    observer.unobserve(last_fooditem.target);
    if (prev_index !== total_food_count) {
        observer.observe(document.querySelector(".food-list").lastElementChild);
    }
});

// page init functions
async function fetchFoodList() {
    const res = await fetch("/api/users/get-foods?last_item=0");
    const data = await res.json();
    if (!data.success) {
        alert("fail");
    }
    for (let i = 0; i < data.query_res.length; i++) {
        food_list_arr.addFood(data.query_res[i]);
        food_list.appendChild(createFoodListItem(data.query_res[i]));
    }
    observer.observe(document.querySelector(".food-list").lastElementChild);
    total_food_count = data.total_count.count;
    prev_index = data.query_res.length;
}

async function fetchMoreFood() {
    let last_item_loaded = food_list_arr.foodItems[prev_index - 1];
    console.log(last_item_loaded);
    const res = await fetch(`api/users/get-foods?last_item=${last_item_loaded.food_id}`);
    const data = await res.json();
    for (let i = 0; i < data.query_res.length; i++) {
        food_list_arr.addFood(data.query_res[i]);
        food_list.appendChild(createFoodListItem(data.query_res[i]));
    }
    prev_index += data.query_res.length;
}


// icon button events
add_food_button.addEventListener("click", (e) => {
    dialog_add_food.show();
});

// edit food button pressed
food_list.addEventListener("click", (e) => {
    const edit_button = e.target.closest(".edit-food");
    if (edit_button) {
        const form = form_edit_food;
        const li = e.target.closest("li");
        const food_item = food_list_arr.getFoodById(li.dataset.id);
        form.querySelector("[name='id']").value = food_item.food_id;
        form.querySelector("[name='food-name']").value = food_item.name;
        form.querySelector("[name='serving-size']").value = food_item.serving_size;
        form.querySelector("[name='serving-unit']").value = food_item.unit;
        form.querySelector("[name='calories']").value = food_item.calories;
        form.querySelector("[name='fat']").value = food_item.fats;
        form.querySelector("[name='carbs']").value = food_item.carbs;
        form.querySelector("[name='protein']").value = food_item.protein;
        dialog_edit_food.show();
    }
    return;
});

cancel_buttons.forEach(button => {
    button.addEventListener("click", (e) => {
        const dialog = button.closest("dialog");
        if (dialog) {
            dialog.close();
            dialog.querySelector("form").reset();
        }
    });
});


// form submissions
dialog_add_food.addEventListener("click", async (e) => {
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
        food_list_arr.addFood(data.query_res);
        food_list.appendChild(createFoodListItem(data.query_res));
        dialog_add_food.close();
        form.reset();
    }
});

dialog_edit_food.addEventListener("click", async (e) => {
    let action = e.target.dataset.action;
    let id = e.target.id;
    const form = form_edit_food;
    const food_id = form.querySelector("[name='id']").value;

    if (!action) return;

    if (id === "delete") {
        const res = await fetch(action, {
            method: "DELETE",
            headers: { "Content-Type" : "application/json" },
            body: JSON.stringify( { id: food_id } )
        });

        let data = await res.json();
        if (!data.success) {
            return;
        }
        food_list_arr.deleteFood(food_id);
        deleteFoodListItem(food_id);
        dialog_edit_food.close();
    } 
    else {
        const form = form_edit_food;
        const form_data = new FormData(form);
        const form_obj = Object.fromEntries(form_data.entries());
    
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
    
        const res = await fetch(action, {
            method: "PATCH",
            headers: { "Content-Type" : "application/json" },
            body: JSON.stringify( form_obj )
        });
    
        const data = await res.json();
        if (!data.success) return;
        console.log(data.query_res);
        food_list_arr.updateFood(data.query_res.food_id, data.query_res);
        console.log(food_list_arr);
        updateFoodListItem(data.query_res);
        dialog_edit_food.close();
    }
});



fetchFoodList();