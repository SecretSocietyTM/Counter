import * as ui from "./ui/foodlistUI.js";
import * as api from "./api/foodlistAPI.js";
import { FoodManager } from "./util/shared/foodmanager.js";

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
const editfood_submit_btn = document.getElementById("editfood_submit_btn");
const addfood_submit_btn = document.getElementById("addfood_submit_btn");
const foodform = document.getElementById("foodform");
const error_message = document.getElementById("error_message");

const DIALOG_UI = Object.freeze({
    dialog: dialog,
    title: dlg_title,
    open_btn: addfood_btn,
    delete_btn: delete_btn,
    edit_btn: editfood_submit_btn,
    add_btn: addfood_submit_btn,
    form: foodform,
    err_msg: error_message
});

const search_input = document.getElementById("searchbar_input");


function getActiveFoodList() {
    return flag_searching ? s_foodlist_array : foodlist_array;
}

function getActiveTotalCount() {
    return flag_searching ? s_total_count : total_count;
}


const observer = new IntersectionObserver(async entries => {
    const last_entry = entries[0];
    const active_foodlist_array = getActiveFoodList();

    if (!last_entry.isIntersecting || 
        (active_foodlist_array.size() == getActiveTotalCount())) return;

    observer.unobserve(last_entry.target);
    cur_observed_listitem = null;

    await fetchMoreFood(glob_searchterm);
    if (active_foodlist_array.size() !== getActiveTotalCount()) {
        observer.observe(foodlist.lastElementChild);
        cur_observed_listitem = foodlist.lastElementChild;
    }
});



// add food button event
addfood_btn.addEventListener("click", () => {
    ui.showDialogAddMode(DIALOG_UI);
});

// edit button event
foodlist.addEventListener("click", (e) => {
    const editfood_btn = e.target.closest(".editfood_btn");
    if (editfood_btn) {
        const li = e.target.closest("li");
        const item = getActiveFoodList().getFoodById(li.dataset.id, "food_id");
        cur_listitem = li;
        ui.setFormUI(foodform, item);
        ui.showDialogEditMode(DIALOG_UI);
    }
});

// cancel dialog event (cancel button)
cancel_btn.addEventListener("click", () => {
    ui.closeDialog(DIALOG_UI);
});

// cancel dialog event (click outside of dialog)
dialog.addEventListener("click", (e) => {
    if (ui.isClickingOutside(e, dialog)) {
        ui.closeDialog(DIALOG_UI);
    }
});

/* form button events */
addfood_submit_btn.addEventListener("click", async (e) => {
    const food_data = ui.checkFormValidity(foodform)
    if (!food_data) return;

    const data = await api.addFood(food_data);

    if (data.success) {
        if (!flag_searching) {
            if (foodlist_array.size() == total_count) {
                foodlist_array.add(data.food);
                foodlist.appendChild(ui.createFood(data.food));
            }
        } else {
            if (data.food.name.includes(glob_searchterm) 
                && s_foodlist_array.size() == s_total_count) {
                s_foodlist_array.add(data.food);
                foodlist.appendChild(ui.createFood(data.food));
                s_total_count++;
            }
        }
        total_count++;
        ui.closeDialog(DIALOG_UI);
    } else {
        error_message.textContent = data.errmsg;
    }
});

editfood_submit_btn.addEventListener("click", async (e) => {
    const food_id = cur_listitem.dataset.id;
    const food_data = ui.checkFormValidity(foodform);
    if (!food_data) return;

    const data = await api.editFood(food_id, food_data);

    if (data.success) {
        getActiveFoodList().updateFood(data.food.food_id, data.food);
        if (foodlist_array.getFoodById(data.food.food_id, "food_id")) { 
            foodlist_array.updateFood(data.food.food_id, data.food);
        }
        ui.setFoodUI(cur_listitem, data.food);
        ui.closeDialog(DIALOG_UI); 
    } else {
        error_message.textContent = data.errmsg;
    }
});

delete_btn.addEventListener("click", async () => {
    const food_id = cur_listitem.dataset.id;

    const data = await api.deleteFood(food_id);

    if (data.success) {
        let total = getActiveTotalCount(); 
        total--;
        getActiveFoodList().delete(data.food.food_id, "food_id");
        cur_listitem.remove();
        if (flag_searching) {
            if (foodlist_array.getFoodById(data.food.food_id, "food_id")) {
                foodlist_array.delete(data.food.food_id, "food_id");
                total_count--;
            }
        }
        ui.closeDialog(DIALOG_UI);
    } else {
        error_message.textContent = data.errmsg;
    }
});


// fetch food 
async function fetchInitFood() {
    const data = await api.getFoods(0, undefined);

    if (data.success) {
        if (data.foods.length == 0) {
            total_count = 0;
            return;
        }
        for (let i = 0; i < data.foods.length; i++) {
            foodlist_array.add(data.foods[i]);
            foodlist.appendChild(ui.createFood(data.foods[i]));
        }
        observer.observe(foodlist.lastElementChild);
        cur_observed_listitem = foodlist.lastElementChild;
        total_count = data.count;
    } else {
        alert(data.errmsg);
    }
}

async function fetchMoreFood(searchterm = undefined) {
    let activelist = getActiveFoodList();
    let last_listitem = activelist.foods[activelist.size() - 1];
    
    const data = await api.getFoods(last_listitem.food_id, searchterm);

    if (data.success) {
        for (let i = 0; i < data.foods.length; i++) {
            activelist.add(data.foods[i]);
            foodlist.appendChild(ui.createFood(data.foods[i]));
        }
    } else {
        alert(data.errmsg);
    }
}

search_input.addEventListener("input", async (e) => {
    let searchterm = glob_searchterm = e.target.value;
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
            foodlist.appendChild(ui.createFood(foodlist_array.foods[i]));
        }
        observer.observe(foodlist.lastElementChild);
        cur_observed_listitem = foodlist.lastElementChild;
        foodlist.scrollTop = 0;
    } else {
        const data = await api.getFoods(0, searchterm);

        if (data.success) {
            if (data.count == 0) return;
            flag_searching = true;
            for (let i = 0; i < data.foods.length; i++) {
                s_foodlist_array.add(data.foods[i]);
                foodlist.appendChild(ui.createFood(data.foods[i]));
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