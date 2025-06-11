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

const searchbar = document.getElementById("searchbar");
const search_input = document.getElementById("searchbar_input");


const error_message = document.getElementById("error_message");

const observer = new IntersectionObserver(entries => {
    const last_listitem = entries[0];
    if (!last_listitem.isIntersecting || (cur_foodcount >= total_foodcount)) return;
    console.log("observer1");
    fetchMoreFood();
    observer.unobserve(last_listitem.target);
    if (cur_foodcount !== total_foodcount) {
        observer.observe(foodlist.lastElementChild);
    }
});


const observer2 = new IntersectionObserver(entires => {
    const last_listitem = entries[0];
    if (!last_listitem.isIntersecting || (cur_sfoodcount >= total_sfoodcount)) return;
    console.log("observer2");
    fetchMoreFood(glob_searchterm);
    observer2.unobserve(last_listitem.target);
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
        let item;
        if (flag_searching) {
            item = sfoodlist_array.getFoodById(li.dataset.id);
        } else {
            item = foodlist_array.getFoodById(li.dataset.id);
        }
        // going to need to add some logic here for search items vs non search items
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
                if (flag_searching) {
                    sfoodlist_array.updateFood(data.item.food_id, data.item);
                    FoodUI.updateListItem(data.item, cur_listitem);
                } else {
                    foodlist_array.updateFood(data.item.food_id, data.item);
                    FoodUI.updateListItem(data.item, cur_listitem);
                }

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
    let last_listitem = foodlist_array.foods[cur_foodcount - 1];
    const res = await fetch(`api/foodlist/food?last_item=${last_listitem.food_id}&query=${str}`);
    const data = await res.json();

    if (data.success) {
        for (let i = 0; i < data.items.length; i++) {
            if (flag_searching) {
                sfoodlist_array.add(data.items[i]);
                foodlist.appendChild(FoodUI.createListItem(data.items[i]));
            } else {
                foodlist_array.add(data.items[i]);
                foodlist.appendChild(FoodUI.createListItem(data.items[i]));
            }
        }
        if (flag_searching) {
            cur_sfoodcount = sfoodlist_array.foods.length;
        } else {
            cur_foodcount = foodlist_array.foods.length;
        }
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
        if (flag_searching) {
            sfoodlist_array.delete(data.id);
        } else {
            foodlist_array.delete(data.id);
        }
        cur_listitem.remove();
        dialog.close();
        foodform.reset();
    } else {
        alert(data.errmsg);
    }
});


/* // searchbar
searchbar.addEventListener("keyup", async (e) => {
    let searchterm = e.target.value;
    glob_searchterm = searchterm;
    foodlist.replaceChildren();
    sfoodlist_array.deleteAll();
    if (searchterm.length == 0) { // resets state of page to "init" state
        console.log("limit testing");
        for (let i = 0; i < foodlist_array.foods.length; i++) {
            foodlist.appendChild(FoodUI.createListItem(foodlist_array.foods[i]));
        }
        observer.observe(foodlist.lastElementChild);
        return;
    }
    if (searchterm.length < 2) {
        return;
    }
    const res = await fetch(`/api/foodlist/food?last_item=0&query=${searchterm}`); 
    const data = await res.json();

    if (data.success) {
        for (let i = 0; i < data.items.length; i++) {
            sfoodlist_array.add(data.items[i]);
            foodlist.appendChild(FoodUI.createListItem(data.items[i]));
        }
    } else {
        alert(data.errmsg);
    }
}); */

search_input.addEventListener("input", async (e) => {
    let searchterm = e.target.value;
    glob_searchterm = searchterm;
    foodlist.replaceChildren();
    sfoodlist_array.deleteAll();
    if (searchterm.length == 0) { // resets state of page to "init" state
        flag_searching = false;
        console.log("limit testing");
        for (let i = 0; i < foodlist_array.foods.length; i++) {
            foodlist.appendChild(FoodUI.createListItem(foodlist_array.foods[i]));
        }
        observer.observe(foodlist.lastElementChild);
        return;
    }
    if (searchterm.length < 2) {
        return;
    }


    const res = await fetch(`/api/foodlist/food?last_item=0&query=${searchterm}`); 
    const data = await res.json();

    if (data.success) {
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