import { FoodManager } from "./foodmanager.js";
import * as FoodUI from "./ui/foodUI.js";


const foodlist_array = new FoodManager()
let total_foodcount;
let cur_foodcount = 0;
let cur_listitem;

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

const searchbar = document.getElementById("searchbar");


const error_message = document.getElementById("error_message");

const observer = new IntersectionObserver(entries => {
    const last_listitem = entries[0];
    if (!last_listitem.isIntersecting || (cur_foodcount >= total_foodcount)) return;
    console.log("THE EVENT HAS BEEN TRIGGERED");
    fetchMoreFood();
    observer.unobserve(last_listitem.target);
    if (cur_foodcount !== total_foodcount) {
        observer.observe(foodlist.lastElementChild);
    }
});

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
        const item = foodlist_array.getFoodById(li.dataset.id);
        cur_listitem = li;
        /* foodform.querySelector("[name='id']").value = item.food_id; */
        FoodUI.updateForm(foodform, item);
        dialog.showModal();
    }
});

cancel_btn.addEventListener("click", () => {
    dialog.close();
    foodform.reset();
    error_message.textContent = "";
    addfood_btn.blur();
});


/* form button events */ // endpoint: POST
submit_btn.addEventListener("click", async (e) => {
    const method = submit_btn.dataset.method;
    let endpoint = "api/foodlist/food";

    if (method == "PATCH") endpoint += `/${cur_listitem.dataset.id}`

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
                if (cur_foodcount >= total_foodcount) {
                    foodlist_array.add(data.item);
                    foodlist.appendChild(FoodUI.createListItem(data.item));
                }
            } 
            else if (method == "PATCH") {
                foodlist_array.updateFood(data.item.food_id, data.item);
                FoodUI.updateListItem(data.item, cur_listitem);
            }
            dialog.close();
            addfood_btn.blur();
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
            foodlist.appendChild(FoodUI.createListItem(data.items[i]));
        }
        observer.observe(foodlist.lastElementChild);
        total_foodcount = data.count;
        cur_foodcount = foodlist_array.foods.length;
    } else {
        alert(data.errmsg);
    }
}

async function fetchMoreFood() {
    let last_listitem = foodlist_array.foods[cur_foodcount - 1];
    const res = await fetch(`api/foodlist/food?last_item=${last_listitem.food_id}`);
    const data = await res.json();

    if (data.success) {
        for (let i = 0; i < data.items.length; i++) {
            foodlist_array.add(data.items[i]);
            foodlist.appendChild(FoodUI.createListItem(data.items[i]));
        }
        cur_foodcount = foodlist_array.foods.length;
    } else {
        alert(data.errmsg);
    }
}

delete_btn.addEventListener("click", async () => {
    /* const id = foodform.querySelector("[name='id']").value; */
    const id = cur_listitem.dataset.id;

    const res = await fetch(`/api/foodlist/food/${id}`, {
        method: "DELETE"   
    });

    let data = await res.json();

    if (data.success) {
        foodlist_array.delete(data.id);
        cur_listitem.remove();
        dialog.close();
        foodform.reset();
    } else {
        alert(data.errmsg);
    }
});


fetchFoodList();