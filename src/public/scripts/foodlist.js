import { FoodManager } from "./foodmanager.js";
import * as FoodUI from "./ui/foodUI.js";


const foodlist_array = new FoodManager()
const s_foodlist_array = new FoodManager()

let total_count;
let s_total_count;

let cur_listitem = null;
let cur_observed_listitem = null;
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
    return flag_searching ? s_foodlist_array : foodlist_array;
}

function getActiveTotalCount() {
    return flag_searching ? s_total_count : total_count;
}


const observer = new IntersectionObserver(async entries => {
    const last_entry = entries[0];
    const active_foodlist_array = getActiveFoodList();

    if (!last_entry.isIntersecting || (active_foodlist_array.size() == getActiveTotalCount())) return;

    observer.unobserve(last_entry.target);
    cur_observed_listitem = null;

    await fetchMoreFood(glob_searchterm);
    if (active_foodlist_array.size() !== getActiveTotalCount()) {
        observer.observe(foodlist.lastElementChild);
        cur_observed_listitem = foodlist.lastElementChild;
    }
});

/* icon button events */
// add food button event
addfood_btn.addEventListener("click", () => {
    dlg_title.textContent = "Add New Food";
    delete_btn.style.visibility = "hidden";
    submit_btn.textContent = "Add Food";
    submit_btn.dataset.method = "POST";
    dialog.showModal();
});

// edit button event
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

// cancel dialog event (cancel button)
cancel_btn.addEventListener("click", () => {
    dialog.close();
    foodform.reset();
    error_message.textContent = "";
    addfood_btn.blur();
});

// cancel dialog event (click outside of dialog)
dialog.addEventListener("click", (e) => {
    const dialog_dimensions = dialog.getBoundingClientRect();
    if (
        e.clientX < dialog_dimensions.left  ||
        e.clientX > dialog_dimensions.right ||
        e.clientY < dialog_dimensions.top   ||
        e.clientY > dialog_dimensions.bottom
    ) {
        dialog.close();
        foodform.reset();
        error_message.textContent = "";
        addfood_btn.blur();
    }
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
                if (foodlist_array.size() == total_count) {
                    foodlist_array.add(data.item);
                    foodlist.appendChild(FoodUI.createListItem(data.item));
                    total_count++;
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

delete_btn.addEventListener("click", async () => {
    const id = cur_listitem.dataset.id;

    const res = await fetch(`/api/foodlist/food/${id}`, {
        method: "DELETE"   
    });

    let data = await res.json();

    if (data.success) {
        let total = getActiveTotalCount(); 

        getActiveFoodList().delete(data.id);
        if (flag_searching) {
            if (foodlist_array.getFoodById(data.id)) {
                foodlist_array.delete(data.id);
                total_count--;
            }
        }
        total--;
        cur_listitem.remove();
        dialog.close();
        foodform.reset();
    } else {
        error_message.textContent = data.errmsg;
    }
});


// fetch food 
async function fetchInitFood() {
    const res = await fetch("/api/foodlist/food?last_item=0");
    const data = await res.json();

    if (data.success) {
        if (data.items.length == 0) {
            total_count = 0;
            return;
        }
        for (let i = 0; i < data.items.length; i++) {
            foodlist_array.add(data.items[i]);
            foodlist.appendChild(FoodUI.createListItem(data.items[i]));
        }
        observer.observe(foodlist.lastElementChild);
        cur_observed_listitem = foodlist.lastElementChild;
        total_count = data.count;
    } else {
        alert(data.errmsg);
    }
}

async function fetchMoreFood(str = undefined) {
    let activelist = getActiveFoodList();
    let last_listitem = activelist.foods[activelist.size() - 1];
    const res = await fetch(`api/foodlist/food?last_item=${last_listitem.food_id}&query=${str}`);
    const data = await res.json();

    if (data.success) {
        for (let i = 0; i < data.items.length; i++) {
            activelist.add(data.items[i]);
            foodlist.appendChild(FoodUI.createListItem(data.items[i]));
        }
    } else {
        alert(data.errmsg);
    }
}

search_input.addEventListener("input", async (e) => {
    let searchterm = e.target.value;
    glob_searchterm = searchterm;
    foodlist.replaceChildren();
    if (cur_observed_listitem) {
        observer.unobserve(cur_observed_listitem);
        cur_observed_listitem = null;
    }
    s_foodlist_array.deleteAll();

    if (searchterm.length == 0) { // resets state of page to "init" state
        flag_searching = false;
        glob_searchterm = undefined;
        for (let i = 0; i < foodlist_array.foods.length; i++) {
            foodlist.appendChild(FoodUI.createListItem(foodlist_array.foods[i]));
        }
        observer.observe(foodlist.lastElementChild);
        cur_observed_listitem = foodlist.lastElementChild;
        foodlist.scrollTop = 0;
    } else {
        const res = await fetch(`/api/foodlist/food?last_item=0&query=${searchterm}`); 
        const data = await res.json();

        if (data.success) {
            if (data.count == 0) return;
            flag_searching = true;
            for (let i = 0; i < data.items.length; i++) {
                s_foodlist_array.add(data.items[i]);
                foodlist.appendChild(FoodUI.createListItem(data.items[i]));
            }
            observer.observe(foodlist.lastElementChild);
            cur_observed_listitem = foodlist.lastElementChild;
            s_total_count = data.count;
        } else {
            alert(data.errmsg);
        }
    }
});

fetchInitFood();