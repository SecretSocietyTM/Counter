import { FoodManager } from "./foodmanager.js";
import * as FoodUI from "./ui/foodUI.js";


const foodlist_array = new FoodManager()
let total_foodcount;
let prev_index = 0;

let cur_item;

// buttons
const addfood_btn = document.getElementById("addfood_btn");
const cancel_btn = document.getElementById("cancel_btn");

// pseudo button selector
const foodlist = document.getElementById("foodlist");

// dialog elements
const dialog = document.querySelector("dialog");
const dlg_title = document.getElementById("dialog_title");
const delete_btn = document.getElementById("delete_btn");
const submit_btn = document.getElementById("submit_btn");
const foodform = document.getElementById("foodform");


const error_message = document.getElementById("error_message");

/* icon button events */
addfood_btn.addEventListener("click", () => {
    dlg_title.textContent = "Add New Food";
    delete_btn.style.visibility = "hidden";
    submit_btn.textContent = "Add Food";
    submit_btn.dataset.method = "POST";
    dialog.showModal();
});

foodlist.addEventListener("click", (e) => {
    const editfood_btn = e.target.closest(".editfood_btn");
    if (editfood_btn) {
        dlg_title.textContent = "Edit Your Food";
        delete_btn.style.visibility = "visible";
        submit_btn.textContent = "Save";
        submit_btn.dataset.method = "PATCH";

        const li = e.target.closest("li");
        cur_item = li;
        const item = foodlist_array.getFoodById(li.dataset.id);
        /* foodform.querySelector("[name='id']").value = item.food_id; */
        foodform.querySelector("[name='name']").value = item.name;
        foodform.querySelector("[name='servsize']").value = item.serving_size;
        foodform.querySelector("[name='unit']").value = item.unit;
        foodform.querySelector("[name='cal']").value = item.calories;
        foodform.querySelector("[name='fat']").value = item.fat;
        foodform.querySelector("[name='carb']").value = item.carbs;
        foodform.querySelector("[name='prot']").value = item.protein;
        dialog.showModal();
    }
});

cancel_btn.addEventListener("click", () => {
    dialog.close();
    dialog.querySelector("form").reset();
    error_message.textContent = "";
    addfood_btn.blur();
});


/* form button events */ // endpoint: POST
submit_btn.addEventListener("click", async (e) => {
    const method = submit_btn.dataset.method;
    let endpoint = "api/foodlist/food";
    const id = cur_item.dataset.id;

    if (method == "PATCH") endpoint += `/${id}`

    const form_data = new FormData(foodform);
    const form_obj = Object.fromEntries(form_data.entries());

    if (!foodform.checkValidity()) {
        foodform.reportValidity();
        return;
    }

    const res = await fetch(endpoint, {
        method: method,
        headers: { "Content-Type" : "application/json" },
        body: JSON.stringify(form_obj)
    });

    const data = await res.json();

        if (data.success) {
            if (method == "POST") {
                foodlist_array.add(data.item);
                foodlist.appendChild(FoodUI.createItem(data.item));
            } 
            else if (method == "PATCH") {
                foodlist_array.updateFood(data.item.food_id, data.item);
                FoodUI.updateItem(data.item, cur_item);
            }
            dialog.close();
            foodform.reset();
        } else {
            error_message.textContent = data.errmsg;
        }
})


async function fetchFoodList() {
    const res = await fetch("/api/foodlist/food?last_item=0");
    const data = await res.json();

    if (data.success) {
        for (let i = 0; i < data.items.length; i++) {
            foodlist_array.add(data.items[i]);
            foodlist.appendChild(FoodUI.createItem(data.items[i]));
        }
        /* observer.observe(document.querySelector(".food-list").lastElementChild); */
        total_foodcount = data.count;
        prev_index = data.items.length;
    } else {
        alert(data.errmsg);
    }
}

delete_btn.addEventListener("click", async () => {
    /* const id = foodform.querySelector("[name='id']").value; */
    const id = cur_item.dataset.id;

    const res = await fetch(`/api/foodlist/food/${id}`, {
        method: "DELETE"   
    });

    let data = await res.json();

    if (data.success) {
        foodlist_array.delete(data.id);
        cur_item.remove();
        dialog.close();
    } else {
        alert(data.errmsg);
    }
});


fetchFoodList();