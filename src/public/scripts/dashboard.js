import { FoodManager } from "./foodmanager.js";
import * as FoodUI from "./ui/foodUI.js";

const searchlist_array = new FoodManager()

let meal_id = null;

// buttons
const addfood_btns = document.querySelectorAll(".addfood_btn");

// search dialog elements
const search_dialog = document.getElementById("search_dialog");
const search_input = document.getElementById("searchbar_input");
const searchlist = document.getElementById("searchlist");


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