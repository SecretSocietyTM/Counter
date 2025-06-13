import { FoodManager } from "./foodmanager.js";
import * as FoodUI from "./ui/foodUI.js";


const foodlist_array = new FoodManager()
const sfoodlist_array = new FoodManager() // s stands for search

let total_foodcount;
let total_sfoodcount;

let cur_foodcount = 0;
let cur_sfoodcount = 0;

let cur_listitem;
let glob_searchterm;

// flags
let flag_searching = false;

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

const search_input = document.getElementById("searchbar_input");

const error_message = document.getElementById("error_message");


function getActiveFoodList() {
    return flag_searching ? sfoodlist_array : foodlist_array;
}

// TODO: use or remove
function getCurrentCount() {
    return flag_searching ? cur_sfoodcount : cur_foodcount;
}

function setCurrentCount(count) {
    if (flag_searching) cur_sfoodcount = count;
    else cur_foodcount = count;
}

// TODO: use or remove
function getTotalCount(count) {
    return flag_searching ? total_sfoodcount : total_foodcount;
}

// TODO: use or remove;
function setTotalCount(count) {
    if (flag_searching) total_sfoodcount = count;
    else cur_foodcount = count;
}

const observer = new IntersectionObserver(async entries => {
    const last_listitem = entries[0];
    if (!last_listitem.isIntersecting || (cur_foodcount >= total_foodcount)) return;
    observer.unobserve(last_listitem.target);
    await fetchMoreFood();
    if (cur_foodcount !== total_foodcount) {
        observer.observe(foodlist.lastElementChild);
    }
});


const observer2 = new IntersectionObserver(async entries => {
    const last_listitem = entries[0];
    if (!last_listitem.isIntersecting || (cur_sfoodcount >= total_sfoodcount)) return;
    observer2.unobserve(last_listitem.target);
    await fetchMoreFood(glob_searchterm);
    if (cur_sfoodcount !== total_sfoodcount) {
        observer2.observe(foodlist.lastElementChild);
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
        const item = getActiveFoodList().getFoodById(li.dataset.id);
        cur_listitem = li;
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


/* form button events */
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
                if (!flag_searching) {
                    if (cur_foodcount >= total_foodcount) {
                        foodlist_array.add(data.item);
                        foodlist.appendChild(FoodUI.createListItem(data.item));
                    }
                }
            } 
            else if (method == "PATCH") {
                getActiveFoodList().updateFood(data.item.food_id, data.item);
                if (foodlist_array.getFoodById(data.item.food_id)) foodlist_array.updateFood(data.item.food_id, data.item);
                FoodUI.updateListItem(data.item, cur_listitem);
            }
            dialog.close();
            addfood_btn.blur();
            foodform.reset();
        } else {
            error_message.textContent = data.errmsg;
        }
})


async function fetchInitFood() {
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

async function fetchMoreFood(str = undefined) {
    let activelist = getActiveFoodList();
    let last_listitem = activelist.foods[cur_foodcount - 1];
    const res = await fetch(`api/foodlist/food?last_item=${last_listitem.food_id}&query=${str}`);
    const data = await res.json();

    if (data.success) {
        for (let i = 0; i < data.items.length; i++) {
            activelist.add(data.items[i]);
            foodlist.appendChild(FoodUI.createListItem(data.items[i]));
        }
        setCurrentCount(activelist.foods.length);
    } else {
        alert(data.errmsg);
    }
}

delete_btn.addEventListener("click", async () => {
    const id = cur_listitem.dataset.id;

    const res = await fetch(`/api/foodlist/food/${id}`, {
        method: "DELETE"   
    });

    let data = await res.json();

    if (data.success) {
        let cur_count = getCurrentCount();
        let tot_count = getTotalCount(); 

        let active = getActiveFoodList();
        /* getActiveFoodList().delete(data.id); */
        active.delete(data.id);
        if (flag_searching) {
            if (foodlist_array.getFoodById(data.id)) {
                foodlist_array.delete(data.id);
                cur_foodcount--;
                total_foodcount--;
            }
        }
        cur_count--;
        tot_count--;
        cur_listitem.remove();
        dialog.close();
        foodform.reset();
    } else {
        alert(data.errmsg);
    }
});

search_input.addEventListener("input", async (e) => {
    let searchterm = e.target.value;
    glob_searchterm = searchterm;
    foodlist.replaceChildren();
    sfoodlist_array.deleteAll();
    if (searchterm.length == 0) { // resets state of page to "init" state
        flag_searching = false;
        for (let i = 0; i < foodlist_array.foods.length; i++) {
            foodlist.appendChild(FoodUI.createListItem(foodlist_array.foods[i]));
        }
        observer.observe(foodlist.lastElementChild);
        return;
    }

    const res = await fetch(`/api/foodlist/food?last_item=0&query=${searchterm}`); 
    const data = await res.json();

    if (data.success) {
        if (data.count == 0) return;
            flag_searching = true;
            for (let i = 0; i < data.items.length; i++) {
                sfoodlist_array.add(data.items[i]);
                foodlist.appendChild(FoodUI.createListItem(data.items[i]));
            }
            observer2.observe(foodlist.lastElementChild);
            total_sfoodcount = data.count;
            cur_sfoodcount = sfoodlist_array.foods.length;
    } else {
        alert(data.errmsg);
    }
});

fetchInitFood();